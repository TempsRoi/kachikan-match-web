import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { adminDb, authenticatedUid } from "@/lib/firebase-admin";
import { grantReportAccess } from "@/lib/report-access";

const schema = z.object({ sessionId: z.string().startsWith("cs_") });

export async function POST(request: Request) {
  const uid = await authenticatedUid(request);
  const db = adminDb();
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!uid)
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  if (!db || !secretKey)
    return NextResponse.json(
      { error: "決済を確認できません" },
      { status: 503 },
    );
  try {
    const { sessionId: checkoutId } = schema.parse(await request.json());
    const stripe = new Stripe(secretKey);
    const checkout = await stripe.checkout.sessions.retrieve(checkoutId);
    const sessionId = checkout.metadata?.sessionId;
    const purchaserUserId = checkout.metadata?.purchaserUserId;
    if (
      checkout.payment_status !== "paid" ||
      !sessionId ||
      purchaserUserId !== uid
    )
      return NextResponse.json(
        { error: "支払いを確認できませんでした" },
        { status: 409 },
      );
    const paymentSnap = await db.collection("payments").doc(checkout.id).get();
    if (paymentSnap.data()?.sessionId !== sessionId)
      return NextResponse.json(
        { error: "決済情報が一致しません" },
        { status: 403 },
      );

    await grantReportAccess(db, sessionId);
    await db
      .collection("payments")
      .doc(checkout.id)
      .set(
        {
          status: "paid",
          stripePaymentIntentId:
            typeof checkout.payment_intent === "string"
              ? checkout.payment_intent
              : checkout.payment_intent?.id || null,
          updatedAt: FieldValue.serverTimestamp(),
          paidAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    return NextResponse.json({ paid: true });
  } catch (error) {
    console.error("Checkout confirmation failed", error);
    return NextResponse.json(
      { error: "支払いを確認できませんでした" },
      { status: 400 },
    );
  }
}
