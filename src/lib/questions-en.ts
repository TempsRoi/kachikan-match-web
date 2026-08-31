import {
  optionLabel,
  personalityFor,
  questions,
  type AxisKey,
  type PersonalityProfile,
  type Question,
} from "@/lib/questions";

const categories = {
  休日: "Time off",
  コミュニケーション: "Communication",
  お金: "Money",
  信頼: "Trust",
  行動: "Everyday choices",
  人付き合い: "Relationships",
  生活: "Daily life",
  将来: "The future",
} as const;

const englishRaw: [
  question: string,
  options: [string, string, string, string],
][] = [
  [
    "How would you spend a day off with no plans?",
    [
      "Spend it alone doing my favorite things",
      "Invite friends to do something together",
      "Make one plan to see someone",
      "Mostly be alone, and message someone if I feel like it",
    ],
  ],
  [
    "What is your natural texting style?",
    [
      "Reply fairly soon after I notice a message",
      "Reply to several messages when I have time",
      "Mostly text when there is something specific to discuss",
      "Share little updates throughout the day",
    ],
  ],
  [
    "If you disagree on where to travel together, what would you do?",
    [
      "Compare the budget and travel time",
      "Talk about how each person feels",
      "Prioritize the person who is more excited",
      "List the constraints and find an option you can both accept",
    ],
  ],
  [
    "If you had $10,000 to use however you wanted, what would you do?",
    [
      "Save or invest it",
      "Travel somewhere I have never been",
      "Start a new hobby or course",
      "Make everyday life a little more comfortable",
    ],
  ],
  [
    "If you were going to be 10 minutes late, what would you do?",
    [
      "Message as soon as I realize I will be late",
      "Check my exact arrival time and send the details",
      "Hurry first, then explain when I arrive",
      "Let it play out—10 minutes is not a big deal",
    ],
  ],
  [
    "When something is bothering you, what do you tend to do?",
    [
      "Talk it through with someone to sort out my feelings",
      "Process it alone, then talk if I need to",
      "Think it through myself, then ask for an opinion",
      "Share a little with someone I trust",
    ],
  ],
  [
    "On a group trip, which role feels most natural?",
    [
      "Plan the places and timing in detail",
      "Follow someone else's plan",
      "Set a loose outline and leave room to improvise",
      "Decide together once we get there",
    ],
  ],
  [
    "Which kind of gift would make you happiest?",
    [
      "Something practical I can use for a long time",
      "Something I mentioned wanting before",
      "An experience we can enjoy together",
      "Something that shows the thought behind it",
    ],
  ],
  [
    "When you disagree with someone, what comes first?",
    [
      "Lay out the reasons and work toward a conclusion",
      "Talk while checking how the other person feels",
      "Make sure the other person does not feel hurt",
      "Take time to cool down, then discuss it",
    ],
  ],
  [
    "How do you prefer to recover after an exhausting day?",
    [
      "Spend quiet time alone",
      "Talk a little with someone close to me",
      "Spend time with someone and recharge together",
      "Focus on a hobby, but meet up if invited",
    ],
  ],
  [
    "How do you react to a last-minute invitation?",
    [
      "If I am free, I am ready to go",
      "It depends on the plan and my mood",
      "I would rather know by the day before",
      "I prefer to make plans well in advance",
    ],
  ],
  [
    "What makes a close relationship feel good to you?",
    [
      "The comfort of familiar routines",
      "Being able to speak honestly and calmly",
      "Enjoying new things together",
      "Inspiring each other to grow",
    ],
  ],
  [
    "How would you choose a place to eat together?",
    [
      "Compare the budget and reviews",
      "Prioritize the food and convenience",
      "Ask what the other person wants",
      "Choose based on the mood and atmosphere",
    ],
  ],
  [
    "When making an important decision, what guides you most?",
    [
      "Gather and compare information",
      "Write down the benefits and concerns",
      "Talk to someone I trust",
      "Ultimately follow what feels right",
    ],
  ],
  [
    "If you started a new hobby, what would you choose?",
    [
      "Go deeper into something I already enjoy",
      "Choose something nearby and easy to keep up",
      "Try something a friend recommends",
      "Try something completely unfamiliar",
    ],
  ],
  [
    "What is your ideal level of closeness with friends?",
    [
      "Stay in touch often",
      "Meet up regularly",
      "Pick up naturally even after a long time apart",
      "Know we can reach out when we need each other",
    ],
  ],
  [
    "What is your room or desk usually like?",
    [
      "Everything has a place and stays organized",
      "I keep the essentials easy to find",
      "I do a bigger cleanup when it starts bothering me",
      "Some clutter is fine as long as I know where things are",
    ],
  ],
  [
    "Before going somewhere new, how much do you research?",
    [
      "I look up routes and backup options in detail",
      "I check transportation and opening hours",
      "I learn the basics and decide the rest there",
      "I do almost no research and just go",
    ],
  ],
  [
    "How would you approach someone who once broke your trust?",
    [
      "Confirm the facts and how it can be prevented",
      "Hear their reasons, then decide what comes next",
      "Consider the history of the relationship too",
      "Avoid rushing a decision until my feelings settle",
    ],
  ],
  [
    "If you had a chance to make a major change in your environment, what would you do?",
    [
      "Prioritize the security of my current situation",
      "Consider it if the conditions were right",
      "Try it if I could grow, even if I felt uneasy",
      "When in doubt, choose the path with more change",
    ],
  ],
  [
    "When you think a few years ahead, what feels most natural?",
    [
      "Set specific goals and steps",
      "Choose a broad direction",
      "Adapt as circumstances change",
      "Focus more on the present than the distant future",
    ],
  ],
  [
    "What makes time with someone feel especially good?",
    [
      "Talking a lot and sharing how we feel",
      "Doing an activity together",
      "Being in the same space while doing our own things",
      "Knowing we can support each other when needed",
    ],
  ],
  [
    "How do you feel about surprises?",
    [
      "I would rather discuss things in advance",
      "I enjoy small surprises",
      "It depends, but they can be exciting",
      "The more unexpected, the more exciting",
    ],
  ],
  [
    "What matters most to you in life?",
    [
      "A secure and comfortable life",
      "A steady life with people I trust",
      "Continuing to learn and grow",
      "Freedom to move and experience many things",
    ],
  ],
];

