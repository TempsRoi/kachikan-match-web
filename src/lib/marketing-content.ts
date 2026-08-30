import type { Locale } from "@/lib/locales";

export type MarketingContent = {
  locale: Locale;
  brand: string;
  brandAlias: string;
  navNote: string;
  switchLabel: string;
  switchHref: string;
  hero: {
    eyebrow: string;
    line1: string;
    line2: string;
    lead1: string;
    lead2: string;
    cta: string;
    privacy: string;
  };
  preview: {
    label: string;
    firstName: string;
    firstStyle: string;
    secondName: string;
    secondStyle: string;
    title1: string;
    title2: string;
    alignmentLabel: string;
    alignmentValue: string;
  };
  how: {
    title1: string;
    title2: string;
    steps: Array<{ title: string; body: string; alt: string }>;
  };
  axes: {
    title: string;
    body: string;
    items: Array<{ key: string; name: string; text: string; alt: string }>;
  };
  report: {
    title: string;
    body: string;
    cta: string;
    label: string;
    price: string;
    priceNote: string;
    purchaseNote: string;
    items: string[];
  };
  faqTitle: string;
  faq: Array<[string, string]>;
  closing: {
    title: string;
    body: string;
    cta: string;
  };
  footer: {
    terms: string;
    privacy: string;
    commerce: string;
    contact: string;
    copyright: string;
  };
};

const japanese: MarketingContent = {
  locale: "ja",
  brand: "フタリシル",
  brandAlias: "ふたりしる / FUTARISHIRU",
  navNote: "登録不要 · 約5分",
  switchLabel: "English",
  switchHref: "/en",
  hero: {
    eyebrow: "ふたりで遊ぶ、相互理解ゲーム",
    line1: "あなたは、相手を",
    line2: "どれだけ知っていますか？",
    lead1: "答えを比べるだけではなく、相手の答えを予想する。",
    lead2: "ふたりの価値観と理解度が見えてきます。",
    cta: "はじめる",
    privacy: "🔒 会員登録なし · 回答は招待した相手とだけ共有",
  },
  preview: {
    label: "ふたりの関係スタイル",
    firstName: "あおい",
    firstStyle: "寄り添い上手",
    secondName: "はる",
    secondStyle: "準備する探究者",
    title1: "落ち着きと好奇心が",
    title2: "混ざりあうふたり",
    alignmentLabel: "価値観の近さ",
    alignmentValue: "ほどよく近い",
  },
  how: {
    title1: "知っているつもりが、",
    title2: "会話のはじまりになる。",
    steps: [
      {
        title: "自分の答えを選ぶ",
        body: "日常の24問に、直感で回答。",
        alt: "質問カードから自分の答えを選ぶ様子",
      },
      {
        title: "相手に送る",
        body: "専用URLを、気軽にシェア。",
        alt: "スマートフォンで相手に招待を送る様子",
      },
      {
        title: "ふたりで結果を見る",
        body: "共通点も違いも、発見に変わる。",
        alt: "ふたりで結果画面を見る様子",
      },
    ],
  },
  axes: {
    title: "あなたらしい関わり方を、4つの軸で。",
    body: "24の回答から、距離感・予定・判断・変化への向き合い方を読み解きます。",
    items: [
      {
        key: "cafe",
        name: "つながり方",
        text: "自分のペース ↔ 一緒に共有",
        alt: "つながり方を表すイラスト",
      },
      {
        key: "lighthouse",
        name: "進め方",
        text: "流れに合わせる ↔ 計画して安心",
        alt: "進め方を表すイラスト",
      },
      {
        key: "library",
        name: "決め方",
        text: "理由と納得 ↔ 気持ちと共感",
        alt: "決め方を表すイラスト",
      },
      {
        key: "traveler",
        name: "求めるもの",
        text: "安心と継続 ↔ 変化と経験",
        alt: "求めるものを表すイラスト",
      },
    ],
  },
  report: {
    title: "まず無料で発見。もっと話したくなったら、深く。",
    body: "関係スタイルや4つの性格軸、価値観の近さ、相互理解度は無料で確認できます。詳細レポートでは、24問すべてから「支え方」「好意の伝わり方」「すれ違いやすい場面」まで読み解きます。",
    cta: "無料ではじめる",
    label: "詳細レポート",
    price: "480円",
    priceNote: "（税込）",
    purchaseNote: "1回限りの買い切り・定期課金なし",
    items: [
      "関係トリセツ",
      "8カテゴリ分析",
      "全24問の答え合わせ",
      "ふたりの7日間アクション",
    ],
  },
  faqTitle: "よくある質問",
  faq: [
    [
      "フタリシルはどんなサービスですか？",
      "2人が同じ24問に答え、相手の回答も予想する相互理解ゲームです。共通点だけでなく、違いや意外な回答を会話のきっかけとして楽しめます。",
    ],
    [
      "恋人以外とも遊べますか？",
      "はい。友達、夫婦、家族、付き合う前の相手など、関係を問わず遊べる質問内容です。恋愛だけに限定した診断ではありません。",
    ],
    [
      "会員登録やアプリのインストールは必要ですか？",
      "必要ありません。スマートフォンやPCのブラウザから、ニックネームだけで始められます。所要時間の目安は約5分です。",
    ],
    [
      "無料でどこまで見られますか？",
      "2人の関係スタイル、4つの性格軸、価値観の近さ、相互理解度、主な共通点・違い・意外だった回答を無料で確認できます。",
    ],
    [
      "480円の詳細レポートは定期課金ですか？",
      "いいえ。結果1件につき480円（税込）の買い切りで、定期課金や追加料金はありません。購入した2人の結果ページで閲覧できます。",
    ],
  ],
  closing: {
    title: "あの人と、やってみよう。",
    body: "友達・恋人・夫婦・家族。誰とでも遊べます。",
    cta: "無料ではじめる",
  },
  footer: {
    terms: "利用規約",
    privacy: "プライバシーポリシー",
    commerce: "特定商取引法に基づく表記",
    contact: "お問い合わせ",
    copyright: "© 2026 フタリシル",
  },
};

