"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiJson, firebaseEnabled } from "@/lib/firebase";
import { contentVersionFor } from "@/lib/locales";
import { closeness, optionLabel, SCORING_VERSION } from "@/lib/questions";
import { englishAxes, englishProfile, englishQuestions } from "@/lib/questions-en";

type Saved = {
  creator: string;
  partner: string;
  answers: number[];
  predictions: number[];
  partnerAnswers?: number[];
  partnerPredictions?: number[];
  paid?: boolean;
  scoringVersion?: string;
  locale?: "en";
  contentVersion?: string;
};

type SelfProfile = {
  displayName: string;
  answers: number[];
  savedAt: string;
  scoringVersion: typeof SCORING_VERSION;
};

const gameKey = (token: string) => `km:${token}`;
const selfKey = "km:self-profile:en";
const path = (page: string, token?: string) => `/en/${page}${token ? `/${token}` : ""}`;
const randomAnswers = () => englishQuestions.map((_, index) => (index * 7 + 2) % 4);

function loadSelfProfile(): SelfProfile | null {
  try {
    const value = JSON.parse(localStorage.getItem(selfKey) || "null");
    return value?.scoringVersion === SCORING_VERSION && value?.answers?.length === englishQuestions.length ? value : null;
  } catch {
    return null;
  }
}

function saveSelfProfile(displayName: string, answers: number[]) {
  if (answers.length !== englishQuestions.length) return;
  localStorage.setItem(selfKey, JSON.stringify({ displayName, answers, savedAt: new Date().toISOString(), scoringVersion: SCORING_VERSION } satisfies SelfProfile));
}

