import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb, authenticatedUid } from "@/lib/firebase-admin";

const ACCESS_MONTHS = 12;

function accessSecret() {
  return process.env.REPORT_ACCESS_SECRET?.trim() || null;
}

function asDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function addAccessPeriod(from: Date) {
  const expiresAt = new Date(from);
  expiresAt.setUTCMonth(expiresAt.getUTCMonth() + ACCESS_MONTHS);
  return expiresAt;
}

function digest(value: string) {
  const secret = accessSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(value).digest();
}

export function recoveryCodeFor(sessionId: string) {
  const value = digest(`recovery:${sessionId}`);
  if (!value) return null;
  const code = value.toString("hex").slice(0, 16).toUpperCase();
  return `FS-${code.match(/.{1,4}/g)?.join("-")}`;
}

export function isRecoveryCodeValid(sessionId: string, candidate: string) {
  const expected = recoveryCodeFor(sessionId);
  if (!expected) return false;
  const normalized = candidate.trim().toUpperCase();
  const left = Buffer.from(expected);
  const right = Buffer.from(normalized);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function reportCookieName(publicToken: string) {
  const suffix = createHmac("sha256", "futarishiru-report-cookie")
    .update(publicToken)
    .digest("hex")
    .slice(0, 16);
  return `fs_report_${suffix}`;
}

export function createReportCookieValue(sessionId: string, expiresAt: Date) {
  const payload = Buffer.from(
    JSON.stringify({ sessionId, expiresAt: expiresAt.toISOString() }),
  ).toString("base64url");
  const signature = digest(`cookie:${payload}`)?.toString("base64url");
  return signature ? `${payload}.${signature}` : null;
}

function verifyReportCookie(value: string | undefined, sessionId: string) {
  if (!value) return false;
  const [payload, signature] = value.split(".");
  const expected = digest(`cookie:${payload}`)?.toString("base64url");
  if (!payload || !signature || !expected) return false;
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right))
    return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    return (
      decoded.sessionId === sessionId &&
      new Date(decoded.expiresAt).getTime() > Date.now()
    );
  } catch {
    return false;
  }
}

function cookieValue(request: Request, name: string) {
  const header = request.headers.get("cookie") || "";
  return header
    .split(";")
    .map((part) => part.trim().split("="))
    .find(([key]) => key === name)?.[1];
}

export function activeAccessExpiry(session: Record<string, unknown>) {
  if (session.paid !== true) return null;
  const explicit = asDate(session.accessExpiresAt);
  const paidAt = asDate(session.paidAt) ?? asDate(session.updatedAt);
  const expiresAt = explicit ?? (paidAt ? addAccessPeriod(paidAt) : null);
  return expiresAt && expiresAt.getTime() > Date.now() ? expiresAt : null;
}

export async function grantReportAccess(db: Firestore, sessionId: string) {
  const ref = db.collection("sessions").doc(sessionId);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new Error("session-not-found");
    const data = snapshot.data() || {};
    const existingPaidAt = asDate(data.paidAt);
    const paidAt = existingPaidAt ?? new Date();
    const existingExpiry = asDate(data.accessExpiresAt);
    const accessExpiresAt = existingExpiry ?? addAccessPeriod(paidAt);
    transaction.update(ref, {
      paid: true,
      paidAt: existingPaidAt ? data.paidAt : Timestamp.fromDate(paidAt),
      accessExpiresAt: existingExpiry
        ? data.accessExpiresAt
        : Timestamp.fromDate(accessExpiresAt),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { paidAt, accessExpiresAt };
  });
}

export async function authorizedReportSession(
  request: Request,
  publicToken: string,
) {
  const db = adminDb();
  if (!db) return { error: "database-unavailable" as const };
  const tokenSnapshot = await db
    .collection("publicTokens")
    .doc(publicToken)
    .get();
  const sessionId = tokenSnapshot.data()?.sessionId as string | undefined;
  if (!sessionId) return { error: "not-found" as const };
  const sessionSnapshot = await db.collection("sessions").doc(sessionId).get();
  const session = sessionSnapshot.data();
  if (!session) return { error: "not-found" as const };

  const uid = await authenticatedUid(request);
  const isParticipant =
    Boolean(uid) &&
    (session.creatorUserId === uid || session.partnerUserId === uid);
  const hasRecoveryCookie = verifyReportCookie(
    cookieValue(request, reportCookieName(publicToken)),
    sessionId,
  );
  if (!isParticipant && !hasRecoveryCookie)
    return { error: "unauthorized" as const };

  return {
    db,
    sessionId,
    session,
    isParticipant,
    accessExpiresAt: activeAccessExpiry(session),
  };
}
