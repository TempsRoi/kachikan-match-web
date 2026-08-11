import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!webhookSecret || !secretKey)
    return NextResponse.json({ error: "Not configured" }, { status: 503 });

  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature)
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    const stripe = new Stripe(secretKey);
    const event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret,
    );
    const db = adminDb();
    if (!db)
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    if (event.type === "checkout.session.completed") {
      const checkout = event.data.object;
      if (checkout.payment_status !== "paid")
        return NextResponse.json({ received: true });
      const sessionId = checkout.metadata?.sessionId;
      const publicToken = checkout.metadata?.publicToken;
      if (!sessionId || !publicToken)
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      const tokenSnap = await db.collection("publicTokens").doc(publicToken).get();
      if (tokenSnap.data()?.sessionId !== sessionId)
        return NextResponse.json({ error: "Invalid session" }, { status: 400 });

      const batch = db.batch();
      batch.update(db.collection("sessions").doc(sessionId), {
        paid: true,
        updatedAt: FieldValue.serverTimestamp(),
      });
      batch.set(
        db.collection("payments").doc(checkout.id),
        {
          sessionId,
          publicToken,
          purchaserUserId: checkout.metadata?.purchaserUserId || null,
          stripeCheckoutSessionId: checkout.id,
          stripePaymentIntentId:
            typeof checkout.payment_intent === "string"
              ? checkout.payment_intent
              : checkout.payment_intent?.id || null,
          amount: checkout.amount_total,
          currency: checkout.currency,
          status: "paid",
          updatedAt: FieldValue.serverTimestamp(),
          paidAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      await batch.commit();
    }

    if (event.type === "checkout.session.expired") {
      await db.collection("payments").doc(event.data.object.id).set(
        { status: "failed", updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      );
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook failed", error);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
