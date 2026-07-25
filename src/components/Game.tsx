"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { closeness, questions, worldFor } from "@/lib/questions";

type Saved = {
  creator: string;
  partner: string;
  answers: number[];
  predictions: number[];
  partnerAnswers?: number[];
  partnerPredictions?: number[];
};
const key = (token: string) => `km:${token}`;
const randomAnswers = () => questions.map((_, i) => (i * 7 + 2) % 4);

export function StartGame() {
  const router = useRouter();
  const [creator, setCreator] = useState("");
  const [partner, setPartner] = useState("");
  function begin() {
    if (!creator.trim() || !partner.trim()) return;
    const token = crypto.randomUUID().replaceAll("-", "").slice(0, 24);
    localStorage.setItem(
      key(token),
      JSON.stringify({ creator, partner, answers: [], predictions: [] }),
    );
    router.push(`/play/${token}?role=creator`);
  }
  return (
    <Shell>
      <div className="panel">
        <p className="eyebrow">STEP 1 / 3</p>
        <h1>
          ふたりの呼び名を
          <br />
          教えてください。
        </h1>
        <p>ニックネームで大丈夫。本名やメールアドレスは必要ありません。</p>
        <div className="field">
          <label>あなたの呼び名</label>
          <input
            value={creator}
            maxLength={20}
            onChange={(e) => setCreator(e.target.value)}
            placeholder="例：あおい"
          />
        </div>
        <div className="field">
          <label>相手の呼び名</label>
          <input
            value={partner}
            maxLength={20}
            onChange={(e) => setPartner(e.target.value)}
            placeholder="例：はる"
          />
        </div>
        <button className="button" onClick={begin}>
          質問に答える →
        </button>
        <p className="notice">
          回答内容は、招待した相手と結果を確認するために共有されます。
        </p>
      </div>
    </Shell>
  );
}
export function PlayGame({ token }: { token: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState<Saved | null>(null);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"answer" | "predict">("answer");
  const [role, setRole] = useState<"creator" | "partner">("creator");
  useEffect(() => {
    const s = localStorage.getItem(key(token));
    if (!s) {
      router.push("/");
      return;
    }
    setSaved(JSON.parse(s));
    setRole(
      new URLSearchParams(location.search).get("role") === "partner"
        ? "partner"
        : "creator",
    );
  }, [token, router]);
  if (!saved) return null;
  const current = saved;
  const predictionQs = questions.filter((q) => q.prediction);
  const q = phase === "answer" ? questions[idx] : predictionQs[idx];
  const target = role === "creator" ? current.partner : current.creator;
  function choose(choice: number) {
    const field =
      phase === "answer"
        ? role === "creator"
          ? "answers"
          : "partnerAnswers"
        : role === "creator"
          ? "predictions"
          : "partnerPredictions";
    const arr = [...((current[field] as number[] | undefined) || [])];
    arr[idx] = choice;
    const next = { ...current, [field]: arr };
    setSaved(next);
    localStorage.setItem(key(token), JSON.stringify(next));
    const total = phase === "answer" ? 24 : 8;
    if (idx + 1 < total) setIdx(idx + 1);
    else if (phase === "answer") {
      setPhase("predict");
      setIdx(0);
    } else
      router.push(role === "creator" ? `/invite/${token}` : `/result/${token}`);
  }
  const total = phase === "answer" ? 24 : 8;
  return (
    <Shell>
      <div className="panel">
        <p className="question-meta">
          {phase === "answer"
            ? `${q.category} · あなたの回答`
            : `相手の答えを予想`}
          　{idx + 1} / {total}
        </p>
        <div className="progress">
          <span style={{ width: `${((idx + 1) / total) * 100}%` }} />
        </div>
        <h1>
          {phase === "predict"
            ? `${target}さんなら、どれを選ぶと思いますか？`
            : q.question}
        </h1>
        {phase === "predict" && <p>{q.question}</p>}
        <div className="options">
          {q.options.map((o, i) => (
            <button className="option" key={o} onClick={() => choose(i)}>
              {String.fromCharCode(65 + i)}　{o}
            </button>
          ))}
        </div>
        <p className="notice">
          正解・不正解はありません。いちばん近いものを直感で選んでください。
        </p>
      </div>
    </Shell>
  );
}
export function Invite({ token }: { token: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState<Saved | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const s = localStorage.getItem(key(token));
    if (s) setSaved(JSON.parse(s));
  }, [token]);
  if (!saved) return null;
  const current = saved;
  const url =
    typeof location === "undefined"
      ? ""
      : `${location.origin}/play/${token}?role=partner`;
  function simulate() {
    const next = {
      ...current,
      partnerAnswers: randomAnswers(),
      partnerPredictions: current.answers
        .map((v, i) => (i % 3 ? v : (v + 1) % 4))
        .slice(0, 8),
    };
    localStorage.setItem(key(token), JSON.stringify(next));
    router.push(`/result/${token}`);
  }
  return (
    <Shell>
      <div className="panel">
        <p className="eyebrow">YOUR INVITATION</p>
        <h1>
          {current.partner}さんに
          <br />
          招待を送りましょう。
        </h1>
        <p>
          「ちょっと面白そうな価値観ゲーム見つけた。私の答えも予想してみて！」
        </p>
        <div className="share-url">{url}</div>
        <button
          className="button"
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
          }}
        >
          {copied ? "コピーしました ✓" : "招待URLをコピー"}
        </button>
        <button
          className="button secondary"
          onClick={() =>
            navigator.share?.({
              title: "価値観マッチ",
              text: "私の答えも予想してみて！",
              url,
            })
          }
        >
          共有メニューを開く
        </button>
        <button className="button secondary" onClick={simulate}>
          デモ用：相手の回答を受け取る
        </button>
        <p className="notice">
          相手が回答すると、ふたりの結果を確認できます。この画面は閉じても大丈夫です。
        </p>
      </div>
    </Shell>
  );
}
export function Result({ token }: { token: string }) {
  const [s, setS] = useState<Saved | null>(null);
  const card = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const raw = localStorage.getItem(key(token));
    if (raw) setS(JSON.parse(raw));
  }, [token]);
  if (!s) return null;
  const b = s.partnerAnswers || randomAnswers();
  const score = closeness(s.answers, b);
  const wa = worldFor(s.answers),
    wb = worldFor(b);
  const label =
    score >= 85
      ? "とても近い"
      : score >= 70
        ? "ほどよく近い"
        : score >= 50
          ? "違いが刺激になる"
          : "新しい発見が多い";
  const same = questions.filter((_, i) => s.answers[i] === b[i]).slice(0, 4);
  const diff = questions.filter((_, i) => s.answers[i] !== b[i]).slice(0, 4);
  const understand = (p: number[] | undefined, a: number[]) =>
    Math.round(
      ((p || []).reduce(
        (n, v, i) => n + (v === a[i] ? 1 : Math.abs(v - a[i]) === 1 ? 0.5 : 0),
        0,
      ) /
        8) *
        100,
    );
  async function download() {
    if (!card.current) return;
    const data = await toPng(card.current, { pixelRatio: 2 });
    const a = document.createElement("a");
    a.download = "kachikan-match.png";
    a.href = data;
    a.click();
  }
  return (
    <Shell>
      <div className="panel" style={{ maxWidth: 820 }}>
        <div className="result-hero" ref={card}>
          <p className="eyebrow">ふたりの世界観</p>
          <div className="result-worlds">
            <span>
              <img src={wa.image} alt={`${wa.name}の世界観`} />
              <b>
                {s.creator} · {wa.name}
              </b>
            </span>
            <span>
              <img src={wb.image} alt={`${wb.name}の世界観`} />
              <b>
                {s.partner} · {wb.name}
              </b>
            </span>
          </div>
          <h1>
            落ち着きと好奇心が
            <br />
            混ざりあうふたり
          </h1>
          <p>
            価値観の近さ <strong>{label}</strong>
          </p>
        </div>
        <div className="stat-grid">
          <div className="stat">
            価値観の近さ<strong>{score}%</strong>
            {label}
          </div>
          <div className="stat">
            相互理解度<strong>{understand(s.predictions, b)}%</strong>
            {s.creator} → {s.partner}
          </div>
          <div className="stat">
            相互理解度
            <strong>{understand(s.partnerPredictions, s.answers)}%</strong>
            {s.partner} → {s.creator}
          </div>
          <div className="stat">
            世界観
            <strong>
              {wa.name} × {wb.name}
            </strong>
            違いも会話の種に
          </div>
        </div>
        <div className="detail-grid">
          <section className="detail">
            <h3>似ていたところ</h3>
            <ul>
              {same.map((q, i) => (
                <li key={q.id}>{q.options[s.answers[questions.indexOf(q)]]}</li>
              ))}
            </ul>
          </section>
          <section className="detail">
            <h3>違いから見えること</h3>
            <ul>
              {diff.map((q) => {
                const i = questions.indexOf(q);
                return (
                  <li key={q.id}>
                    {s.creator}は「{q.options[s.answers[i]]}」、{s.partner}は「
                    {q.options[b[i]]}」
                  </li>
                );
              })}
            </ul>
          </section>
          <section className="detail">
            <h3>意外だった回答</h3>
            <ul>
              <li>予想とは少し違う答えに、新しい一面が見つかりました。</li>
            </ul>
          </section>
          <section className="detail">
            <h3>次に話してみよう</h3>
            <ul>
              <li>理想の休日を一日自由に作るなら？</li>
              <li>お金をかけても大切にしたい経験は？</li>
              <li>疲れたとき、どう過ごしたい？</li>
            </ul>
          </section>
        </div>
        <button className="button" onClick={download}>
          結果カードをPNGで保存
        </button>
        <button
          className="button secondary"
          onClick={() => alert("開発用モック決済：詳細レポートを解放しました")}
        >
          480円で詳細レポートを解放（モック）
        </button>
        <a className="button secondary" href="/">
          サイトTOPへ戻る
        </a>
        <p className="notice">
          この結果は、回答内容をもとにしたエンターテインメントです。心理学的・医学的な診断や、関係性の良し悪しを断定するものではありません。
        </p>
      </div>
    </Shell>
  );
}
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="app-shell">
      <nav className="app-nav">
        <a className="brand" href="/">
          <i>わ</i> 価値観マッチ
        </a>
        <span className="question-meta">登録不要 · 約5分</span>
      </nav>
      {children}
    </main>
  );
}
