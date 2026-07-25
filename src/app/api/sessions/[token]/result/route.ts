import { NextResponse } from "next/server";
import { adminDb, authenticatedUid } from "@/lib/firebase-admin";
import { questions } from "@/lib/questions";

export async function GET(
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
  const { token } = await params;
  const tokenSnap = await db.collection("publicTokens").doc(token).get();
  const sessionId = tokenSnap.data()?.sessionId as string | undefined;
  if (!sessionId)
    return NextResponse.json(
      { error: "結果が見つかりません" },
      { status: 404 },
    );
  const ref = db.collection("sessions").doc(sessionId);
  const sessionSnap = await ref.get();
  const session = sessionSnap.data();
  if (
    !session ||
    (session.creatorUserId !== uid && session.partnerUserId !== uid)
  )
    return NextResponse.json({ error: "閲覧できません" }, { status: 403 });
  if (session.status !== "completed")
    return NextResponse.json(
      { error: "相手の回答を待っています" },
      { status: 409 },
    );
  const [answerSnap, predictionSnap] = await Promise.all([
    ref.collection("answers").get(),
    ref.collection("predictions").get(),
  ]);
  const answerMap = new Map(
    answerSnap.docs.map((doc) => [doc.id, Number(doc.data().answerValue)]),
  );
  const predictionMap = new Map(
    predictionSnap.docs.map((doc) => [
      doc.id,
      Number(doc.data().predictedAnswerValue),
    ]),
  );
  const predictionQuestions = questions.filter((q) => q.prediction);
  return NextResponse.json({
    creator: session.creatorName,
    partner: session.partnerName,
    answers: questions.map((q) => answerMap.get(`creator_${q.id}`)),
    partnerAnswers: questions.map((q) => answerMap.get(`partner_${q.id}`)),
    predictions: predictionQuestions.map((q) =>
      predictionMap.get(`creator_${q.id}`),
    ),
    partnerPredictions: predictionQuestions.map((q) =>
      predictionMap.get(`partner_${q.id}`),
    ),
  });
}
