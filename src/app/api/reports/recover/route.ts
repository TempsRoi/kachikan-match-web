import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import {
  activeAccessExpiry,
  createReportCookieValue,
  isRecoveryCodeValid,
  reportCookieName,
} from "@/lib/report-access";

const schema = z.object({
  token: z.string().min(20).max(128),
  recoveryCode: z.string().min(10).max(64),
});

export async function POST(request: Request) {
  const db = adminDb();
  if (!db)
    return NextResponse.json(
      { error: "Report recovery is temporarily unavailable." },
      { status: 503 },
    );
  try {
    const { token, recoveryCode } = schema.parse(await request.json());
    const tokenSnapshot = await db.collection("publicTokens").doc(token).get();
    const sessionId = tokenSnapshot.data()?.sessionId as string | undefined;
    if (!sessionId || !isRecoveryCodeValid(sessionId, recoveryCode))
      return NextResponse.json(
        { error: "The recovery code is not valid." },
        { status: 403 },
      );
    const sessionSnapshot = await db
      .collection("sessions")
      .doc(sessionId)
      .get();
    const session = sessionSnapshot.data();
    const accessExpiresAt = session ? activeAccessExpiry(session) : null;
    if (!session || !accessExpiresAt)
      return NextResponse.json(
        { error: "This report is unavailable or has expired." },
        { status: 410 },
      );
    const cookie = createReportCookieValue(sessionId, accessExpiresAt);
    if (!cookie)
      return NextResponse.json(
        { error: "Report recovery has not been configured." },
        { status: 503 },
      );
    const response = NextResponse.json({ ok: true });
    response.cookies.set(reportCookieName(token), cookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: accessExpiresAt,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "The recovery code could not be verified." },
      { status: 400 },
    );
  }
}
