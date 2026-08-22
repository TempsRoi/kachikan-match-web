export const SCORING_VERSION = "v2" as const;

export type ScoringVersion = "v1" | typeof SCORING_VERSION;
export type AxisKey = "connection" | "structure" | "decision" | "novelty";
export type AxisScore = -2 | -1 | 1 | 2;

export type QuestionOption = {
  label: string;
  score?: {
    axis: AxisKey;
    value: AxisScore;
  };
};

export type Question = {
  id: string;
  category: string;
  question: string;
  options: QuestionOption[];
  prediction: boolean;
  primaryAxis?: AxisKey;
};

export type AxisDefinition = {
  key: AxisKey;
  name: string;
  question: string;
  negative: {
    key: string;
    label: string;
    shortLabel: string;
    description: string;
  };
  positive: {
    key: string;
    label: string;
    shortLabel: string;
    description: string;
  };
  tieBreakerQuestionId: string;
};

export const axes: AxisDefinition[] = [
  {
    key: "connection",
    name: "つながり方",
    question: "人といるとき、どんな距離が心地よい？",
    negative: {
      key: "independent",
      label: "自分のペースを大切にする",
      shortLabel: "自分のペース",
      description: "一人で整える時間を持つことで、自然に人と向き合えます。",
    },
    positive: {
      key: "shared",
      label: "一緒に共有したい",
      shortLabel: "一緒に共有",
      description: "言葉や体験を分かち合うことで、相手との距離が近づきます。",
    },
    tieBreakerQuestionId: "q16",
  },
  {
    key: "structure",
    name: "進め方",
    question: "予定や行動を、どのように組み立てたい？",
    negative: {
      key: "flexible",
      label: "流れに合わせたい",
      shortLabel: "流れに合わせる",
      description: "余白を残し、そのときの状況に合わせて動くのが得意です。",
    },
    positive: {
      key: "structured",
      label: "計画して安心したい",
      shortLabel: "計画して安心",
      description: "見通しを立てることで、落ち着いて力を発揮できます。",
    },
    tieBreakerQuestionId: "q21",
  },
  {
    key: "decision",
    name: "決め方",
    question: "迷ったとき、何を手がかりに決める？",
    negative: {
      key: "reason",
      label: "理由と納得を重視する",
      shortLabel: "理由と納得",
      description: "情報や筋道を整理し、自分も相手も納得できる答えを探します。",
    },
    positive: {
      key: "feeling",
      label: "気持ちと共感を重視する",
      shortLabel: "気持ちと共感",
      description: "正しさだけでなく、その場にいる人の気持ちを大切にします。",
    },
    tieBreakerQuestionId: "q14",
  },
  {
    key: "novelty",
    name: "求めるもの",
    question: "毎日の中で、何に心が動く？",
    negative: {
      key: "stable",
      label: "安心と継続を重視する",
      shortLabel: "安心と継続",
      description: "信頼できる日常や、少しずつ積み重なる関係を大切にします。",
    },
    positive: {
      key: "explore",
      label: "変化と経験を重視する",
      shortLabel: "変化と経験",
      description: "新しい体験や変化から、刺激と成長を受け取ります。",
    },
    tieBreakerQuestionId: "q24",
  },
];

const predictionIndexes = new Set([0, 2, 5, 6, 8, 11, 20, 23]);

const scoredOptions = (
  axis: AxisKey,
  values: [label: string, value: AxisScore][],
): QuestionOption[] =>
  values.map(([label, value]) => ({ label, score: { axis, value } }));

type QuestionInput = {
  category: string;
  question: string;
  axis: AxisKey;
  options: [label: string, value: AxisScore][];
};

