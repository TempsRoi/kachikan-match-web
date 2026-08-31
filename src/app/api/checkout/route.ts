import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { adminDb, authenticatedUid } from "@/lib/firebase-admin";
import { grantReportAccess } from "@/lib/report-access";

const schema = z.object({ token: z.string().min(20).max(128) });

export async function POST(request: Request) {
  const uid = await authenticatedUid(request);
  const db = adminDb();
  if (!uid)
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  if (!db)
    return NextResponse.json(
      { error: "決済サーバーを利用できません" },
      { status: 503 },
    );

  try {
    const { token } = schema.parse(await request.json());
    const tokenSnap = await db.collection("publicTokens").doc(token).get();
    const sessionId = tokenSnap.data()?.sessionId as string | undefined;
    if (!sessionId)
      return NextResponse.json(
        { error: "対象の結果が見つかりません" },
        { status: 404 },
      );

    const sessionRef = db.collection("sessions").doc(sessionId);
    const sessionSnap = await sessionRef.get();
    const sessionData = sessionSnap.data();
    if (
      !sessionData ||
      (sessionData.creatorUserId !== uid && sessionData.partnerUserId !== uid)
    )
      return NextResponse.json({ error: "購入できません" }, { status: 403 });
    if (sessionData.status !== "completed")
      return NextResponse.json(
        { error: "ふたりの回答完了後に購入できます" },
        { status: 409 },
      );
    const resultPath =
      sessionData.locale === "en" ? `/en/result/${token}` : `/result/${token}`;
    if (sessionData.paid === true)
      return NextResponse.json({ alreadyPaid: true, url: resultPath });

    const allowMock =
      process.env.ENABLE_MOCK_PAYMENT === "true" &&
      process.env.VERCEL_ENV !== "production";
    if (allowMock) {
      await grantReportAccess(db, sessionId);
      return NextResponse.json({
        mock: true,
        url: `${resultPath}?checkout=mock`,
      });
    }

    if (sessionData.locale === "en")
      return NextResponse.json(
        { error: "Managed Payments checkout is not configured yet." },
        { status: 503 },
      );

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey)
      return NextResponse.json(
        { error: "Stripeが設定されていません" },
        { status: 503 },
      );

    const stripe = new Stripe(secretKey);
    const origin = new URL(request.url).origin;
    const priceId = process.env.STRIPE_PRICE_ID;
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: sessionId,
      payment_method_types: ["card"],
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              price_data: {
                currency: "jpy",
                unit_amount: 480,
                product_data: { name: "フタリシル 詳細レポート" },
              },
              quantity: 1,
            },
      ],
      success_url: `${origin}/result/${token}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/result/${token}?checkout=cancelled`,
      locale: "ja",
      metadata: { publicToken: token, sessionId, purchaserUserId: uid },
      payment_intent_data: {
        metadata: { publicToken: token, sessionId, purchaserUserId: uid },
      },
    });

    await db.collection("payments").doc(checkout.id).set({
      sessionId,
      publicToken: token,
      purchaserUserId: uid,
      stripeCheckoutSessionId: checkout.id,
      stripePaymentIntentId: null,
      amount: 480,
      currency: "jpy",
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("Checkout creation failed", error);
    return NextResponse.json(
      { error: "決済を開始できませんでした" },
      { status: 400 },
    );
  }
}
