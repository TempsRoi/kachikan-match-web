import assert from "node:assert/strict";
import {
  axes,
  legacyQuestions,
  personalityFor,
  personalityStyles,
  questionSetFor,
  questions,
  SCORING_VERSION,
  worldFor,
} from "../src/lib/questions.ts";

assert.equal(questions.length, 24, "v2 must contain 24 questions");
assert.equal(legacyQuestions.length, 24, "v1 must retain 24 questions");
assert.equal(
  personalityStyles.length,
  16,
  "all 16 style combinations are required",
);
assert.equal(new Set(personalityStyles.map((style) => style.key)).size, 16);
assert.equal(questionSetFor("v1"), legacyQuestions);
assert.equal(questionSetFor(SCORING_VERSION), questions);

for (const axis of axes) {
  const axisQuestions = questions.filter(
    (question) => question.primaryAxis === axis.key,
  );
  assert.equal(axisQuestions.length, 6, `${axis.name} must have 6 questions`);
}

for (const question of questions) {
  assert.equal(
    question.options.length,
    4,
    `${question.id} must have 4 options`,
  );
  const values = question.options.map((option) => {
    assert.ok(option.label.trim(), `${question.id} contains an empty option`);
    assert.equal(option.score?.axis, question.primaryAxis);
    return option.score?.value;
  });
  assert.deepEqual(
    [...values].sort((a, b) => Number(a) - Number(b)),
    [-2, -1, 1, 2],
    `${question.id} must use -2, -1, +1 and +2 once each`,
  );
}

function answersForSigns(signs) {
  return questions.map((question) => {
    const desiredSign = signs[question.primaryAxis ?? ""];
    const answer = question.options.findIndex(
      (option) => option.score?.value === desiredSign * 2,
    );
    assert.notEqual(answer, -1);
    return answer;
  });
}

for (const style of personalityStyles) {
  const profile = personalityFor(answersForSigns(style.signs));
  assert.equal(profile.style.key, style.key, `${style.name} must be reachable`);
  assert.equal(profile.axes.length, 4);
  assert.equal(profile.evidence.length, 3);
}

const allNegative = personalityFor(
  answersForSigns({
    connection: -1,
    structure: -1,
    decision: -1,
    novelty: -1,
  }),
);
assert.equal(allNegative.style.key, "independent-flexible-reason-stable");
assert.ok(allNegative.axes.every((axis) => axis.raw === -12));

const allPositive = personalityFor(
  answersForSigns({
    connection: 1,
    structure: 1,
    decision: 1,
    novelty: 1,
  }),
);
assert.equal(allPositive.style.key, "shared-structured-feeling-explore");
assert.ok(allPositive.axes.every((axis) => axis.raw === 12));

assert.equal(
  worldFor(Array(24).fill(0)).name,
  "カフェ",
  "legacy scoring must remain stable",
);

const counts = new Map(personalityStyles.map((style) => [style.key, 0]));
let seed = 20260822;
const random = () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 4294967296;
};
const simulations = 100_000;
for (let index = 0; index < simulations; index += 1) {
  const answers = questions.map(() => Math.floor(random() * 4));
  const key = personalityFor(answers).style.key;
  counts.set(key, (counts.get(key) ?? 0) + 1);
}
for (const [styleKey, count] of counts) {
  const percentage = (count / simulations) * 100;
  assert.ok(
    percentage >= 4 && percentage <= 9,
    `${styleKey} distribution is unexpectedly biased: ${percentage.toFixed(2)}%`,
  );
}

console.log("Personality scoring v2 validation passed.");
console.table(
  [...counts].map(([style, count]) => ({
    style,
    percentage: `${((count / simulations) * 100).toFixed(2)}%`,
  })),
);