const v2Raw: QuestionInput[] = [
  {
    category: "休日",
    question: "予定のない休日、どう過ごしたい？",
    axis: "connection",
    options: [
      ["一人で好きなことをして過ごす", -2],
      ["友達を誘って一緒に楽しむ", 2],
      ["誰かと会う予定を一つ入れる", 1],
      ["基本は一人で、気が向いたら連絡する", -1],
    ],
  },
  {
    category: "コミュニケーション",
    question: "メッセージのやり取りは？",
    axis: "connection",
    options: [
      ["気づいたら、なるべく早く返したい", 1],
      ["落ち着いたときにまとめて返したい", -1],
      ["用事があるときの連絡が中心でいい", -2],
      ["小さなこともこまめに共有したい", 2],
    ],
  },
  {
    category: "休日",
    question: "2人で旅行先を決めるとき、意見が分かれたら？",
    axis: "decision",
    options: [
      ["予算や移動時間を比較して決める", -2],
      ["お互いの気持ちを聞いて決める", 1],
      ["より楽しみにしている方を優先する", 2],
      ["条件を整理して納得できる案を探す", -1],
    ],
  },
  {
    category: "お金",
    question: "100万円を自由に使えるなら？",
    axis: "novelty",
    options: [
      ["貯金や投資に回す", -2],
      ["行ったことのない場所を旅する", 2],
      ["新しい趣味や学びを始める", 1],
      ["暮らしを少し快適に整える", -1],
    ],
  },
  {
    category: "信頼",
    question: "約束に10分遅れそうなときは？",
    axis: "structure",
    options: [
      ["遅れると分かった時点ですぐ連絡する", 1],
      ["到着時刻まで確認して具体的に連絡する", 2],
      ["まず急いで、到着してからひと言伝える", -1],
      ["10分くらいなら状況に任せる", -2],
    ],
  },
  {
    category: "コミュニケーション",
    question: "悩みがあるときは？",
    axis: "connection",
    options: [
      ["誰かに話しながら気持ちを整理する", 2],
      ["一人で整理して、必要ならあとで話す", -2],
      ["まず自分で考え、最後に意見を聞く", -1],
      ["信頼できる人に少し話してみる", 1],
    ],
  },
  {
    category: "行動",
    question: "グループ旅行では？",
    axis: "structure",
    options: [
      ["行き先や時間まで詳しく計画する", 2],
      ["誰かの計画に乗りたい", 1],
      ["大枠だけ決めて余白を残す", -1],
      ["現地で相談しながら決める", -2],
    ],
  },
  {
    category: "人付き合い",
    question: "プレゼントでもらって嬉しいのは？",
    axis: "decision",
    options: [
      ["長く使える実用的な物", -2],
      ["前に欲しいと言っていた物", -1],
      ["一緒に楽しめる体験", 1],
      ["選んだ気持ちが伝わる物", 2],
    ],
  },
  {
    category: "コミュニケーション",
    question: "人と意見が違ったときは？",
    axis: "decision",
    options: [
      ["理由を整理して結論を探す", -2],
      ["相手の気持ちを確認しながら話す", 1],
      ["相手が傷つかないことをまず優先する", 2],
      ["一度冷静になってから話し合う", -1],
    ],
  },
  {
    category: "生活",
    question: "疲れた日の過ごし方は？",
    axis: "connection",
    options: [
      ["一人で静かに過ごして回復する", -2],
      ["身近な人に少し話を聞いてもらう", 1],
      ["誰かと過ごして元気をもらう", 2],
      ["趣味に没頭しつつ、誘われたら会う", -1],
    ],
  },
  {
    category: "行動",
    question: "急な誘いを受けたら？",
    axis: "structure",
    options: [
      ["予定がなければ、その場ですぐ行く", -2],
      ["内容を見て、そのときの気分で決める", -1],
      ["前日までに分かれば参加したい", 1],
      ["できるだけ前もって予定を決めたい", 2],
    ],
  },
  {
    category: "信頼",
    question: "人間関係で心地よいのは？",
    axis: "novelty",
    options: [
      ["いつもと変わらない安心があること", -2],
      ["落ち着いて本音を話せること", -1],
      ["一緒に新しいことを楽しめること", 1],
      ["お互いに刺激を受けて成長できること", 2],
    ],
  },
  {
    category: "お金",
    question: "一緒に行くお店を選ぶときは？",
    axis: "decision",
    options: [
      ["予算やレビューを比較する", -2],
      ["味や行きやすさを優先する", -1],
      ["一緒にいる人の希望を聞く", 1],
      ["その日の気分や雰囲気を大切にする", 2],
    ],
  },
  {
    category: "行動",
    question: "大切な決断をするときは？",
    axis: "decision",
    options: [
      ["情報を集めて比較する", -2],
      ["メリットと心配な点を書き出す", -1],
      ["信頼できる人に相談する", 1],
      ["最後は自分の気持ちに従う", 2],
    ],
  },
  {
    category: "行動",
    question: "新しい趣味を始めるなら？",
    axis: "novelty",
    options: [
      ["今好きな趣味をもっと深めたい", -2],
      ["身近で無理なく続けられるものを選ぶ", -1],
      ["友達がおすすめするものを試す", 1],
      ["今まで触れたことのないものに挑戦する", 2],
    ],
  },
  {
    category: "人付き合い",
    question: "友達との理想的な距離感は？",
    axis: "connection",
    options: [
      ["頻繁に連絡を取りたい", 2],
      ["定期的に会えれば嬉しい", 1],
      ["久しぶりでも自然に話せればいい", -1],
      ["必要なときに連絡できればいい", -2],
    ],
  },
  {
    category: "生活",
    question: "部屋やデスクは？",
    axis: "structure",
    options: [
      ["物の定位置を決めて整えておきたい", 2],
      ["必要な物だけ使いやすく整える", 1],
      ["気になったときにまとめて片づける", -1],
      ["自分が分かれば少し散らかっていても平気", -2],
    ],
  },
  {
    category: "行動",
    question: "初めての場所に行くときは？",
    axis: "structure",
    options: [
      ["ルートや候補まで詳しく調べる", 2],
      ["交通手段や営業時間は確認する", 1],
      ["最低限だけ調べて、あとは現地で考える", -1],
      ["ほとんど調べずに行ってみる", -2],
    ],
  },
  {
    category: "信頼",
    question: "一度信用を失った人とは？",
    axis: "decision",
    options: [
      ["事実と再発しない方法を確認する", -2],
      ["理由を聞いてから今後を判断する", -1],
      ["これまでの関係も含めて考える", 1],
      ["気持ちが戻るまで急いで結論を出さない", 2],
    ],
  },
  {
    category: "将来",
    question: "環境を変えるチャンスが来たら？",
    axis: "novelty",
    options: [
      ["今の安心できる環境を優先する", -2],
      ["条件が十分に整えば考える", -1],
      ["少し不安でも成長できそうなら挑戦する", 1],
      ["迷ったら変化がある方を選ぶ", 2],
    ],
  },
  {
    category: "将来",
    question: "数年後について考えるときは？",
    axis: "structure",
    options: [
      ["具体的な目標と手順を決めたい", 2],
      ["大まかな方向だけ決めたい", 1],
      ["状況に合わせてその都度考えたい", -1],
      ["先のことより今を大切にしたい", -2],
    ],
  },
  {
    category: "人付き合い",
    question: "誰かと過ごすときに嬉しいのは？",
    axis: "connection",
    options: [
      ["たくさん話して気持ちを共有すること", 2],
      ["一緒に何かをすること", 1],
      ["同じ空間で、それぞれ自由に過ごすこと", -1],
      ["必要なときに支え合えること", -2],
    ],
  },
  {
    category: "コミュニケーション",
    question: "サプライズについてどう思う？",
    axis: "novelty",
    options: [
      ["できれば事前に相談してほしい", -2],
      ["小さなものなら楽しめる", -1],
      ["内容によるけれど、わくわくする", 1],
      ["予想外なことほど嬉しい", 2],
    ],
  },
  {
    category: "将来",
    question: "人生で大切にしたいのは？",
    axis: "novelty",
    options: [
      ["安心できる暮らし", -2],
      ["信頼できる人との変わらない日常", -1],
      ["新しいことを知って成長すること", 1],
      ["自由に動き、たくさん経験すること", 2],
    ],
  },
];

