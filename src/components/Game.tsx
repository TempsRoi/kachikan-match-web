"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  axes,
  closeness,
  optionLabel,
  personalityFor,
  questions,
  questionSetFor,
  SCORING_VERSION,
  worldFor,
} from "@/lib/questions";
import { apiJson, firebaseEnabled } from "@/lib/firebase";

type Saved = {
  creator: string;
  partner: string;
  answers: number[];
  predictions: number[];
  partnerAnswers?: number[];
  partnerPredictions?: number[];
  paid?: boolean;
  scoringVersion?: string;
};
type SelfProfile = {
  displayName: string;
  answers: number[];
  savedAt: string;
  scoringVersion: typeof SCORING_VERSION;
};
const key = (token: string) => `km:${token}`;
const selfKey = "km:self-profile";
const randomAnswers = (count = questions.length) =>
  Array.from({ length: count }, (_, i) => (i * 7 + 2) % 4);
const savedVersion = (value: Saved) => value.scoringVersion ?? "v1";
function loadSelfProfile(): SelfProfile | null {
  try {
    const value = JSON.parse(localStorage.getItem(selfKey) || "null");
    return value?.scoringVersion === SCORING_VERSION &&
      value?.answers?.length === questions.length
      ? value
      : null;
  } catch {
    return null;
  }
}
function saveSelfProfile(displayName: string, answers: number[]) {
  if (answers.length !== questions.length) return;
  localStorage.setItem(
    selfKey,
    JSON.stringify({
      displayName,
      answers,
      savedAt: new Date().toISOString(),
      scoringVersion: SCORING_VERSION,
    } satisfies SelfProfile),
  );
}
export function StartGame() {
  const router = useRouter();
  const [creator, setCreator] = useState("");
  const [partner, setPartner] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState<SelfProfile | null>(null);
  const [reuseAnswers, setReuseAnswers] = useState(true);
  const savedPersonality = profile ? personalityFor(profile.answers) : null;
  useEffect(() => {
    const stored = loadSelfProfile();
    if (stored) {
      // localStorage is only available after the client has mounted.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(stored);
      setCreator(stored.displayName);
    }
  }, []);
  async function begin() {
    if (!creator.trim() || !partner.trim()) return;
    setBusy(true);
    setError("");
    try {
      let token = crypto.randomUUID().replaceAll("-", "").slice(0, 24);
      if (firebaseEnabled) {
        const data = await apiJson<{ token: string }>("/api/sessions", {
          method: "POST",
          body: JSON.stringify({ creatorName: creator, partnerName: partner }),
        });
        token = data.token;
      }
      localStorage.setItem(
        key(token),
        JSON.stringify({
          creator,
          partner,
          answers: reuseAnswers && profile ? profile.answers : [],
          predictions: [],
          scoringVersion: SCORING_VERSION,
        }),
      );
      router.push(`/play/${token}?role=creator`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "開始できませんでした");
      setBusy(false);
    }
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
        {profile && savedPersonality && (
          <section className="saved-profile">
            <img
              src={savedPersonality.world.image}
              alt={`${savedPersonality.style.name}のイメージ`}
            />
            <div>
              <p className="eyebrow">SAVED ANSWERS</p>
              <h2>
                {profile.displayName}さん · {savedPersonality.style.name}
              </h2>
              <p>前回の自分の回答24問が保存されています。</p>
              <label className="reuse-toggle">
                <input
                  type="checkbox"
                  checked={reuseAnswers}
                  onChange={(event) => setReuseAnswers(event.target.checked)}
                />
                <span>保存した回答を使う</span>
              </label>
            </div>
          </section>
        )}
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
        <button className="button" onClick={begin} disabled={busy}>
          {busy
            ? "準備しています…"
            : reuseAnswers && profile
              ? "相手の答えを予想する →"
              : "自分の質問に答える →"}
        </button>
        {error && <p className="error-message">{error}</p>}
        <p className="notice">
          自分の回答はこの端末に保存され、次回から再利用できます。回答内容は、招待した相手と結果を確認するために共有されます。
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
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const requestedRole =
      new URLSearchParams(location.search).get("role") === "partner"
        ? "partner"
        : "creator";
    // Restore the URL-selected role and local draft after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRole(requestedRole);
    const restoreProgress = (data: Saved) => {
      setSaved(data);
      const activeQuestions = questionSetFor(savedVersion(data));
      const ownAnswers =
        requestedRole === "creator" ? data.answers : data.partnerAnswers || [];
      const ownPredictions =
        requestedRole === "creator"
          ? data.predictions
          : data.partnerPredictions || [];
      if (ownAnswers.length === activeQuestions.length) {
        setPhase("predict");
        const nextPrediction = ownPredictions.findIndex(
          (value) => value === undefined,
        );
        setIdx(nextPrediction >= 0 ? nextPrediction : 0);
      }
    };
    const local = localStorage.getItem(key(token));
    if (local) {
      restoreProgress(JSON.parse(local));
      return;
    }
    if (!firebaseEnabled || requestedRole !== "partner") {
      router.push("/");
      return;
    }
    apiJson<{
      creator: string;
      partner: string;
      role: "creator" | "partner";
      scoringVersion: string;
    }>(`/api/sessions/${token}/join`, { method: "POST" })
      .then((data) => {
        const reusable =
          data.scoringVersion === SCORING_VERSION ? loadSelfProfile() : null;
        const initial: Saved = {
          creator: data.creator,
          partner: data.partner,
          answers: [],
          predictions: [],
          partnerAnswers: reusable?.answers || [],
          partnerPredictions: [],
          scoringVersion: data.scoringVersion,
        };
        localStorage.setItem(key(token), JSON.stringify(initial));
        restoreProgress(initial);
      })
      .catch((cause) =>
        setError(
          cause instanceof Error ? cause.message : "招待を開けませんでした",
        ),
      );
  }, [token, router]);
  if (!saved)
    return (
      <Shell>
        <div className="panel">
          <h1>{error || "招待を確認しています…"}</h1>
          {error && (
            <Link className="button secondary" href="/">
              TOPへ戻る
            </Link>
          )}
        </div>
      </Shell>
    );
  const current = saved;
  const activeQuestions = questionSetFor(savedVersion(current));
  const predictionQs = activeQuestions.filter((q) => q.prediction);
  const q = phase === "answer" ? activeQuestions[idx] : predictionQs[idx];
  const target = role === "creator" ? current.partner : current.creator;
  const activeField =
    phase === "answer"
      ? role === "creator"
        ? "answers"
        : "partnerAnswers"
      : role === "creator"
        ? "predictions"
        : "partnerPredictions";
  const selectedChoice = (current[activeField] as number[] | undefined)?.[idx];
  function goBack() {
    setError("");
    if (idx > 0) {
      setIdx(idx - 1);
      return;
    }
    if (phase === "predict") {
      setPhase("answer");
      setIdx(activeQuestions.length - 1);
    }
  }
  async function choose(choice: number) {
    const arr = [...((current[activeField] as number[] | undefined) || [])];
    arr[idx] = choice;
    const next = { ...current, [activeField]: arr };
    setSaved(next);
    localStorage.setItem(key(token), JSON.stringify(next));
    const total =
      phase === "answer" ? activeQuestions.length : predictionQs.length;
    if (idx + 1 < total) setIdx(idx + 1);
    else if (phase === "answer") {
      if (savedVersion(next) === SCORING_VERSION) {
        saveSelfProfile(
          role === "creator" ? next.creator : next.partner,
          role === "creator" ? next.answers : next.partnerAnswers || [],
        );
      }
      setPhase("predict");
      setIdx(0);
    } else {
      if (savedVersion(next) === SCORING_VERSION) {
        saveSelfProfile(
          role === "creator" ? next.creator : next.partner,
          role === "creator" ? next.answers : next.partnerAnswers || [],
        );
      }
      if (firebaseEnabled) {
        setSaving(true);
        try {
          const answers =
            role === "creator" ? next.answers : next.partnerAnswers || [];
          const predictions =
            role === "creator"
              ? next.predictions
              : next.partnerPredictions || [];
          await apiJson(`/api/sessions/${token}/responses`, {
            method: "POST",
            body: JSON.stringify({ role, answers, predictions }),
          });
        } catch (cause) {
          setSaving(false);
          setError(
            cause instanceof Error
              ? cause.message
              : "回答を保存できませんでした",
          );
          return;
        }
      }
      router.push(role === "creator" ? `/invite/${token}` : `/result/${token}`);
    }
  }
  const total =
    phase === "answer" ? activeQuestions.length : predictionQs.length;
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
          {q.options.map((option, i) => (
            <button
              className={`option ${selectedChoice === i ? "active" : ""}`}
              key={option.label}
              onClick={() => choose(i)}
              aria-pressed={selectedChoice === i}
            >
              {String.fromCharCode(65 + i)}　{option.label}
            </button>
          ))}
        </div>
        <div className="question-navigation">
          <button
            className="back-button"
            onClick={goBack}
            disabled={phase === "answer" && idx === 0}
          >
            ← 前の質問へ
          </button>
          <span>回答はあとから変更できます</span>
        </div>
        <p className="notice">
          正解・不正解はありません。いちばん近いものを直感で選んでください。
        </p>
        {saving && <p className="notice">回答を安全に保存しています…</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </Shell>
  );
}
export function Invite({ token }: { token: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState<Saved | null>(null);
  const [copied, setCopied] = useState(false);
  const [completed, setCompleted] = useState(false);
  useEffect(() => {
    const s = localStorage.getItem(key(token));
    if (s) {
      // Restore the local invitation state after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSaved(JSON.parse(s));
    }
    if (firebaseEnabled) {
      const checkStatus = async () => {
        try {
          const data = await apiJson<{ status: string }>(
            `/api/sessions/${token}`,
          );
          if (data.status === "completed") {
            setCompleted(true);
            document.title = "回答が届きました！｜フタリシル";
          }
        } catch {}
      };
      void checkStatus();
      const timer = window.setInterval(checkStatus, 5000);
      return () => {
        window.clearInterval(timer);
        document.title = "フタリシル｜ふたりで遊ぶ価値観マッチ";
      };
    }
  }, [token]);
  if (!saved) return null;
  const current = saved;
  const isV2 = savedVersion(current) === SCORING_VERSION;
  const myPersonality = isV2 ? personalityFor(current.answers) : null;
  const myWorld = myPersonality?.world ?? worldFor(current.answers);
  const url =
    typeof location === "undefined"
      ? ""
      : `${location.origin}/play/${token}?role=partner`;
  function simulate() {
    const next = {
      ...current,
      partnerAnswers: randomAnswers(
        questionSetFor(savedVersion(current)).length,
      ),
      partnerPredictions: current.answers
        .map((v, i) => (i % 3 ? v : (v + 1) % 4))
        .slice(0, 8),
    };
    localStorage.setItem(key(token), JSON.stringify(next));
    router.push(`/result/${token}`);
  }
  return (
    <Shell>
      <div className={`panel invite-panel ${completed ? "is-completed" : ""}`}>
        <section className="solo-world">
          <p className="eyebrow">
            {myPersonality ? "YOUR RELATIONSHIP STYLE" : "YOUR WORLD"}
          </p>
          <img
            src={myWorld.image}
            alt={`${myPersonality?.style.name ?? myWorld.name}のイメージ`}
          />
          <div>
            <p>
              {current.creator}さんの
              {myPersonality ? "関係スタイルは" : "世界観は"}
            </p>
            <h1>{myPersonality?.style.name ?? myWorld.name}</h1>
            <p>{myPersonality?.style.tagline ?? myWorld.desc}</p>
            {myPersonality && (
              <div className="solo-traits">
                {myPersonality.axes.map((axis) => (
                  <span key={axis.key}>{axis.shortLabel}</span>
                ))}
              </div>
            )}
          </div>
        </section>

        {completed ? (
          <section className="arrival-state" aria-live="polite">
            <div className="arrival-mark">✓</div>
            <p className="eyebrow">ANSWER RECEIVED</p>
            <h2>
              {current.partner}さんから
              <br />
              回答が届きました！
            </h2>
            <p>ふたりの関係スタイルと、予想の答え合わせを見てみましょう。</p>
            <button
              className="button arrival-button"
              onClick={() => router.push(`/result/${token}`)}
            >
              ふたりの結果を見る →
            </button>
          </section>
        ) : (
          <>
            <section className="waiting-state" aria-live="polite">
              <div className="waiting-visual">
                <img src={myWorld.image} alt="" />
                <div className="waiting-line">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="empty-person">?</div>
              </div>
              <p className="eyebrow">WAITING FOR ANSWER</p>
              <h2>
                {current.partner}さんの
                <br />
                回答を待っています
              </h2>
              <div className="waiting-dots">
                <i />
                <i />
                <i />
              </div>
              <p>
                この画面は閉じても大丈夫です。戻ってくると自動で確認します。
              </p>
            </section>

            <section className="invite-share">
              <h3>まだ送っていない場合は、招待をシェア</h3>
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
                    title: "フタリシル",
                    text: "私の答えも予想してみて！",
                    url,
                  })
                }
              >
                共有メニューを開く
              </button>
            </section>
          </>
        )}
        {!firebaseEnabled && !completed && (
          <button className="button secondary" onClick={simulate}>
            デモ用：相手の回答を受け取る
          </button>
        )}
      </div>
    </Shell>
  );
}
export function Result({ token }: { token: string }) {
  const [s, setS] = useState<Saved | null>(null);
  const [error, setError] = useState("");
  const [reportUnlocked, setReportUnlocked] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  useEffect(() => {
    if (firebaseEnabled) {
      const loadResult = async () => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("checkout") === "success" && params.get("session_id")) {
          setPaymentMessage("支払いを確認しています…");
          await apiJson<{ paid: boolean }>("/api/checkout/confirm", {
            method: "POST",
            body: JSON.stringify({ sessionId: params.get("session_id") }),
          });
          setPaymentMessage(
            "お支払いが完了しました。詳細レポートを解放しました。",
          );
          window.history.replaceState({}, "", `/result/${token}`);
        } else if (params.get("checkout") === "cancelled") {
          setPaymentMessage(
            "決済はキャンセルされました。料金は発生していません。",
          );
          window.history.replaceState({}, "", `/result/${token}`);
        }
        return apiJson<Saved>(`/api/sessions/${token}/result`);
      };
      loadResult()
        .then((data) => {
          localStorage.setItem(key(token), JSON.stringify(data));
          setS(data);
          setReportUnlocked(
            Boolean(
              data.paid ||
              new URLSearchParams(window.location.search).get("paid") === "1",
            ),
          );
        })
        .catch((cause) =>
          setError(
            cause instanceof Error
              ? cause.message
              : "結果を取得できませんでした",
          ),
        );
    } else {
      const raw = localStorage.getItem(key(token));
      if (raw) {
        // Restore the local demo result after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setS(JSON.parse(raw));
        setReportUnlocked(
          new URLSearchParams(window.location.search).get("paid") === "1",
        );
      }
    }
  }, [token]);
  if (!s)
    return (
      <Shell>
        <div className="panel">
          <h1>{error || "結果を読み込んでいます…"}</h1>
          {error && (
            <Link className="button secondary" href={`/invite/${token}`}>
              招待画面へ戻る
            </Link>
          )}
        </div>
      </Shell>
    );
  const result = s;
  const scoringVersion = savedVersion(result);
  const resultQuestions = questionSetFor(scoringVersion);
  const isV2 = scoringVersion === SCORING_VERSION;
  const b = result.partnerAnswers || randomAnswers(resultQuestions.length);
  const score = closeness(s.answers, b, resultQuestions.length);
  const creatorPersonality = isV2 ? personalityFor(s.answers) : null;
  const partnerPersonality = isV2 ? personalityFor(b) : null;
  const wa = creatorPersonality?.world ?? worldFor(s.answers),
    wb = partnerPersonality?.world ?? worldFor(b);
  const creatorIdentity = creatorPersonality?.style.name ?? wa.name;
  const partnerIdentity = partnerPersonality?.style.name ?? wb.name;
  const label =
    score >= 85
      ? "とても近い"
      : score >= 70
        ? "ほどよく近い"
        : score >= 50
          ? "違いが刺激になる"
          : "新しい発見が多い";
  const same = resultQuestions
    .filter((_, i) => s.answers[i] === b[i])
    .slice(0, 4);
  const diff = resultQuestions
    .filter((_, i) => s.answers[i] !== b[i])
    .slice(0, 4);
  const categoryScores = [...new Set(resultQuestions.map((q) => q.category))]
    .map((category) => {
      const indexes = resultQuestions
        .map((q, index) => (q.category === category ? index : -1))
        .filter((index) => index >= 0);
      const points = indexes.reduce(
        (total, index) =>
          total +
          (s.answers[index] === b[index]
            ? 2
            : Math.abs(s.answers[index] - b[index]) === 1
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
  const predictionQuestions = resultQuestions.filter((q) => q.prediction);
  const surprises = [
    ...predictionQuestions.flatMap((question, predictionIndex) => {
      const questionIndex = resultQuestions.indexOf(question);
      return s.predictions[predictionIndex] !== b[questionIndex]
        ? [
            `${s.creator}さんは「${optionLabel(question, s.predictions[predictionIndex])}」と予想。${s.partner}さんの本音は「${optionLabel(question, b[questionIndex])}」でした。`,
          ]
        : [];
    }),
    ...predictionQuestions.flatMap((question, predictionIndex) => {
      const questionIndex = resultQuestions.indexOf(question);
      return s.partnerPredictions?.[predictionIndex] !==
        s.answers[questionIndex]
        ? [
            `${s.partner}さんは「${optionLabel(question, s.partnerPredictions?.[predictionIndex] ?? 0)}」と予想。${s.creator}さんの本音は「${optionLabel(question, s.answers[questionIndex])}」でした。`,
          ]
        : [];
    }),
  ].slice(0, 3);
  const relationshipHeadline =
    score >= 85
      ? "同じ景色を見ながら、自然体で歩けるふたり"
      : score >= 70
        ? "安心できる共通点と、新鮮な違いがあるふたり"
        : score >= 50
          ? "話すほど、お互いの世界が広がっていくふたり"
          : "違う景色を持ち寄って、発見を増やせるふたり";
  const relationshipSummary =
    score >= 85
      ? `大切にしたいことの方向がよく似ています。ただし「分かっているはず」と思わず、ときどき言葉で確かめることが親しさを長く保つ鍵です。`
      : score >= 70
        ? `土台になる価値観は近く、細かな選び方にはそれぞれらしさがあります。共通点で安心しながら、違いをデートや休日の新しい選択肢に変えられそうです。`
        : score >= 50
          ? `同じ答えよりも、理由を聞くことで魅力が増す組み合わせです。恋愛や親しい関係では、相手の反応を決めつけず「どうしてそう思う？」と聞くことが距離を縮めます。`
          : `考え方の入口が違うからこそ、自分にはない視点を受け取れます。無理に合わせるより、お互いが心地よい距離や愛情の伝え方を具体的に話すことが大切です。`;
  const axisComparisons =
    creatorPersonality && partnerPersonality
      ? creatorPersonality.axes
          .map((creatorAxis) => ({
            creator: creatorAxis,
            partner:
              partnerPersonality.axes.find(
                (partnerAxis) => partnerAxis.key === creatorAxis.key,
              ) ?? partnerPersonality.axes[0],
            distance: Math.abs(
              creatorAxis.position -
                (partnerPersonality.axes.find(
                  (partnerAxis) => partnerAxis.key === creatorAxis.key,
                )?.position ?? 0),
            ),
          }))
          .sort((a, b) => a.distance - b.distance)
      : [];
  const closestAxis = axisComparisons[0];
  const contrastAxis = axisComparisons.at(-1);
  const closenessMoment =
    s.answers[21] === b[21]
      ? `ふたりは「一緒にいる時間の心地よさ」を似た形で感じやすいようです。親しい関係でも、自然に満たされる瞬間を共有しやすいでしょう。`
      : `${s.creator}さんは「${optionLabel(resultQuestions[21], s.answers[21])}」、${s.partner}さんは「${optionLabel(resultQuestions[21], b[21])}」に喜びを感じます。好意が伝わらないときは、気持ちではなく“伝わり方”が違うだけかもしれません。`;
  const understand = (p: number[] | undefined, a: number[]) =>
    Math.round(
      ((p || []).reduce(
        (n, v, i) => n + (v === a[i] ? 1 : Math.abs(v - a[i]) === 1 ? 0.5 : 0),
        0,
      ) /
        8) *
        100,
    );
  const creatorUnderstanding = understand(s.predictions, b);
  const partnerUnderstanding = understand(s.partnerPredictions, s.answers);
  const lowestCategory = categoryScores.at(-1)?.category || "価値観";
  const relationshipManual = [
    {
      title: "連絡と会話",
      text:
        s.answers[1] === b[1]
          ? `返信の心地よいペースが近いふたりです。連絡頻度より、今の自然なリズムを大切にすると安心が続きます。`
          : `${s.creator}さんは「${optionLabel(resultQuestions[1], s.answers[1])}」、${s.partner}さんは「${optionLabel(resultQuestions[1], b[1])}」。返信速度を好意の大きさと結びつけず、忙しい日の目安を共有すると安心です。`,
    },
    {
      title: "疲れたときの支え方",
      text:
        s.answers[9] === b[9]
          ? `疲れた日の回復方法が似ています。相手がしんどそうなときも、自分が嬉しい支え方を提案しやすいふたりです。`
          : `${s.creator}さんは「${optionLabel(resultQuestions[9], s.answers[9])}」、${s.partner}さんは「${optionLabel(resultQuestions[9], b[9])}」で回復します。「話す？そっとしておく？」と一言確認するのが最良の気遣いです。`,
    },
    {
      title: "予定と将来",
      text:
        s.answers[20] === b[20]
          ? `将来を考える解像度が近く、ふたりの予定を相談しやすい傾向です。小さな楽しみを一緒に決めると関係が育ちます。`
          : `${s.creator}さんは「${optionLabel(resultQuestions[20], s.answers[20])}」、${s.partner}さんは「${optionLabel(resultQuestions[20], b[20])}」。計画する範囲と自由に残す範囲を分けると、どちらも窮屈になりません。`,
    },
    {
      title: "好意の伝わり方",
      text: closenessMoment,
    },
  ];
  async function startCheckout() {
    setCheckoutBusy(true);
    setError("");
    try {
      const data = await apiJson<{ url: string }>("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      window.location.href = data.url;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "決済を開始できませんでした",
      );
      setCheckoutBusy(false);
    }
  }
  return (
    <Shell>
      <div className="panel" style={{ maxWidth: 820 }}>
        {paymentMessage && (
          <p className="payment-message" aria-live="polite">
            {paymentMessage}
          </p>
        )}
        <div className="result-hero">
          <p className="eyebrow">
            {isV2 ? "ふたりの関係スタイル" : "ふたりの世界観"}
          </p>
          <div className="result-worlds">
            <span>
              <img src={wa.image} alt={`${creatorIdentity}のイメージ`} />
              <b>
                {s.creator} · {creatorIdentity}
              </b>
            </span>
            <span>
              <img src={wb.image} alt={`${partnerIdentity}のイメージ`} />
              <b>
                {s.partner} · {partnerIdentity}
              </b>
            </span>
          </div>
          <h1>{relationshipHeadline}</h1>
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
            相互理解度<strong>{creatorUnderstanding}%</strong>
            {s.creator} → {s.partner}
          </div>
          <div className="stat">
            相互理解度
            <strong>{partnerUnderstanding}%</strong>
            {s.partner} → {s.creator}
          </div>
          <div className="stat">
            {isV2 ? "関係スタイル" : "世界観"}
            <strong>
              {creatorIdentity} × {partnerIdentity}
            </strong>
            違いも会話の種に
          </div>
        </div>
        {creatorPersonality && partnerPersonality && (
          <section className="personality-comparison">
            <p className="eyebrow">PERSONALITY AXES</p>
            <h2>ふたりの「関わり方」を4つの軸で見る</h2>
            <div className="personality-cards">
              {[
                { id: "creator", name: s.creator, profile: creatorPersonality },
                { id: "partner", name: s.partner, profile: partnerPersonality },
              ].map(({ id, name, profile }) => (
                <article key={id}>
                  <div className="personality-card-head">
                    <img src={profile.world.image} alt="" />
                    <div>
                      <small>{name}さん</small>
                      <h3>{profile.style.name}</h3>
                    </div>
                  </div>
                  <p>{profile.style.tagline}</p>
                  <div className="trait-tags">
                    {profile.axes.map((axis) => (
                      <span key={axis.key}>{axis.shortLabel}</span>
                    ))}
                  </div>
                  <p className="personality-evidence">
                    「{profile.evidence[0].answer}」という回答から、
                    {profile.evidence[0].insight}
                  </p>
                </article>
              ))}
            </div>
            <div className="axis-comparison-list">
              {creatorPersonality.axes.map((creatorAxis) => {
                const partnerAxis = partnerPersonality.axes.find(
                  (axis) => axis.key === creatorAxis.key,
                );
                return (
                  <div className="axis-comparison" key={creatorAxis.key}>
                    <header>
                      <b>{creatorAxis.name}</b>
                      <span>
                        {creatorAxis.shortLabel} ／ {partnerAxis?.shortLabel}
                      </span>
                    </header>
                    <div className="axis-poles">
                      <small>
                        {
                          axes.find((axis) => axis.key === creatorAxis.key)
                            ?.negative.shortLabel
                        }
                      </small>
                      <small>
                        {
                          axes.find((axis) => axis.key === creatorAxis.key)
                            ?.positive.shortLabel
                        }
                      </small>
                    </div>
                    <div className="axis-track">
                      <i
                        className="creator-dot"
                        title={`${s.creator}: ${creatorAxis.label}`}
                        style={{ left: `${(creatorAxis.position + 100) / 2}%` }}
                      />
                      <i
                        className="partner-dot"
                        title={`${s.partner}: ${partnerAxis?.label}`}
                        style={{
                          left: `${((partnerAxis?.position ?? 0) + 100) / 2}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {closestAxis && contrastAxis && (
              <p className="axis-summary">
                「{closestAxis.creator.name}」は近い感覚を持ちやすい軸です。 「
                {contrastAxis.creator.name}
                」は違いが出やすいぶん、理由を聞くと相手らしさが見えてきます。
              </p>
            )}
          </section>
        )}
        <section className="relationship-reading">
          <p className="eyebrow">YOUR RELATIONSHIP</p>
          <h2>このふたりらしさ</h2>
          <p>{relationshipSummary}</p>
          <div className="category-bars">
            {categoryScores.slice(0, 4).map(({ category, score }) => (
              <div key={category}>
                <span>{category}</span>
                <i>
                  <b style={{ width: `${score}%` }} />
                </i>
                <strong>{score}%</strong>
              </div>
            ))}
          </div>
          <p className="category-note">
            とくに近かったのは「{categoryScores[0].category}」。一方、「
            {categoryScores.at(-1)?.category}
            」は理由を聞くと新しい発見がありそうです。
          </p>
        </section>
        <div className="detail-grid">
          <section className="detail">
            <h3>心が重なったところ</h3>
            <ul>
              {same.map((q) => (
                <li key={q.id}>
                  <b>{q.question}</b>
                  <br />
                  ふたりとも「
                  {optionLabel(q, s.answers[resultQuestions.indexOf(q)])}」
                </li>
              ))}
            </ul>
          </section>
          <section className="detail">
            <h3>ふたりらしい違い</h3>
            <ul>
              {diff.map((q) => {
                const i = resultQuestions.indexOf(q);
                return (
                  <li key={q.id}>
                    {s.creator}は「{optionLabel(q, s.answers[i])}」、
                    {s.partner}は「{optionLabel(q, b[i])}」
                  </li>
                );
              })}
            </ul>
          </section>
          <section className="detail">
            <h3>予想と本音のギャップ</h3>
            <ul>
              {surprises.length ? (
                surprises.map((text) => <li key={text}>{text}</li>)
              ) : (
                <li>
                  お互いの予想がよく当たっていました。普段から相手をよく見ているふたりです。
                </li>
              )}
            </ul>
          </section>
          <section className="detail">
            <h3>距離をもう少し近づける質問</h3>
            <ul>
              <li>理想の休日を一日自由に作るなら？</li>
              <li>「大切にされている」と感じるのはどんなとき？</li>
              <li>ふたりで一度やってみたいことは？</li>
            </ul>
          </section>
        </div>
        <section className="closeness-note">
          <span>♡</span>
          <div>
            <h3>親しい関係で大切にしたいこと</h3>
            <p>{closenessMoment}</p>
          </div>
        </section>
        {reportUnlocked ? (
          <section className="premium-report">
            <header className="premium-header">
              <div>
                <p className="eyebrow">FULL REPORT</p>
                <h2>ふたりの詳細レポート</h2>
                <p>24の回答と予想から、関係を育てるヒントを読み解きました。</p>
              </div>
              <span>解放済み</span>
            </header>

            <section className="premium-section">
              <h3>ふたりの関係トリセツ</h3>
              <div className="manual-grid">
                {relationshipManual.map((item) => (
                  <article key={item.title}>
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="premium-section">
              <h3>8カテゴリの詳しい比較</h3>
              <div className="category-bars premium-bars">
                {categoryScores.map(({ category, score }) => (
                  <div key={category}>
                    <span>{category}</span>
                    <i>
                      <b style={{ width: `${score}%` }} />
                    </i>
                    <strong>{score}%</strong>
                  </div>
                ))}
              </div>
              <p className="premium-insight">
                「{lowestCategory}
                」は一致率が低めですが、関係の弱点ではありません。次に一緒に選ぶ場面で、お互いの理由を一度聞いてから決めると、違いが役割分担に変わります。
              </p>
            </section>

            <section className="premium-section">
              <h3>相手をどれくらい分かっていた？</h3>
              <div className="understanding-detail">
                <article>
                  <strong>{creatorUnderstanding}%</strong>
                  <h4>
                    {s.creator} → {s.partner}
                  </h4>
                  <p>
                    {creatorUnderstanding >= 75
                      ? "普段の言葉や行動から、相手の考えをよく受け取れています。"
                      : "まだ知らない一面があるからこそ、これからの会話に発見があります。"}
                  </p>
                </article>
                <article>
                  <strong>{partnerUnderstanding}%</strong>
                  <h4>
                    {s.partner} → {s.creator}
                  </h4>
                  <p>
                    {partnerUnderstanding >= 75
                      ? "相手らしい選び方を、かなり具体的に想像できています。"
                      : "予想との違いは、相手の本音を知るための良い入口です。"}
                  </p>
                </article>
              </div>
              <div className="prediction-table">
                {predictionQuestions.map((question, predictionIndex) => {
                  const questionIndex = resultQuestions.indexOf(question);
                  const creatorHit =
                    s.predictions[predictionIndex] === b[questionIndex];
                  const partnerHit =
                    s.partnerPredictions?.[predictionIndex] ===
                    s.answers[questionIndex];
                  return (
                    <div key={question.id}>
                      <span>{question.question}</span>
                      <b className={creatorHit ? "hit" : "miss"}>
                        {s.creator} {creatorHit ? "✓" : "発見"}
                      </b>
                      <b className={partnerHit ? "hit" : "miss"}>
                        {s.partner} {partnerHit ? "✓" : "発見"}
                      </b>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="premium-section">
              <h3>全24問の答え合わせ</h3>
              <div className="all-answers">
                {resultQuestions.map((question, index) => (
                  <article key={question.id}>
                    <div>
                      <small>{question.category}</small>
                      <h4>{question.question}</h4>
                    </div>
                    <p>
                      <b>{s.creator}</b>
                      {optionLabel(question, s.answers[index])}
                    </p>
                    <p>
                      <b>{s.partner}</b>
                      {optionLabel(question, b[index])}
                    </p>
                    <span
                      className={s.answers[index] === b[index] ? "same" : ""}
                    >
                      {s.answers[index] === b[index]
                        ? "共通点"
                        : "違いもヒント"}
                    </span>
                  </article>
                ))}
              </div>
            </section>

            <section className="premium-section action-plan">
              <p className="eyebrow">NEXT 7 DAYS</p>
              <h3>ふたりにおすすめの3つのアクション</h3>
              <ol>
                <li>
                  <b>15分だけ答えの理由を話す</b>「{lowestCategory}
                  」から1問選び、結論ではなく理由を聞いてみる。
                </li>
                <li>
                  <b>小さな予定をひとつ作る</b>
                  共通点の「{categoryScores[0].category}
                  」を生かした時間を一緒に作る。
                </li>
                <li>
                  <b>好意の伝わり方を交換する</b>
                  最近うれしかった相手の行動を、ひとつずつ言葉にする。
                </li>
              </ol>
            </section>
          </section>
        ) : (
          <section className="premium-lock">
            <span className="lock-mark">＋</span>
            <p className="eyebrow">FULL REPORT</p>
            <h2>ふたりの関係を、もう一歩深く。</h2>
            <p>
              一致率だけでは見えない「支え方」「好意の伝わり方」「すれ違いやすい場面」を、24問すべてから読み解きます。
            </p>
            <div className="premium-features">
              <span>関係トリセツ</span>
              <span>8カテゴリ分析</span>
              <span>予想の答え合わせ</span>
              <span>全24問比較</span>
              <span>7日間アクション</span>
            </div>
            <div className="price">
              <strong>480円（税込）</strong>
              <small>買い切り・追加料金なし・ふたりで閲覧</small>
            </div>
            <button
              className="button premium-button"
              onClick={startCheckout}
              disabled={checkoutBusy}
            >
              {checkoutBusy
                ? "決済画面を準備しています…"
                : "詳細レポートを解放する →"}
            </button>
            <p className="purchase-terms">
              決済完了後すぐに提供されます。提供開始後のお客様都合による返金はできません。不具合・重複決済は対応します。カード明細には「KACHIKAN
              MATCH」等と表示されます。
              <br />
              <Link href="/commerce">販売条件</Link>・
              <Link href="/terms">利用規約</Link>
              に同意のうえ購入してください。
            </p>
            {error && <p className="error-message">{error}</p>}
          </section>
        )}
        <Link className="button secondary" href="/">
          サイトTOPへ戻る
        </Link>
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
        <Link className="brand" href="/">
          <i>ふ</i> フタリシル
        </Link>
        <span className="question-meta">登録不要 · 約5分</span>
      </nav>
      {children}
    </main>
  );
}
