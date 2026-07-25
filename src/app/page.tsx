import Link from "next/link";

const worlds = [
  ["cafe", "カフェ", "会話と心地よさ"],
  ["traveler", "旅人", "好奇心と新しい経験"],
  ["forest", "森", "安心と穏やかさ"],
  ["lighthouse", "灯台", "目的と支える力"],
  ["fire", "焚き火", "共感とつながり"],
  ["library", "図書館", "知識と深い対話"],
  ["sea", "海", "自由と自然体"],
  ["garden", "庭園", "丁寧さとバランス"],
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <nav className="nav">
          <span className="brand">
            <i>わ</i> 価値観マッチ
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
          <div className="mini-label">ふたりの世界観</div>
          <div className="world-pair">
            <span>
              <img src="/worlds/cafe.jpg" alt="カフェの世界観" />
              <b>
                あおい
                <br />
                <small>カフェ</small>
              </b>
            </span>
            <i>×</i>
            <span>
              <img src="/worlds/traveler.jpg" alt="旅人の世界観" />
              <b>
                はる
                <br />
                <small>旅人</small>
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
            <img
              src="/steps/result.jpg"
              alt="ふたりで結果画面を見る様子"
            />
            <h3>ふたりで結果を見る</h3>
            <p>共通点も違いも、発見に変わる。</p>
          </article>
        </div>
      </section>

      <section className="worlds">
        <p className="eyebrow">8 WORLDS</p>
        <h2>あなたの答えから見える、8つの世界観</h2>
        <p>人を枠にはめるものではなく、大切にしている景色を表す言葉です。</p>
        <div className="world-grid">
          {worlds.map(([key, name, text]) => (
            <article key={name}>
              <img
                src={`/worlds/${key}.jpg`}
                alt={`${name}の世界観を表すイラスト`}
              />
              <div>
                <h3>{name}</h3>
                <p>{text}</p>
              </div>
            </article>
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
          <i>わ</i> 価値観マッチ
        </span>
        <div>
          <Link href="/terms">利用規約</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
        </div>
        <small>© 2026 価値観マッチ</small>
      </footer>
    </main>
  );
}