export const questions: Question[] = v2Raw.map((item, index) => ({
  id: `q${String(index + 1).padStart(2, "0")}`,
  category: item.category,
  question: item.question,
  options: scoredOptions(item.axis, item.options),
  prediction: predictionIndexes.has(index),
  primaryAxis: item.axis,
}));

const legacyRaw: [string, string, string[]][] = [
  [
    "休日",
    "予定のない休日、どう過ごしたい？",
    [
      "家でゆっくり",
      "気になっていた場所へ行く",
      "誰かを誘う",
      "その日の気分で決める",
    ],
  ],
  [
    "コミュニケーション",
    "メッセージの返信は？",
    [
      "気づいたらすぐ返す",
      "落ち着いたときに返す",
      "用事があるときだけでよい",
      "相手や内容による",
    ],
  ],
  [
    "休日",
    "旅行で一番大切なのは？",
    ["行き先", "一緒に行く人", "食事や宿", "コストとのバランス"],
  ],
  [
    "お金",
    "100万円を自由に使えるなら？",
    ["貯金や投資", "旅行や体験", "欲しかった物", "家族や友人と使う"],
  ],
  [
    "信頼",
    "約束に10分遅れそうなときは？",
    [
      "すぐ連絡する",
      "急いで間に合わせる",
      "10分程度なら気にしない",
      "相手との関係による",
    ],
  ],
  [
    "コミュニケーション",
    "悩みがあるときは？",
    ["誰かに話したい", "一人で考えたい", "解決策を調べたい", "気分転換したい"],
  ],
  [
    "行動",
    "グループ旅行では？",
    ["計画を立てる", "誰かの計画に乗る", "一部だけ決める", "現地で決める"],
  ],
  [
    "人付き合い",
    "プレゼントでもらって嬉しいのは？",
    ["実用的な物", "欲しかった物", "思い出になる体験", "気持ちが伝わる物"],
  ],
  [
    "コミュニケーション",
    "人と意見が違ったときは？",
    [
      "理由を話し合う",
      "相手に合わせる",
      "一度距離を置く",
      "違っていても気にしない",
    ],
  ],
  [
    "生活",
    "疲れた日の過ごし方は？",
    [
      "一人で静かに過ごす",
      "誰かに話を聞いてもらう",
      "外へ出て気分転換する",
      "趣味に没頭する",
    ],
  ],
  [
    "行動",
    "急な誘いを受けたら？",
    [
      "予定がなければ行く",
      "内容を見て決める",
      "前もって決めたい",
      "誰からの誘いかで決める",
    ],
  ],
  [
    "信頼",
    "良い人間関係に一番必要なのは？",
    ["信頼", "会話", "適度な距離", "一緒に楽しめること"],
  ],
  ["お金", "お店選びで重視するのは？", ["味", "雰囲気", "値段", "相手の好み"]],
  [
    "行動",
    "大切な決断をするときは？",
    ["情報を集める", "直感で決める", "誰かに相談する", "時間をかける"],
  ],
  [
    "人付き合い",
    "SNSはどのように使う？",
    [
      "日常をよく投稿する",
      "見ることが中心",
      "必要なときだけ使う",
      "ほとんど使わない",
    ],
  ],
  [
    "人付き合い",
    "友達との理想的な距離感は？",
    [
      "頻繁に連絡を取りたい",
      "定期的に会えればよい",
      "用事があるときに連絡する",
      "久しぶりでも変わらない関係がよい",
    ],
  ],
  [
    "生活",
    "部屋やデスクは？",
    [
      "いつも整えておきたい",
      "必要な物だけ整える",
      "少し散らかっていても平気",
      "気になったときに片づける",
    ],
  ],
  [
    "行動",
    "初めての場所に行くときは？",
    [
      "事前に詳しく調べる",
      "最低限だけ調べる",
      "誰かに任せる",
      "何も調べず行く",
    ],
  ],
  [
    "信頼",
    "一度信用を失った人とは？",
    [
      "時間をかけて再び信じる",
      "理由を聞いて考える",
      "距離を置く",
      "内容によっては気にしない",
    ],
  ],
  [
    "将来",
    "仕事と私生活のバランスは？",
    [
      "私生活を優先したい",
      "仕事を優先したい",
      "時期によって変える",
      "どちらも同じくらい大切",
    ],
  ],
  [
    "将来",
    "数年後について考えるときは？",
    [
      "具体的に計画したい",
      "大まかな方向だけ決めたい",
      "今を大切にしたい",
      "状況に合わせて変えたい",
    ],
  ],
  [
    "人付き合い",
    "誰かと過ごすときに嬉しいのは？",
    [
      "たくさん話すこと",
      "一緒に何かをすること",
      "同じ空間で自由に過ごすこと",
      "相手が楽しんでいること",
    ],
  ],
  [
    "コミュニケーション",
    "サプライズについてどう思う？",
    ["とても嬉しい", "内容による", "事前に相談してほしい", "少し苦手"],
  ],
  [
    "将来",
    "人生で大切にしたいのは？",
    ["安心", "成長", "自由", "人とのつながり"],
  ],
];