export const englishQuestions: Question[] = questions.map(
  (question, index) => ({
    ...question,
    category:
      categories[question.category as keyof typeof categories] ??
      question.category,
    question: englishRaw[index][0],
    options: question.options.map((option, optionIndex) => ({
      ...option,
      label: englishRaw[index][1][optionIndex],
    })),
  }),
);

export const englishAxes = {
  connection: {
    name: "Connection",
    negative: "Personal space",
    positive: "Shared time",
    negativeLabel: "Independent",
    positiveLabel: "Together-oriented",
  },
  structure: {
    name: "Structure",
    negative: "Go with the flow",
    positive: "Plan ahead",
    negativeLabel: "Flexible",
    positiveLabel: "Structured",
  },
  decision: {
    name: "Decisions",
    negative: "Reason and clarity",
    positive: "Feelings and empathy",
    negativeLabel: "Reason-led",
    positiveLabel: "Feeling-led",
  },
  novelty: {
    name: "Novelty",
    negative: "Stability and continuity",
    positive: "Change and experience",
    negativeLabel: "Stability-seeking",
    positiveLabel: "Experience-seeking",
  },
} satisfies Record<
  AxisKey,
  {
    name: string;
    negative: string;
    positive: string;
    negativeLabel: string;
    positiveLabel: string;
  }
>;

