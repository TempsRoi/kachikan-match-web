import { closeness, optionLabel } from "@/lib/questions";
import { englishProfile, englishQuestions } from "@/lib/questions-en";

export type EnglishReportInput = {
  creator: string;
  partner: string;
  answers: number[];
  partnerAnswers: number[];
  predictions: number[];
  partnerPredictions: number[];
};

export function buildEnglishReport(input: EnglishReportInput) {
  const { creator, partner, answers, partnerAnswers } = input;
  const creatorProfile = englishProfile(answers);
  const partnerProfile = englishProfile(partnerAnswers);
  const score = closeness(answers, partnerAnswers, englishQuestions.length);
  const label =
    score >= 85
      ? "Very close"
      : score >= 70
        ? "Comfortably close"
        : score >= 50
          ? "Different in energizing ways"
          : "Full of new discoveries";
  const headline =
    score >= 85
      ? "You naturally see many things the same way"
      : score >= 70
        ? "Grounded in common ground, with room for surprise"
        : score >= 50
          ? "The more you talk, the more your worlds can expand"
          : "Two perspectives with plenty to discover";
  const summary =
    score >= 85
      ? "You tend to value similar things. Keep checking in with words instead of assuming you already know what the other person means."
      : score >= 70
        ? "Your core values feel familiar, while your smaller choices leave room for individuality. Let common ground create safety and turn differences into new things to try."
        : score >= 50
          ? "This pairing becomes more interesting when you ask for the reason behind an answer. Curiosity will bring you closer than guessing what the other person feels."
          : "Your starting points may differ, which gives each of you a perspective the other may not have. Talk specifically about comfort, space, and how care is best received.";

  const predictionQuestions = englishQuestions.filter(
    (question) => question.prediction,
  );
  const understanding = (predictions: number[], targetAnswers: number[]) =>
    Math.round(
      (predictions.reduce((sum, value, predictionIndex) => {
        const questionIndex = englishQuestions.indexOf(
          predictionQuestions[predictionIndex],
        );
        const target = targetAnswers[questionIndex];
        return (
          sum +
          (value === target ? 1 : Math.abs(value - target) === 1 ? 0.5 : 0)
        );
      }, 0) /
        predictionQuestions.length) *
        100,
    );

  const categoryScores = [
    ...new Set(englishQuestions.map((question) => question.category)),
  ]
    .map((category) => {
      const indexes = englishQuestions
        .map((question, index) => (question.category === category ? index : -1))
        .filter((index) => index >= 0);
      const points = indexes.reduce(
        (sum, index) =>
          sum +
          (answers[index] === partnerAnswers[index]
            ? 2
            : Math.abs(answers[index] - partnerAnswers[index]) === 1
              ? 1
              : 0),
        0,
      );
      return {
        category,
        score: Math.round((points / (indexes.length * 2)) * 100),
      };
    })
    .sort((a, b) => b.score - a.score);

  const comparison = englishQuestions.map((question, index) => ({
    id: question.id,
    category: question.category,
    question: question.question,
    creatorAnswer: optionLabel(question, answers[index]),
    partnerAnswer: optionLabel(question, partnerAnswers[index]),
    same: answers[index] === partnerAnswers[index],
  }));
  const lowestCategory = categoryScores.at(-1)?.category ?? "your differences";
  const closestCategory = categoryScores[0]?.category ?? "your common ground";

  const playbook = [
    {
      title: "Communication rhythm",
      text:
        answers[1] === partnerAnswers[1]
          ? "Your natural messaging rhythms are similar. Protect that easy rhythm rather than measuring care by message frequency."
          : `${creator} prefers “${optionLabel(englishQuestions[1], answers[1])},” while ${partner} prefers “${optionLabel(englishQuestions[1], partnerAnswers[1])}.” Agree on what a reassuring response looks like on busy days.`,
    },
    {
      title: "Support on difficult days",
      text:
        answers[9] === partnerAnswers[9]
          ? "You recharge in similar ways, which makes it easier to offer the kind of support you would also appreciate."
          : `${creator} recharges by “${optionLabel(englishQuestions[9], answers[9])},” while ${partner} prefers “${optionLabel(englishQuestions[9], partnerAnswers[9])}.” Asking “Do you want company or space?” can prevent a caring gesture from missing the mark.`,
    },
    {
      title: "Plans and the future",
      text:
        answers[20] === partnerAnswers[20]
          ? "You tend to picture the future at a similar level of detail. Making one small plan together can build momentum without pressure."
          : `${creator} chose “${optionLabel(englishQuestions[20], answers[20])},” while ${partner} chose “${optionLabel(englishQuestions[20], partnerAnswers[20])}.” Decide what needs a plan and what can stay open.`,
    },
    {
      title: "How care comes through",
      text:
        answers[21] === partnerAnswers[21]
          ? "You are likely to recognize care in similar moments. Naming one recent moment that felt good will help reinforce it."
          : `${creator} feels good when “${optionLabel(englishQuestions[21], answers[21])},” while ${partner} values “${optionLabel(englishQuestions[21], partnerAnswers[21])}.” Care may be present even when its delivery looks different.`,
    },
  ];

  const actions = [
    `Pick one question from ${lowestCategory} and spend 15 minutes discussing the reasons behind each answer.`,
    `Create one small shared plan inspired by your strongest area, ${closestCategory}.`,
    "Tell each other one recent action that made you feel noticed or cared for.",
  ];

  return {
    ...input,
    creatorProfile,
    partnerProfile,
    score,
    label,
    headline,
    summary,
    predictionQuestions,
    creatorUnderstanding: understanding(input.predictions, partnerAnswers),
    partnerUnderstanding: understanding(input.partnerPredictions, answers),
    categoryScores,
    comparison,
    matches: comparison.filter((item) => item.same),
    differences: comparison.filter((item) => !item.same),
    lowestCategory,
    closestCategory,
    playbook,
    actions,
  };
}
