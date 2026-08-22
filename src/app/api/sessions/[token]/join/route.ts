import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb, authenticatedUid } from "@/lib/firebase-admin";

export async function POST(
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
  try {
    const result = await db.runTransaction(async (tx) => {
      const tokenSnap = await tx.get(db.collection("publicTokens").doc(token));
      const sessionId = tokenSnap.data()?.sessionId as string | undefined;
      if (!sessionId) throw new Error("not-found");
      const ref = db.collection("sessions").doc(sessionId);
      const snap = await tx.get(ref);
      const data = snap.data();
      if (!data) throw new Error("not-found");
      if (data.expiresAt?.toMillis() < Date.now()) throw new Error("expired");
      if (data.creatorUserId === uid)
        return { sessionId, role: "creator", data };
      if (data.partnerUserId && data.partnerUserId !== uid)
        throw new Error("occupied");
      if (!data.partnerUserId) {
        tx.update(ref, {
          partnerUserId: uid,
          status: "partner_answering",
          updatedAt: FieldValue.serverTimestamp(),
        });
        tx.set(ref.collection("participants").doc("partner"), {
          role: "partner",
          userId: uid,
          displayName: data.partnerName,
          worldKey: null,
          styleKey: null,
          axisScores: null,
          scoringVersion: data.scoringVersion ?? "v1",
          createdAt: FieldValue.serverTimestamp(),
          completedAt: null,
        });
      }
      return { sessionId, role: "partner", data };
    });
    return NextResponse.json({
      role: result.role,
      creator: result.data.creatorName,
      partner: result.data.partnerName,
      status: result.data.status,
      scoringVersion: result.data.scoringVersion ?? "v1",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status =
      message === "occupied" ? 409 : message === "expired" ? 410 : 404;
    return NextResponse.json(
      {
        error:
          status === 409
            ? "この招待にはすでに参加者がいます"
            : "招待が見つかりません",
      },
      { status },
    );
  }
}
