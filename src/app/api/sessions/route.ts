import { randomBytes } from "crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, authenticatedUid } from "@/lib/firebase-admin";
import {
  contentVersionFor,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from "@/lib/locales";
import { SCORING_VERSION } from "@/lib/questions";

const schema = z.object({
  creatorName: z.string().trim().min(1).max(20),
  partnerName: z.string().trim().min(1).max(20),
  locale: z.enum(SUPPORTED_LOCALES).default(DEFAULT_LOCALE),
});

export async function POST(request: Request) {
  const uid = await authenticatedUid(request);
  const db = adminDb();
  if (!uid)
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  if (!db)
    return NextResponse.json(
      { error: "Firebase Adminが未設定です" },
      { status: 503 },
    );
  try {
    const input = schema.parse(await request.json());
    const contentVersion = contentVersionFor(input.locale);
    const sessionRef = db.collection("sessions").doc();
    const publicToken = randomBytes(24).toString("base64url");
    const now = FieldValue.serverTimestamp();
    const batch = db.batch();
    batch.create(sessionRef, {
      publicToken,
      creatorName: input.creatorName,
      partnerName: input.partnerName,
      creatorUserId: uid,
      partnerUserId: null,
      status: "creator_answering",
      scoringVersion: SCORING_VERSION,
      locale: input.locale,
      contentVersion,
      paid: false,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      expiresAt: Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    batch.create(sessionRef.collection("participants").doc("creator"), {
      role: "creator",
      userId: uid,
      displayName: input.creatorName,
      worldKey: null,
      styleKey: null,
      axisScores: null,
      scoringVersion: SCORING_VERSION,
      locale: input.locale,
      contentVersion,
      createdAt: now,
      completedAt: null,
    });
    batch.create(db.collection("publicTokens").doc(publicToken), {
      sessionId: sessionRef.id,
      createdAt: now,
      expiresAt: Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await batch.commit();
    return NextResponse.json({ token: publicToken });
  } catch {
    return NextResponse.json(
      { error: "セッションを作成できませんでした" },
      { status: 400 },
    );
  }
}