const english: MarketingContent = {
  locale: "en",
  brand: "FutariShiru",
  brandAlias: "ふたりしる / FUTARISHIRU",
  navNote: "No sign-up · About 5 minutes",
  switchLabel: "日本語",
  switchHref: "/",
  hero: {
    eyebrow: "A TWO-PERSON CONNECTION GAME",
    line1: "How well do you really",
    line2: "know each other?",
    lead1: "Don’t just compare answers—predict theirs.",
    lead2: "Discover what you share, where you differ, and what surprises you.",
    cta: "English game coming next",
    privacy:
      "🔒 No account required · Your answers stay between the two of you",
  },
  preview: {
    label: "YOUR CONNECTION STYLE",
    firstName: "Alex",
    firstStyle: "Thoughtful Companion",
    secondName: "Jamie",
    secondStyle: "Prepared Explorer",
    title1: "Grounded together,",
    title2: "with room for curiosity",
    alignmentLabel: "Values alignment",
    alignmentValue: "Comfortably close",
  },
  how: {
    title1: "What you think you know",
    title2: "becomes a conversation.",
    steps: [
      {
        title: "Choose your answers",
        body: "Answer 24 everyday questions on your own.",
        alt: "A person choosing an answer from a question card",
      },
      {
        title: "Invite your person",
        body: "Send them a private link—no account needed.",
        alt: "A person sharing a private invitation on a phone",
      },
      {
        title: "Discover together",
        body: "Turn matches, differences, and surprises into conversation.",
        alt: "Two people viewing their results together",
      },
    ],
  },
  axes: {
    title: "Four dimensions of how you connect.",
    body: "Your 24 answers reveal how you approach closeness, plans, decisions, and new experiences.",
    items: [
      {
        key: "cafe",
        name: "Connection",
        text: "Personal space ↔ Shared time",
        alt: "Illustration representing connection style",
      },
      {
        key: "lighthouse",
        name: "Structure",
        text: "Go with the flow ↔ Plan ahead",
        alt: "Illustration representing planning style",
      },
      {
        key: "library",
        name: "Decisions",
        text: "Reason and clarity ↔ Feelings and empathy",
        alt: "Illustration representing decision style",
      },
      {
        key: "traveler",
        name: "Novelty",
        text: "Stability and continuity ↔ Change and experience",
        alt: "Illustration representing openness to new experiences",
      },
    ],
  },
  report: {
    title: "Start with a free discovery. Go deeper when you’re ready.",
    body: "See your connection style, four personality dimensions, values alignment, and how accurately you predicted each other—for free. The full report explores all 24 answers, including how you support each other, express care, and navigate misunderstandings.",
    cta: "English game coming next",
    label: "FULL REPORT",
    price: "$4.99",
    priceNote: "USD",
    purchaseNote: "One-time purchase · No subscription",
    items: [
      "Your relationship playbook",
      "Analysis across 8 categories",
      "All 24 answers compared",
      "A 7-day action plan for two",
    ],
  },
  faqTitle: "Frequently asked questions",
  faq: [
    [
      "What is FutariShiru?",
      "FutariShiru is a private two-person game. You both answer the same 24 questions and predict each other’s choices, turning similarities, differences, and surprises into conversation.",
    ],
    [
      "Is it only for couples?",
      "No. You can play with a partner, friend, spouse, family member, or someone you’re still getting to know. It is a conversation game, not a relationship diagnosis.",
    ],
    [
      "Do we need accounts or an app?",
      "No. You can play in a phone or desktop browser using nicknames. A game takes about five minutes.",
    ],
    [
      "What can we see for free?",
      "The free results include your connection style, four personality dimensions, values alignment, prediction accuracy, and key matches, differences, and surprises.",
    ],
    [
      "Is the $4.99 full report a subscription?",
      "No. It is a one-time purchase for one completed result. Both participants can access the unlocked report for 12 months, with a downloadable PDF included.",
    ],
    [
      "Who can use FutariShiru?",
      "The international version is intended for adults aged 18 and over.",
    ],
  ],
  closing: {
    title: "Try it with someone who matters.",
    body: "Partners, friends, spouses, and family—connection can start anywhere.",
    cta: "English game coming next",
  },
  footer: {
    terms: "Terms (Japanese)",
    privacy: "Privacy (Japanese)",
    commerce: "Seller information (Japanese)",
    contact: "Contact (Japanese)",
    copyright: "© 2026 FutariShiru",
  },
};

export const marketingContent: Record<Locale, MarketingContent> = {
  ja: japanese,
  en: english,
};