export const legacyQuestions: Question[] = legacyRaw.map((item, index) => ({
  id: `q${String(index + 1).padStart(2, "0")}`,
  category: item[0],
  question: item[1],
  options: item[2].map((label) => ({ label })),
  prediction: predictionIndexes.has(index),
}));

export const worlds = [
  {
    key: "cafe",
    image: "/worlds/cafe.jpg",
    name: "カフェ",
    desc: "言葉と空気感を大切にする人。心地よい会話や、一緒に過ごす時間に価値を感じます。",
  },
  {
    key: "traveler",
    image: "/worlds/traveler.jpg",
    name: "旅人",
    desc: "知らない景色に心が動く人。正解より体験を大切にし、変化を楽しみます。",
  },
  {
    key: "forest",
    image: "/worlds/forest.jpg",
    name: "森",
    desc: "無理のない関係と落ち着いた時間を大切にし、少しずつ信頼を育てます。",
  },
  {
    key: "lighthouse",
    image: "/worlds/lighthouse.jpg",
    name: "灯台",
    desc: "進む方向を考え、周りを支える人。目的や役割が見えると安心します。",
  },
  {
    key: "fire",
    image: "/worlds/fire.jpg",
    name: "焚き火",
    desc: "人とのつながりから力を得て、気持ちを共有できる温かな場をつくります。",
  },
  {
    key: "library",
    image: "/worlds/library.jpg",
    name: "図書館",
    desc: "すぐ答えを出すより深く考え、意味のある対話を好みます。",
  },
  {
    key: "sea",
    image: "/worlds/sea.jpg",
    name: "海",
    desc: "決めつけられず自然体でいたい人。状況に合わせ、感覚を大切にします。",
  },
  {
    key: "garden",
    image: "/worlds/garden.jpg",
    name: "庭園",
    desc: "暮らしや関係を丁寧に整え、量より質とバランスを大切にします。",
  },
] as const;

