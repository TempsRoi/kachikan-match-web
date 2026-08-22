import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, authenticatedUid } from "@/lib/firebase-admin";
import {
  personalityFor,
  questionSetFor,
  SCORING_VERSION,
  worldFor,
} from "@/lib/questions";

const schema = z.object({
  role: z.enum(["creator", "partner"]),
  answers: z.array(z.number().int().min(0).max(3)).length(24),
  predictions: z.array(z.number().int().min(0).max(3)).length(8),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const uid = await authenticatedUid(request);
  const db = adminDb();
  if (!uid)
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  if (!db)
    return NextResponse.json(
      { error: "Firebase Adminが未設定です" },
      { status: 503 },
    );
  try {
    const input = schema.parse(await request.json());
    const { token } = await params;
    const tokenSnap = await db.collection("publicTokens").doc(token).get();
    const sessionId = tokenSnap.data()?.sessionId as string | undefined;
    if (!sessionId) throw new Error("not-found");
    const ref = db.collection("sessions").doc(sessionId);
    const snap = await ref.get();
    const data = snap.data();
    const ownerId =
      input.role === "creator" ? data?.creatorUserId : data?.partnerUserId;
    if (!data || ownerId !== uid || data.status === "completed")
      return NextResponse.json({ error: "保存できません" }, { status: 403 });
    const scoringVersion = data.scoringVersion ?? "v1";
    const activeQuestions = questionSetFor(scoringVersion);
    const batch = db.batch();
    const now = FieldValue.serverTimestamp();
    input.answers.forEach((value, index) => {
      const questionId = activeQuestions[index].id;
      batch.set(ref.collection("answers").doc(`${input.role}_${questionId}`), {
        participantRole: input.role,
        questionId,
        answerValue: String(value),
        createdAt: now,
        updatedAt: now,
      });
    });
    activeQuestions
      .filter((q) => q.prediction)
      .forEach((question, index) => {
        batch.set(
          ref.collection("predictions").doc(`${input.role}_${question.id}`),
          {
            predictorRole: input.role,
            targetRole: input.role === "creator" ? "partner" : "creator",
            questionId: question.id,
            predictedAnswerValue: String(input.predictions[index]),
            createdAt: now,
            updatedAt: now,
          },
        );
      });
    const participantResult =
      scoringVersion === SCORING_VERSION ? personalityFor(input.answers) : null;
    batch.update(ref.collection("participants").doc(input.role), {
      worldKey: participantResult?.world.key ?? worldFor(input.answers).key,
      styleKey: participantResult?.style.key ?? null,
      axisScores: participantResult
        ? Object.fromEntries(
            participantResult.axes.map((axis) => [axis.key, axis.raw]),
          )
        : null,
      scoringVersion,
      completedAt: now,
    });
    batch.update(
      ref,
      input.role === "creator"
        ? { status: "waiting", updatedAt: now }
        : { status: "completed", updatedAt: now, completedAt: now },
    );
    await batch.commit();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "回答を保存できませんでした" },
      { status: 400 },
    );
  }
}