const styleCopy: Record<string, [string, string]> = {
  "shared-structured-feeling-stable": [
    "Thoughtful Caregiver",
    "You notice what people need and create a sense of ease.",
  ],
  "shared-structured-feeling-explore": [
    "Experience Planner",
    "You turn shared excitement into plans people can enjoy together.",
  ],
  "shared-structured-reason-stable": [
    "Steady Coordinator",
    "You organize conversations into dependable ways forward.",
  ],
  "shared-structured-reason-explore": [
    "Curious Organizer",
    "You turn interesting ideas into plans everyone can join.",
  ],
  "shared-flexible-feeling-stable": [
    "Gentle Companion",
    "You meet people where they are and make closeness feel natural.",
  ],
  "shared-flexible-feeling-explore": [
    "Warm Spark",
    "You amplify the fun and feeling in spontaneous moments.",
  ],
  "shared-flexible-reason-stable": [
    "Conversation Balancer",
    "You talk things through and find an answer that works in real life.",
  ],
  "shared-flexible-reason-explore": [
    "Idea Connector",
    "You connect people and possibilities with easy curiosity.",
  ],
  "independent-structured-feeling-stable": [
    "Quiet Supporter",
    "You show care through dependable actions and consistency.",
  ],
  "independent-structured-feeling-explore": [
    "Purposeful Enthusiast",
    "You follow what matters to you with focus and heart.",
  ],
  "independent-structured-reason-stable": [
    "Grounded Architect",
    "You think carefully and build choices that last.",
  ],
  "independent-structured-reason-explore": [
    "Prepared Explorer",
    "You research the unknown and turn curiosity into a confident step.",
  ],
  "independent-flexible-feeling-stable": [
    "Easygoing Comforter",
    "You respect each person's pace and offer calm support.",
  ],
  "independent-flexible-feeling-explore": [
    "Free-Spirited Adventurer",
    "You follow what moves you and welcome fresh experiences.",
  ],
  "independent-flexible-reason-stable": [
    "Quiet Observer",
    "You take time to understand before offering a thoughtful response.",
  ],
  "independent-flexible-reason-explore": [
    "Independent Experimenter",
    "You test interesting ideas in your own original way.",
  ],
};

const worldCopy: Record<string, [string, string]> = {
  cafe: [
    "Café",
    "You value good conversation and the feeling of simply being together.",
  ],
  traveler: ["Traveler", "New places and experiences energize you."],
  forest: [
    "Forest",
    "You build trust gradually and value unforced connection.",
  ],
  lighthouse: [
    "Lighthouse",
    "You feel at ease when direction and roles are clear.",
  ],
  fire: ["Campfire", "You draw energy from connection and shared feelings."],
  library: [
    "Library",
    "You prefer thoughtful reflection and meaningful conversation.",
  ],
  sea: ["Sea", "You value freedom, adaptability, and being yourself."],
  garden: [
    "Garden",
    "You cultivate life and relationships with care and balance.",
  ],
};

export function englishProfile(answers: number[]) {
  const profile = personalityFor(answers);
  const [styleName, tagline] = styleCopy[profile.style.key];
  const [worldName, worldDesc] = worldCopy[profile.world.key];
  const mappedAxes = profile.axes.map((axis) => {
    const copy = englishAxes[axis.key];
    return {
      ...axis,
      name: copy.name,
      label: axis.sign > 0 ? copy.positive : copy.negative,
      shortLabel: axis.sign > 0 ? copy.positiveLabel : copy.negativeLabel,
      description:
        axis.sign > 0
          ? `You tend toward ${copy.positive.toLowerCase()}.`
          : `You tend toward ${copy.negative.toLowerCase()}.`,
    };
  });
  const evidence = profile.evidence.map((item) => {
    const index = questions.findIndex(
      (question) => question.id === item.questionId,
    );
    const question = englishQuestions[index];
    const axis =
      mappedAxes.find(
        (candidate) => candidate.key === questions[index].primaryAxis,
      ) ?? mappedAxes[0];
    return {
      ...item,
      question: question.question,
      answer: optionLabel(question, answers[index]),
      axis: axis.name,
      insight: axis.description,
    };
  });
  return {
    ...profile,
    style: { ...profile.style, name: styleName, tagline },
    world: { ...profile.world, name: worldName, desc: worldDesc },
    axes: mappedAxes,
    strongestAxis:
      mappedAxes.find((axis) => axis.key === profile.strongestAxis.key) ??
      mappedAxes[0],
    evidence,
  } as PersonalityProfile;
}

// Fail fast during development if a future question edit is not localized.
if (
  englishRaw.length !== questions.length ||
  englishQuestions.some((question) => question.options.length !== 4)
) {
  throw new Error(
    "The English question set must contain 24 questions with four options each.",
  );
}
