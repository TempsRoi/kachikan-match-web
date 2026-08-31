import { buildEnglishReport } from "@/lib/english-report";
import { createEnglishReportPdf } from "@/lib/english-report-pdf";
import { authorizedReportSession, recoveryCodeFor } from "@/lib/report-access";
import { englishQuestions } from "@/lib/questions-en";

export const runtime = "nodejs";

function pdfSafeName(value: string, fallback: string) {
  const safe = value.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, "").trim();
  return safe || fallback;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const access = await authorizedReportSession(request, token);
  if ("error" in access)
    return Response.json(
      { error: "You do not have access to this report." },
      { status: access.error === "not-found" ? 404 : 403 },
    );
  const { db, sessionId, session, accessExpiresAt } = access;
  if (!accessExpiresAt)
    return Response.json(
      { error: "Purchase is required or report access has expired." },
      { status: 402 },
    );
  if (session.locale !== "en" || session.status !== "completed")
    return Response.json(
      { error: "This English report is not available." },
      { status: 409 },
    );

  const ref = db.collection("sessions").doc(sessionId);
  const [answerSnapshot, predictionSnapshot] = await Promise.all([
    ref.collection("answers").get(),
    ref.collection("predictions").get(),
  ]);
  const answerMap = new Map(
    answerSnapshot.docs.map((doc) => [doc.id, Number(doc.data().answerValue)]),
  );
  const predictionMap = new Map(
    predictionSnapshot.docs.map((doc) => [
      doc.id,
      Number(doc.data().predictedAnswerValue),
    ]),
  );
  const predictionQuestions = englishQuestions.filter(
    (question) => question.prediction,
  );
  const answers = englishQuestions.map((question) =>
    answerMap.get(`creator_${question.id}`),
  );
  const partnerAnswers = englishQuestions.map((question) =>
    answerMap.get(`partner_${question.id}`),
  );
  const predictions = predictionQuestions.map((question) =>
    predictionMap.get(`creator_${question.id}`),
  );
  const partnerPredictions = predictionQuestions.map((question) =>
    predictionMap.get(`partner_${question.id}`),
  );
  if (
    [...answers, ...partnerAnswers, ...predictions, ...partnerPredictions].some(
      (value) => !Number.isInteger(value),
    )
  )
    return Response.json(
      { error: "The report data is incomplete." },
      { status: 409 },
    );

  const report = buildEnglishReport({
    creator: pdfSafeName(session.creatorName, "Player 1"),
    partner: pdfSafeName(session.partnerName, "Player 2"),
    answers: answers as number[],
    partnerAnswers: partnerAnswers as number[],
    predictions: predictions as number[],
    partnerPredictions: partnerPredictions as number[],
  });
  const pdf = await createEnglishReportPdf(report, {
    generatedAt: new Date(),
    accessExpiresAt,
    recoveryCode: recoveryCodeFor(sessionId),
  });
  const safeNames = `${session.creatorName}-${session.partnerName}`
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="futarishiru-${safeNames || "report"}.pdf"`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