type Sign = -1 | 1;

export type PersonalityStyle = {
  key: string;
  name: string;
  tagline: string;
  summary: string;
  strengths: [string, string];
  watchout: string;
  communication: string;
  worldKey: (typeof worlds)[number]["key"];
  signs: Record<AxisKey, Sign>;
};

export const personalityStyles: PersonalityStyle[] = [
  {
    key: "shared-structured-feeling-stable",
    name: "安心をつくる世話上手",
    tagline: "気持ちをくみ取り、みんなが落ち着ける形をつくる人",
    summary: "人とのつながりを大切にしながら、先回りして丁寧に関係を整えます。",
    strengths: ["小さな変化に気づける", "約束や日常を大切にできる"],
    watchout: "相手を思うあまり、自分の希望を後回しにしすぎることがあります。",
    communication:
      "感謝と希望を一緒に言葉にすると、無理なく気持ちが伝わります。",
    worldKey: "fire",
    signs: { connection: 1, structure: 1, decision: 1, novelty: -1 },
  },
  {
    key: "shared-structured-feeling-explore",
    name: "みんなを動かす体験プランナー",
    tagline: "一緒に楽しむ未来を、具体的な予定に変える人",
    summary: "人の気持ちを見ながら、新しい体験を実現する段取りを考えられます。",
    strengths: ["楽しみを計画に変えられる", "周りを置いていかずに進める"],
    watchout:
      "全員に楽しんでもらおうとして、予定を抱え込みやすいところがあります。",
    communication: "最初に相手の温度感を聞くと、持ち前の行動力がより生きます。",
    worldKey: "traveler",
    signs: { connection: 1, structure: 1, decision: 1, novelty: 1 },
  },
  {
    key: "shared-structured-reason-stable",
    name: "頼れる関係コーディネーター",
    tagline: "話を整理し、続けやすい関係の形を考える人",
    summary:
      "周囲と相談しながら、みんなが納得できる安定した着地点をつくります。",
    strengths: ["相談を具体策に変えられる", "信頼できる仕組みをつくれる"],
    watchout:
      "正しく整えようとするほど、相手がただ共感を求めている場面を見落とすことがあります。",
    communication:
      "結論の前に「どう感じた？」を一言入れると、安心感が増します。",
    worldKey: "lighthouse",
    signs: { connection: 1, structure: 1, decision: -1, novelty: -1 },
  },
  {
    key: "shared-structured-reason-explore",
    name: "好奇心を形にする企画役",
    tagline: "面白そうを、みんなで実現できる道筋に変える人",
    summary:
      "新しいアイデアを現実的な計画に落とし、人を巻き込みながら進めます。",
    strengths: ["情報収集と実行のバランスがよい", "共通の目的をつくれる"],
    watchout:
      "計画に夢中になると、途中で気持ちが変わった人に気づきにくいことがあります。",
    communication:
      "節目ごとに全員の気持ちを確認すると、企画力が信頼につながります。",
    worldKey: "lighthouse",
    signs: { connection: 1, structure: 1, decision: -1, novelty: 1 },
  },
  {
    key: "shared-flexible-feeling-stable",
    name: "空気をほどく寄り添い上手",
    tagline: "その場の気持ちを受け止め、自然に安心を広げる人",
    summary:
      "決めつけずに相手へ寄り添い、一緒にいて力の抜ける時間をつくります。",
    strengths: ["相手が話しやすい空気をつくれる", "状況に合わせて気遣える"],
    watchout:
      "場の空気を優先し、自分の違和感を飲み込んでしまうことがあります。",
    communication: "小さな違和感ほど早めに伝えると、心地よさを長く保てます。",
    worldKey: "cafe",
    signs: { connection: 1, structure: -1, decision: 1, novelty: -1 },
  },
  {
    key: "shared-flexible-feeling-explore",
    name: "ノリと共感のムードメーカー",
    tagline: "面白そうな瞬間を、人と一緒に大きくできる人",
    summary: "人の気持ちに反応しながら、その場ならではの楽しさへ飛び込めます。",
    strengths: ["初対面でも場を温められる", "変化を前向きな体験にできる"],
    watchout:
      "その場の勢いで約束を増やし、あとから疲れてしまうことがあります。",
    communication: "楽しさと同じくらい、自分の余力も共有すると無理が減ります。",
    worldKey: "fire",
    signs: { connection: 1, structure: -1, decision: 1, novelty: 1 },
  },
  {
    key: "shared-flexible-reason-stable",
    name: "会話で整えるバランサー",
    tagline: "話しながら状況を整理し、無理のない答えを探す人",
    summary:
      "一人で決め込まず、相手と会話しながら現実的なバランスを見つけます。",
    strengths: ["複数の意見を整理できる", "その場に合う落としどころを探せる"],
    watchout: "選択肢を広く見すぎて、自分の結論が後回しになることがあります。",
    communication:
      "自分の第一希望を先に添えると、相談がさらに進みやすくなります。",
    worldKey: "cafe",
    signs: { connection: 1, structure: -1, decision: -1, novelty: -1 },
  },
  {
    key: "shared-flexible-reason-explore",
    name: "人をつなぐアイデア案内人",
    tagline: "新しい選択肢を見つけ、会話の輪を広げる人",
    summary: "好奇心と柔軟な思考で、周囲に新しい見方や体験を届けます。",
    strengths: ["発想の切り替えが速い", "人と情報を自然につなげられる"],
    watchout: "面白い方向へ進むうちに、最初の目的を忘れることがあります。",
    communication:
      "今どこを目指しているかを時々確認すると、自由さが強みになります。",
    worldKey: "sea",
    signs: { connection: 1, structure: -1, decision: -1, novelty: 1 },
  },
  {
    key: "independent-structured-feeling-stable",
    name: "静かに支える約束番",
    tagline: "多くを語らなくても、行動と継続で大切さを示す人",
    summary: "自分のペースを保ちながら、信頼する相手を長く丁寧に支えます。",
    strengths: ["言葉だけでなく行動で示せる", "関係を長い目で育てられる"],
    watchout: "気遣いが静かなぶん、相手に思いが伝わりきらないことがあります。",
    communication:
      "短い言葉でも意図を添えると、行動に込めた気持ちが伝わります。",
    worldKey: "forest",
    signs: { connection: -1, structure: 1, decision: 1, novelty: -1 },
  },
  {
    key: "independent-structured-feeling-explore",
    name: "芯を持って進む情熱家",
    tagline: "自分の感覚を信じ、好きな未来へ着実に進む人",
    summary: "周囲に流されず、心が動いた新しい目標へ計画的に取り組みます。",
    strengths: ["好きなことへの集中力がある", "思いを継続的な行動にできる"],
    watchout:
      "内側の情熱が見えにくく、周囲から急に動いたように思われることがあります。",
    communication: "動き出す前に理由を共有すると、応援してくれる人が増えます。",
    worldKey: "garden",
    signs: { connection: -1, structure: 1, decision: 1, novelty: 1 },
  },
  {
    key: "independent-structured-reason-stable",
    name: "ぶれない現実設計者",
    tagline: "静かに考え、長く続く現実的な答えを組み立てる人",
    summary: "情報と見通しを大切にし、自分の基準で着実な選択を重ねます。",
    strengths: ["複雑なことを整理できる", "安定した判断を積み重ねられる"],
    watchout:
      "考えがまとまるまで説明を控え、距離があるように見えることがあります。",
    communication: "途中の考えを少し共有すると、相手も安心して待てます。",
    worldKey: "library",
    signs: { connection: -1, structure: 1, decision: -1, novelty: -1 },
  },
  {
    key: "independent-structured-reason-explore",
    name: "準備して飛び込む探究者",
    tagline: "未知を調べ、自分なりの道筋をつくって挑戦する人",
    summary: "好奇心のままに動くだけでなく、情報を集めて確かな一歩へ変えます。",
    strengths: ["未知の分野を深く調べられる", "挑戦のリスクを具体的に減らせる"],
    watchout:
      "準備を重ねるほど、始めるタイミングを逃しやすいところがあります。",
    communication: "準備の期限を決めると、知識と行動力がうまくつながります。",
    worldKey: "traveler",
    signs: { connection: -1, structure: 1, decision: -1, novelty: 1 },
  },
  {
    key: "independent-flexible-feeling-stable",
    name: "マイペースな癒やし手",
    tagline: "無理に近づかず、必要なときにそっと寄り添う人",
    summary: "自分と相手のペースを尊重し、穏やかで自然体な関係を好みます。",
    strengths: ["相手を急かさず見守れる", "自然体でいられる空気をつくれる"],
    watchout: "遠慮が重なると、関心がないと誤解されることがあります。",
    communication: "会えないときも短い反応を返すと、心地よい距離を守れます。",
    worldKey: "forest",
    signs: { connection: -1, structure: -1, decision: 1, novelty: -1 },
  },
  {
    key: "independent-flexible-feeling-explore",
    name: "感性で動く自由な冒険家",
    tagline: "心が動く方向へ、自分らしい速度で進む人",
    summary: "周囲の正解に縛られず、直感と新しい体験を大切にします。",
    strengths: ["小さな変化を楽しめる", "自分らしい選択を恐れない"],
    watchout: "気持ちが変わった理由を説明せず、相手を驚かせることがあります。",
    communication:
      "今の気持ちを途中で共有すると、自由さを理解してもらいやすくなります。",
    worldKey: "sea",
    signs: { connection: -1, structure: -1, decision: 1, novelty: 1 },
  },
  {
    key: "independent-flexible-reason-stable",
    name: "静かに見守る観察者",
    tagline: "少し離れた場所から状況を見て、必要な一言を届ける人",
    summary: "すぐに反応せず、自分の中で考えてから穏やかに関わります。",
    strengths: ["感情に流されず状況を見られる", "相手の自主性を尊重できる"],
    watchout:
      "考えている時間が長いと、相手には反応がないように見えることがあります。",
    communication:
      "「考えてから話したい」と先に伝えるだけで、沈黙が安心に変わります。",
    worldKey: "library",
    signs: { connection: -1, structure: -1, decision: -1, novelty: -1 },
  },
  {
    key: "independent-flexible-reason-explore",
    name: "思いつきを試す自由研究家",
    tagline: "気になることを、自分の方法ですぐ確かめてみる人",
    summary:
      "常識にとらわれず、観察と実験を繰り返しながら新しい答えを探します。",
    strengths: ["発想を素早く試せる", "一人でも未知へ踏み出せる"],
    watchout:
      "自分の中で完結し、面白さや意図を周囲と共有し忘れることがあります。",
    communication:
      "結論だけでなく発見の過程を話すと、仲間が増えやすくなります。",
    worldKey: "sea",
    signs: { connection: -1, structure: -1, decision: -1, novelty: 1 },
  },
];

