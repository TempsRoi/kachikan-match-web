import { NextResponse } from "next/server";
import { contentVersionFor, normalizeLocale } from "@/lib/locales";
import { questionSetFor } from "@/lib/questions";
import { authorizedReportSession, recoveryCodeFor } from "@/lib/report-access";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const access = await authorizedReportSession(request, token);
  if ("error" in access) {
    const status =
      access.error === "database-unavailable"
        ? 503
        : access.error === "not-found"
          ? 404
          : 403;
    return NextResponse.json({ error: "閲覧できません" }, { status });
  }
  const { db, sessionId, session, accessExpiresAt } = access;
  const ref = db.collection("sessions").doc(sessionId);
  if (session.status !== "completed")
    return NextResponse.json(
      { error: "相手の回答を待っています" },
      { status: 409 },
    );
  const scoringVersion = session.scoringVersion ?? "v1";
  const locale = normalizeLocale(session.locale);
  const questions = questionSetFor(scoringVersion);
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
    scoringVersion,
    locale,
    contentVersion: session.contentVersion ?? contentVersionFor(locale),
    paid: Boolean(accessExpiresAt),
    accessExpiresAt: accessExpiresAt?.toISOString() ?? null,
    recoveryCode: accessExpiresAt ? recoveryCodeFor(sessionId) : null,
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
