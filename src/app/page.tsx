import Link from "next/link";

const personalityAxes = [
  ["cafe", "つながり方", "自分のペース ↔ 一緒に共有"],
  ["lighthouse", "進め方", "流れに合わせる ↔ 計画して安心"],
  ["library", "決め方", "理由と納得 ↔ 気持ちと共感"],
  ["traveler", "求めるもの", "安心と継続 ↔ 変化と経験"],
];

export default function Home() {
  const faq = [
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
  ];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "フタリシル",
        alternateName: "価値観マッチ",
        url: "https://www.kachikanmatch.jp/",
        applicationCategory: "EntertainmentApplication",
        operatingSystem: "Web",
        inLanguage: "ja",
        isAccessibleForFree: true,
        description:
          "2人で同じ質問に答え、相手の回答を予想して価値観と理解度を見つける相互理解ゲーム。",
        offers: {
          "@type": "Offer",
          name: "詳細レポート",
          price: "480",
          priceCurrency: "JPY",
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <section className="hero">
        <nav className="nav">
          <span className="brand">
            <i>ふ</i> フタリシル
          </span>
          <span className="nav-note">登録不要 · 約5分</span>
        </nav>
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <div className="hero-copy">
          <p className="eyebrow">ふたりで遊ぶ、相互理解ゲーム</p>
          <h1>
            あなたは、相手を
            <br />
            <em>どれだけ知っていますか？</em>
          </h1>
          <p className="lead">
            答えを比べるだけではなく、相手の答えを予想する。
            <br />
            ふたりの価値観と理解度が見えてきます。
          </p>
          <Link className="primary" href="/start">
            はじめる <span>→</span>
          </Link>
          <p className="privacy-note">
            🔒 会員登録なし · 回答は招待した相手とだけ共有
          </p>
        </div>
        <div className="phone-card">
          <div className="mini-label">ふたりの関係スタイル</div>
          <div className="world-pair">
            <span>
              <img src="/worlds/cafe.jpg" alt="カフェの世界観" />
              <b>
                あおい
                <br />
                <small>寄り添い上手</small>
              </b>
            </span>
            <i>×</i>
            <span>
              <img src="/worlds/traveler.jpg" alt="旅人の世界観" />
              <b>
                はる
                <br />
                <small>準備する探究者</small>
              </b>
            </span>
          </div>
          <h3>
            落ち着きと好奇心が
            <br />
            混ざりあうふたり
          </h3>
          <div className="meter">
            <span style={{ width: "78%" }} />
          </div>
          <p>
            価値観の近さ <b>ほどよく近い</b>
          </p>
        </div>
      </section>

      <section className="how">
        <p className="eyebrow">HOW IT WORKS</p>
        <h2>
          知っているつもりが、
          <br />
          会話のはじまりになる。
        </h2>
        <div className="steps">
          <article>
            <b>01</b>
            <img
              src="/steps/answer.jpg"
              alt="質問カードから自分の答えを選ぶ様子"
            />
            <h3>自分の答えを選ぶ</h3>
            <p>日常の24問に、直感で回答。</p>
          </article>
          <article>
            <b>02</b>
            <img
              src="/steps/invite.jpg"
              alt="スマートフォンで相手に招待を送る様子"
            />
            <h3>相手に送る</h3>
            <p>専用URLを、気軽にシェア。</p>
          </article>
          <article>
            <b>03</b>
            <img src="/steps/result.jpg" alt="ふたりで結果画面を見る様子" />
            <h3>ふたりで結果を見る</h3>
            <p>共通点も違いも、発見に変わる。</p>
          </article>
        </div>
      </section>

      <section className="worlds">
        <p className="eyebrow">4 PERSONALITY AXES</p>
        <h2>あなたらしい関わり方を、4つの軸で。</h2>
        <p>
          24の回答から、距離感・予定・判断・変化への向き合い方を読み解きます。
        </p>
        <div className="world-grid">
          {personalityAxes.map(([key, name, text]) => (
            <article key={name}>
              <img src={`/worlds/${key}.jpg`} alt={`${name}を表すイラスト`} />
              <div>
                <h3>{name}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="report-preview">
        <div>
          <p className="eyebrow">FREE &amp; FULL REPORT</p>
          <h2>まず無料で発見。もっと話したくなったら、深く。</h2>
          <p>
            関係スタイルや4つの性格軸、価値観の近さ、相互理解度は無料で確認できます。詳細レポートでは、24問すべてから「支え方」「好意の伝わり方」「すれ違いやすい場面」まで読み解きます。
          </p>
          <Link className="primary" href="/start">
            無料ではじめる <span>→</span>
          </Link>
        </div>
        <aside>
          <span>詳細レポート</span>
          <strong>
            480円<small>（税込）</small>
          </strong>
          <p>1回限りの買い切り・定期課金なし</p>
          <ul>
            <li>関係トリセツ</li>
            <li>8カテゴリ分析</li>
            <li>全24問の答え合わせ</li>
            <li>ふたりの7日間アクション</li>
          </ul>
        </aside>
      </section>

      <section className="faq-section">
        <p className="eyebrow">FAQ</p>
        <h2>よくある質問</h2>
        <div className="faq-list">
          {faq.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="cta-worlds">
          <img src="/worlds/cafe.jpg" alt="カフェの世界観" />
          <img src="/worlds/traveler.jpg" alt="旅人の世界観" />
        </div>
        <h2>あの人と、やってみよう。</h2>
        <p>友達・恋人・夫婦・家族。誰とでも遊べます。</p>
        <Link className="primary light" href="/start">
          無料ではじめる →
        </Link>
      </section>
      <footer>
        <span className="brand">
          <i>ふ</i> フタリシル
        </span>
        <div>
          <Link href="/terms">利用規約</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
          <Link href="/commerce">特定商取引法に基づく表記</Link>
          <Link href="/contact">お問い合わせ</Link>
        </div>
        <small>© 2026 フタリシル</small>
      </footer>
    </main>
  );
}