export type AxisResult = {
  key: AxisKey;
  name: string;
  raw: number;
  position: number;
  sign: Sign;
  label: string;
  shortLabel: string;
  description: string;
  balanced: boolean;
};

export type PersonalityEvidence = {
  questionId: string;
  question: string;
  answer: string;
  axis: string;
  insight: string;
};

export type PersonalityProfile = {
  scoringVersion: typeof SCORING_VERSION;
  style: PersonalityStyle;
  world: (typeof worlds)[number];
  axes: AxisResult[];
  strongestAxis: AxisResult;
  evidence: PersonalityEvidence[];
};

export function questionSetFor(version?: string): Question[] {
  return version === "v1" ? legacyQuestions : questions;
}

export function optionLabel(question: Question, answer: number): string {
  return question.options[answer]?.label ?? "未回答";
}

export function worldFor(answers: number[]) {
  const totals = Array(8).fill(0);
  answers.forEach((answer, index) => {
    totals[(answer + index) % 8] += 2;
    totals[(answer * 2 + index + 3) % 8] += 1;
  });
  return worlds[totals.indexOf(Math.max(...totals))];
}

function tieBreakerSign(axis: AxisDefinition, answers: number[]): Sign {
  const index = questions.findIndex(
    (question) => question.id === axis.tieBreakerQuestionId,
  );
  const value = questions[index]?.options[answers[index]]?.score?.value ?? 1;
  return value < 0 ? -1 : 1;
}