export function EnglishStartGame() {
  const router = useRouter();
  const [creator, setCreator] = useState("");
  const [partner, setPartner] = useState("");
  const [profile, setProfile] = useState<SelfProfile | null>(null);
  const [reuseAnswers, setReuseAnswers] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const savedProfile = profile ? englishProfile(profile.answers) : null;

  useEffect(() => {
    const stored = loadSelfProfile();
    if (stored) {
      // Restore browser-only data after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(stored);
      setCreator(stored.displayName);
    }
  }, []);

  async function begin() {
    if (!creator.trim() || !partner.trim()) {
      setError("Enter both names to continue.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      let token = crypto.randomUUID().replaceAll("-", "").slice(0, 24);
      if (firebaseEnabled) {
        const data = await apiJson<{ token: string }>("/api/sessions", {
          method: "POST",
          body: JSON.stringify({ creatorName: creator.trim(), partnerName: partner.trim(), locale: "en" }),
        });
        token = data.token;
      }
      const saved: Saved = {
        creator: creator.trim(),
        partner: partner.trim(),
        answers: reuseAnswers && profile ? profile.answers : [],
        predictions: [],
        scoringVersion: SCORING_VERSION,
        locale: "en",
        contentVersion: contentVersionFor("en"),
      };
      localStorage.setItem(gameKey(token), JSON.stringify(saved));
      router.push(`${path("play", token)}?role=creator`);
    } catch {
      setError("We couldn't start the game. Please try again.");
      setBusy(false);
    }
  }

  return (
    <EnglishShell>
      <div className="panel">
        <p className="eyebrow">STEP 1 OF 3</p>
        <h1>What should we call<br />the two of you?</h1>
        <p>Nicknames are perfect. No real names or email addresses required.</p>
        {profile && savedProfile && (
          <section className="saved-profile">
            <img src={savedProfile.world.image} alt="" />
            <div>
              <p className="eyebrow">SAVED ANSWERS</p>
              <h2>{profile.displayName} · {savedProfile.style.name}</h2>
              <p>Your 24 answers from your previous game are saved on this device.</p>
              <label className="reuse-toggle">
                <input type="checkbox" checked={reuseAnswers} onChange={(event) => setReuseAnswers(event.target.checked)} />
                <span>Reuse my saved answers</span>
              </label>
            </div>
          </section>
        )}
        <div className="field">
          <label htmlFor="creator-name">Your name</label>
          <input id="creator-name" value={creator} maxLength={20} onChange={(event) => setCreator(event.target.value)} placeholder="e.g. Alex" autoComplete="nickname" />
        </div>
        <div className="field">
          <label htmlFor="partner-name">Their name</label>
          <input id="partner-name" value={partner} maxLength={20} onChange={(event) => setPartner(event.target.value)} placeholder="e.g. Jamie" autoComplete="off" />
        </div>
        <button className="button" onClick={begin} disabled={busy}>
          {busy ? "Setting things up…" : reuseAnswers && profile ? "Predict their answers →" : "Answer my questions →"}
        </button>
        {error && <p className="error-message">{error}</p>}
        <p className="notice">Your own answers are saved on this device so you can reuse them. Your answers are shared only with the person you invite so you can view the result together.</p>
      </div>
    </EnglishShell>
  );
}

export function EnglishPlayGame({ token }: { token: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState<Saved | null>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"answer" | "predict">("answer");
  const [role, setRole] = useState<"creator" | "partner">("creator");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const predictionQuestions = englishQuestions.filter((question) => question.prediction);

  useEffect(() => {
    const requestedRole = new URLSearchParams(location.search).get("role") === "partner" ? "partner" : "creator";
    // Restore URL and local state after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRole(requestedRole);
    const restore = (data: Saved) => {
      if (data.locale && data.locale !== "en") {
        router.replace(requestedRole === "partner" ? `/play/${token}?role=partner` : "/");
        return;
      }
      setSaved(data);
      const answers = requestedRole === "creator" ? data.answers : data.partnerAnswers || [];
      const predictions = requestedRole === "creator" ? data.predictions : data.partnerPredictions || [];
      if (answers.length === englishQuestions.length) {
        setPhase("predict");
        setIndex(Math.max(0, predictions.findIndex((value) => value === undefined)));
      }
    };
    const local = localStorage.getItem(gameKey(token));
    if (local) {
      restore(JSON.parse(local));
      return;
    }
    if (!firebaseEnabled || requestedRole !== "partner") {
      router.push("/en");
      return;
    }
    apiJson<{ creator: string; partner: string; scoringVersion: string; locale: "ja" | "en"; contentVersion: string }>(`/api/sessions/${token}/join`, { method: "POST" })
      .then((data) => {
        if (data.locale !== "en") {
          router.replace(`/play/${token}?role=partner`);
          return;
        }
        const reusable = data.scoringVersion === SCORING_VERSION ? loadSelfProfile() : null;
        const initial: Saved = { creator: data.creator, partner: data.partner, answers: [], predictions: [], partnerAnswers: reusable?.answers || [], partnerPredictions: [], scoringVersion: data.scoringVersion, locale: "en", contentVersion: data.contentVersion };
        localStorage.setItem(gameKey(token), JSON.stringify(initial));
        restore(initial);
      })
      .catch(() => setError("We couldn't open this invitation. Check the link and try again."));
  }, [router, token]);

  if (!saved) return <EnglishShell><div className="panel"><h1>{error || "Checking your invitation…"}</h1>{error && <Link className="button secondary" href="/en">Back to home</Link>}</div></EnglishShell>;

  const current = saved;
  const question = phase === "answer" ? englishQuestions[index] : predictionQuestions[index];
  const target = role === "creator" ? current.partner : current.creator;
  const activeField = phase === "answer" ? (role === "creator" ? "answers" : "partnerAnswers") : (role === "creator" ? "predictions" : "partnerPredictions");
  const selectedChoice = (current[activeField] as number[] | undefined)?.[index];
  const total = phase === "answer" ? englishQuestions.length : predictionQuestions.length;

  function goBack() {
    setError("");
    if (index > 0) return setIndex(index - 1);
    if (phase === "predict") {
      setPhase("answer");
      setIndex(englishQuestions.length - 1);
    }
  }

  async function choose(choice: number) {
    const values = [...((current[activeField] as number[] | undefined) || [])];
    values[index] = choice;
    const next = { ...current, [activeField]: values };
    setSaved(next);
    localStorage.setItem(gameKey(token), JSON.stringify(next));
    if (index + 1 < total) return setIndex(index + 1);
    if (phase === "answer") {
      const ownAnswers = role === "creator" ? next.answers : next.partnerAnswers || [];
      saveSelfProfile(role === "creator" ? next.creator : next.partner, ownAnswers);
      setPhase("predict");
      setIndex(0);
      return;
    }
    saveSelfProfile(role === "creator" ? next.creator : next.partner, role === "creator" ? next.answers : next.partnerAnswers || []);
    if (firebaseEnabled) {
      setSaving(true);
      try {
        await apiJson(`/api/sessions/${token}/responses`, {
          method: "POST",
          body: JSON.stringify({ role, answers: role === "creator" ? next.answers : next.partnerAnswers || [], predictions: role === "creator" ? next.predictions : next.partnerPredictions || [] }),
        });
      } catch {
        setSaving(false);
        setError("We couldn't save your answers. Please try again.");
        return;
      }
    }
    router.push(role === "creator" ? path("invite", token) : path("result", token));
  }

  return (
    <EnglishShell>
      <div className="panel">
        <p className="question-meta">{phase === "answer" ? `${question.category} · YOUR ANSWER` : `PREDICT THEIR ANSWER`}　{index + 1} / {total}</p>
        <div className="progress"><span style={{ width: `${((index + 1) / total) * 100}%` }} /></div>
        <h1>{phase === "predict" ? `Which answer would ${target} choose?` : question.question}</h1>
        {phase === "predict" && <p>{question.question}</p>}
        <div className="options">
          {question.options.map((option, optionIndex) => (
            <button className={`option ${selectedChoice === optionIndex ? "active" : ""}`} key={option.label} onClick={() => choose(optionIndex)} aria-pressed={selectedChoice === optionIndex}>
              {String.fromCharCode(65 + optionIndex)}　{option.label}
            </button>
          ))}
        </div>
        <div className="question-navigation"><button className="back-button" onClick={goBack} disabled={phase === "answer" && index === 0}>← Previous question</button><span>You can change an answer later</span></div>
        <p className="notice">There are no right or wrong answers. Choose the one that feels closest to you.</p>
        {saving && <p className="notice">Saving your answers securely…</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </EnglishShell>
  );
}

export function EnglishInvite({ token }: { token: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState<Saved | null>(null);
  const [copied, setCopied] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const local = localStorage.getItem(gameKey(token));
    if (local) {
      // Restore browser-only invitation state after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSaved(JSON.parse(local));
    }
    if (!firebaseEnabled) return;
    const check = async () => {
      try {
        const data = await apiJson<{ status: string }>(`/api/sessions/${token}`);
        if (data.status === "completed") setCompleted(true);
      } catch {}
    };
    void check();
    const timer = window.setInterval(check, 5000);
    return () => window.clearInterval(timer);
  }, [token]);

  if (!saved) return null;
  const current = saved;
  const profile = englishProfile(current.answers);
  const invitationUrl = typeof location === "undefined" ? "" : `${location.origin}${path("play", token)}?role=partner`;
  function simulate() {
    const next = {
      ...current,
      partnerAnswers: randomAnswers(),
      partnerPredictions: englishQuestions
        .filter((question) => question.prediction)
        .map((question, predictionIndex) => {
          const answer = current.answers[englishQuestions.indexOf(question)];
          return predictionIndex % 3 ? answer : (answer + 1) % 4;
        }),
    };
    localStorage.setItem(gameKey(token), JSON.stringify(next));
    router.push(path("result", token));
  }

  return (
    <EnglishShell>
      <div className={`panel invite-panel ${completed ? "is-completed" : ""}`}>
        <section className="solo-world">
          <p className="eyebrow">YOUR CONNECTION STYLE</p>
          <img src={profile.world.image} alt="" />
          <div><p>{saved.creator}&apos;s style</p><h1>{profile.style.name}</h1><p>{profile.style.tagline}</p><div className="solo-traits">{profile.axes.map((axis) => <span key={axis.key}>{axis.shortLabel}</span>)}</div></div>
        </section>
        {completed ? (
          <section className="arrival-state" aria-live="polite"><div className="arrival-mark">✓</div><p className="eyebrow">ANSWER RECEIVED</p><h2>{saved.partner} has finished!</h2><p>See your connection styles and find out how well you predicted each other.</p><button className="button arrival-button" onClick={() => router.push(path("result", token))}>See our result →</button></section>
        ) : (
          <>
            <section className="waiting-state" aria-live="polite"><div className="waiting-visual"><img src={profile.world.image} alt="" /><div className="waiting-line"><i /><i /><i /></div><div className="empty-person">?</div></div><p className="eyebrow">WAITING FOR ANSWERS</p><h2>Waiting for {saved.partner}</h2><div className="waiting-dots"><i /><i /><i /></div><p>You can close this page. We will check again automatically when you return.</p></section>
            <section className="invite-share"><h3>Share the private invitation</h3><p>“I found a fun connection game. Try to predict my answers!”</p><div className="share-url">{invitationUrl}</div><button className="button" onClick={async () => { await navigator.clipboard.writeText(invitationUrl); setCopied(true); }}>{copied ? "Copied ✓" : "Copy invitation link"}</button><button className="button secondary" onClick={() => navigator.share?.({ title: "FutariShiru", text: "Try to predict my answers!", url: invitationUrl })}>Open share menu</button></section>
          </>
        )}
        {!firebaseEnabled && !completed && <button className="button secondary" onClick={simulate}>Demo: receive their answers</button>}
      </div>
    </EnglishShell>
  );
}

export function EnglishResult({ token }: { token: string }) {
  const [saved, setSaved] = useState<Saved | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (firebaseEnabled) {
      apiJson<Saved>(`/api/sessions/${token}/result`).then((data) => { localStorage.setItem(gameKey(token), JSON.stringify(data)); setSaved(data); }).catch(() => setError("We couldn't load this result. It may still be waiting for the other person's answers."));
    } else {
      const local = localStorage.getItem(gameKey(token));
      if (local) {
        // Restore the local demo result after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSaved(JSON.parse(local));
      }
    }
  }, [token]);

  if (!saved) return <EnglishShell><div className="panel"><h1>{error || "Loading your result…"}</h1>{error && <Link className="button secondary" href={path("invite", token)}>Back to invitation</Link>}</div></EnglishShell>;
  const partnerAnswers = saved.partnerAnswers || randomAnswers();
  const creatorProfile = englishProfile(saved.answers);
  const partnerProfile = englishProfile(partnerAnswers);
  const score = closeness(saved.answers, partnerAnswers, englishQuestions.length);
  const label = score >= 85 ? "Very close" : score >= 70 ? "Comfortably close" : score >= 50 ? "Different in energizing ways" : "Full of new discoveries";
  const headline = score >= 85 ? "You naturally see many things the same way" : score >= 70 ? "Grounded in common ground, with room for surprise" : score >= 50 ? "The more you talk, the more your worlds can expand" : "Two perspectives with plenty to discover";
  const predictionQuestions = englishQuestions.filter((question) => question.prediction);
  const understanding = (predictions: number[] | undefined, answers: number[]) => Math.round(((predictions || []).reduce((sum, value, index) => sum + (value === answers[englishQuestions.indexOf(predictionQuestions[index])] ? 1 : Math.abs(value - answers[englishQuestions.indexOf(predictionQuestions[index])]) === 1 ? 0.5 : 0), 0) / predictionQuestions.length) * 100);
  const creatorUnderstanding = understanding(saved.predictions, partnerAnswers);
  const partnerUnderstanding = understanding(saved.partnerPredictions, saved.answers);
  const same = englishQuestions.filter((_, index) => saved.answers[index] === partnerAnswers[index]).slice(0, 4);
  const different = englishQuestions.filter((_, index) => saved.answers[index] !== partnerAnswers[index]).slice(0, 4);
  const categoryScores = [...new Set(englishQuestions.map((question) => question.category))].map((category) => {
    const indexes = englishQuestions.map((question, index) => question.category === category ? index : -1).filter((index) => index >= 0);
    const points = indexes.reduce((sum, index) => sum + (saved.answers[index] === partnerAnswers[index] ? 2 : Math.abs(saved.answers[index] - partnerAnswers[index]) === 1 ? 1 : 0), 0);
    return { category, score: Math.round((points / (indexes.length * 2)) * 100) };
  }).sort((a, b) => b.score - a.score);
  const summary = score >= 85 ? "You tend to value similar things. Keep checking in with words instead of assuming you already know what the other person means." : score >= 70 ? "Your core values feel familiar, while your smaller choices leave room for individuality. Let common ground create safety and turn differences into new things to try." : score >= 50 ? "This pairing becomes more interesting when you ask for the reason behind an answer. Curiosity will bring you closer than guessing what the other person feels." : "Your starting points may differ, which gives each of you a perspective the other may not have. Talk specifically about comfort, space, and how care is best received.";

  return (
    <EnglishShell>
      <div className="panel" style={{ maxWidth: 820 }}>
        <div className="result-hero"><p className="eyebrow">YOUR CONNECTION RESULT</p><div className="result-worlds"><span><img src={creatorProfile.world.image} alt="" /><b>{saved.creator} · {creatorProfile.style.name}</b></span><span><img src={partnerProfile.world.image} alt="" /><b>{saved.partner} · {partnerProfile.style.name}</b></span></div><h1>{headline}</h1><p>Values alignment <strong>{label}</strong></p></div>
        <div className="stat-grid"><div className="stat">Values alignment<strong>{score}%</strong>{label}</div><div className="stat">Prediction accuracy<strong>{creatorUnderstanding}%</strong>{saved.creator} → {saved.partner}</div><div className="stat">Prediction accuracy<strong>{partnerUnderstanding}%</strong>{saved.partner} → {saved.creator}</div><div className="stat">Connection styles<strong>{creatorProfile.style.name} × {partnerProfile.style.name}</strong>Differences can start a conversation</div></div>
        <section className="personality-comparison"><p className="eyebrow">PERSONALITY DIMENSIONS</p><h2>How each of you connects</h2><div className="personality-cards">{[{ name: saved.creator, profile: creatorProfile }, { name: saved.partner, profile: partnerProfile }].map(({ name, profile }) => <article key={name}><div className="personality-card-head"><img src={profile.world.image} alt="" /><div><small>{name}</small><h3>{profile.style.name}</h3></div></div><p>{profile.style.tagline}</p><div className="trait-tags">{profile.axes.map((axis) => <span key={axis.key}>{axis.shortLabel}</span>)}</div><p className="personality-evidence">Choosing “{profile.evidence[0].answer}” suggests that {profile.evidence[0].insight.toLowerCase()}</p></article>)}</div><div className="axis-comparison-list">{creatorProfile.axes.map((creatorAxis) => { const partnerAxis = partnerProfile.axes.find((axis) => axis.key === creatorAxis.key)!; const copy = englishAxes[creatorAxis.key]; return <div className="axis-comparison" key={creatorAxis.key}><header><b>{copy.name}</b><span>{creatorAxis.shortLabel} / {partnerAxis.shortLabel}</span></header><div className="axis-poles"><small>{copy.negative}</small><small>{copy.positive}</small></div><div className="axis-track"><i className="creator-dot" title={`${saved.creator}: ${creatorAxis.label}`} style={{ left: `${(creatorAxis.position + 100) / 2}%` }} /><i className="partner-dot" title={`${saved.partner}: ${partnerAxis.label}`} style={{ left: `${(partnerAxis.position + 100) / 2}%` }} /></div></div>; })}</div></section>
        <section className="relationship-reading"><p className="eyebrow">YOUR RELATIONSHIP</p><h2>What makes this pairing yours</h2><p>{summary}</p><div className="category-bars">{categoryScores.slice(0, 4).map(({ category, score: categoryScore }) => <div key={category}><span>{category}</span><i><b style={{ width: `${categoryScore}%` }} /></i><strong>{categoryScore}%</strong></div>)}</div><p className="category-note">You were closest in <b>{categoryScores[0].category}</b>. Your answers in <b>{categoryScores.at(-1)?.category}</b> could lead to the most interesting conversation.</p></section>
        <div className="detail-grid"><section className="detail"><h3>Where you matched</h3><ul>{same.map((question) => { const index = englishQuestions.indexOf(question); return <li key={question.id}><b>{question.question}</b><br />You both chose “{optionLabel(question, saved.answers[index])}”</li>; })}</ul></section><section className="detail"><h3>Meaningful differences</h3><ul>{different.map((question) => { const index = englishQuestions.indexOf(question); return <li key={question.id}>{saved.creator}: “{optionLabel(question, saved.answers[index])}”<br />{saved.partner}: “{optionLabel(question, partnerAnswers[index])}”</li>; })}</ul></section><section className="detail"><h3>Questions to keep talking</h3><ul><li>If you could design your ideal free day, what would it look like?</li><li>When do you feel most cared for?</li><li>What is one new thing you would like to try together?</li></ul></section><section className="detail"><h3>Remember</h3><p>A lower match is not a worse result. It simply shows where asking “why?” may teach you something new.</p></section></div>
        <section className="premium-lock"><span className="lock-mark">＋</span><p className="eyebrow">FULL REPORT</p><h2>Go one step deeper.</h2><p>The $4.99 full report will include all 24 answer comparisons, your relationship playbook, eight-category analysis, and a seven-day action plan.</p><div className="premium-features"><span>Relationship playbook</span><span>8-category analysis</span><span>All 24 answers</span><span>7-day action plan</span></div><div className="price"><strong>$4.99 USD</strong><small>One-time purchase · No subscription</small></div><button className="button premium-button" disabled>Managed Payments checkout coming soon</button></section>
        <Link className="button secondary" href="/en">Back to FutariShiru</Link>
        <p className="notice">This result is for entertainment and conversation. It is not a psychological or medical diagnosis, and it does not judge the quality of your relationship.</p>
      </div>
    </EnglishShell>
  );
}

function EnglishShell({ children }: { children: React.ReactNode }) {
  return <main className="app-shell" lang="en"><nav className="app-nav"><Link className="brand" href="/en"><i>ふ</i> FutariShiru</Link><span className="question-meta">No sign-up · About 5 minutes</span></nav>{children}</main>;
}
