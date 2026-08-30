import { NextResponse } from "next/server";
import { adminDb, authenticatedUid } from "@/lib/firebase-admin";
import { contentVersionFor, normalizeLocale } from "@/lib/locales";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const uid = await authenticatedUid(request);
  const db = adminDb();
  if (!uid)
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  if (!db)
    return NextResponse.json(
      { error: "Firebase Adminが未設定です" },
      { status: 503 },
    );
  const { token } = await params;
  const tokenSnap = await db.collection("publicTokens").doc(token).get();
  const sessionId = tokenSnap.data()?.sessionId as string | undefined;
  if (!sessionId)
    return NextResponse.json(
      { error: "招待が見つかりません" },
      { status: 404 },
    );
  const ref = db.collection("sessions").doc(sessionId);
  const snap = await ref.get();
  const data = snap.data();
  if (!data || (data.creatorUserId !== uid && data.partnerUserId !== uid))
    return NextResponse.json({ error: "閲覧できません" }, { status: 403 });
  const locale = normalizeLocale(data.locale);
  return NextResponse.json({
    creator: data.creatorName,
    partner: data.partnerName,
    status: data.status,
    locale,
    contentVersion: data.contentVersion ?? contentVersionFor(locale),
  });
}