export function personalityFor(answers: number[]): PersonalityProfile {
  const totals: Record<AxisKey, number> = {
    connection: 0,
    structure: 0,
    decision: 0,
    novelty: 0,
  };

  questions.forEach((question, index) => {
    const selected = question.options[answers[index]];
    if (selected?.score) totals[selected.score.axis] += selected.score.value;
  });

  const axisResults = axes.map((axis): AxisResult => {
    const raw = totals[axis.key];
    const sign: Sign =
      raw === 0 ? tieBreakerSign(axis, answers) : raw > 0 ? 1 : -1;
    const side = sign > 0 ? axis.positive : axis.negative;
    return {
      key: axis.key,
      name: axis.name,
      raw,
      position: Math.round((raw / 12) * 100),
      sign,
      label: Math.abs(raw) <= 2 ? `バランス型 · ${side.label}` : side.label,
      shortLabel: side.shortLabel,
      description: side.description,
      balanced: Math.abs(raw) <= 2,
    };
  });

  const styleKey = [
    axisResults.find((axis) => axis.key === "connection")?.sign === 1
      ? "shared"
      : "independent",
    axisResults.find((axis) => axis.key === "structure")?.sign === 1
      ? "structured"
      : "flexible",
    axisResults.find((axis) => axis.key === "decision")?.sign === 1
      ? "feeling"
      : "reason",
    axisResults.find((axis) => axis.key === "novelty")?.sign === 1
      ? "explore"
      : "stable",
  ].join("-");
  const style =
    personalityStyles.find((item) => item.key === styleKey) ??
    personalityStyles[0];
  const world = worlds.find((item) => item.key === style.worldKey) ?? worlds[0];
  const strongestAxis = [...axisResults].sort(
    (a, b) => Math.abs(b.position) - Math.abs(a.position),
  )[0];
  const evidence = [...axisResults]
    .sort((a, b) => Math.abs(b.position) - Math.abs(a.position))
    .slice(0, 3)
    .map((axisResult): PersonalityEvidence => {
      const candidates = questions
        .map((question, index) => ({
          question,
          index,
          score: question.options[answers[index]]?.score?.value ?? 0,
        }))
        .filter(({ question }) => question.primaryAxis === axisResult.key)
        .sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
      const selected =
        candidates.find(
          ({ score }) => (score < 0 ? -1 : 1) === axisResult.sign,
        ) ?? candidates[0];
      return {
        questionId: selected.question.id,
        question: selected.question.question,
        answer: optionLabel(selected.question, answers[selected.index]),
        axis: axisResult.name,
        insight: axisResult.description,
      };
    });

  return {
    scoringVersion: SCORING_VERSION,
    style,
    world,
    axes: axisResults,
    strongestAxis,
    evidence,
  };
}

export function closeness(a: number[], b: number[], count = questions.length) {
  return Math.round(
    (a.reduce(
      (sum, value, index) =>
        sum +
        (value === b[index] ? 2 : Math.abs(value - b[index]) === 1 ? 1 : 0),
      0,
    ) /
      (count * 2)) *
      100,
  );
}
