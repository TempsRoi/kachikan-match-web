import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { adminDb, authenticatedUid } from "@/lib/firebase-admin";
import { grantReportAccess } from "@/lib/report-access";
import { SITE_ORIGIN } from "@/lib/site";

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

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey)
      return NextResponse.json(
        { error: "Stripeが設定されていません" },
        { status: 503 },
      );

    const stripe = new Stripe(secretKey);
    const origin =
      process.env.NODE_ENV === "production"
        ? SITE_ORIGIN
        : new URL(request.url).origin;
    const isEnglish = sessionData.locale === "en";
    const metadata = { publicToken: token, sessionId, purchaserUserId: uid };
    const englishCheckoutEnabled =
      process.env.NEXT_PUBLIC_ENGLISH_CHECKOUT_ENABLED === "true";
    if (isEnglish && !englishCheckoutEnabled)
      return NextResponse.json(
        { error: "Managed Payments checkout is disabled." },
        { status: 503 },
      );
    const managedPriceId = process.env.STRIPE_MANAGED_PRICE_ID_USD?.trim();
    if (isEnglish && !managedPriceId)
      return NextResponse.json(
        { error: "Managed Payments price is not configured." },
        { status: 503 },
      );

    const standardPriceId = process.env.STRIPE_PRICE_ID?.trim();
    const checkout = isEnglish
      ? await stripe.checkout.sessions.create({
          mode: "payment",
          client_reference_id: sessionId,
          managed_payments: { enabled: true },
          line_items: [{ price: managedPriceId!, quantity: 1 }],
          success_url: `${origin}${resultPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}${resultPath}?checkout=cancelled`,
          locale: "en",
          metadata,
          payment_intent_data: { metadata },
        })
      : await stripe.checkout.sessions.create({
          mode: "payment",
          client_reference_id: sessionId,
          payment_method_types: ["card"],
          line_items: [
            standardPriceId
              ? { price: standardPriceId, quantity: 1 }
              : {
                  price_data: {
                    currency: "jpy",
                    unit_amount: 480,
                    product_data: { name: "フタリシル 詳細レポート" },
                  },
                  quantity: 1,
                },
          ],
          success_url: `${origin}${resultPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}${resultPath}?checkout=cancelled`,
          locale: "ja",
          metadata,
          payment_intent_data: { metadata },
        });

    await db.collection("payments").doc(checkout.id).set({
      sessionId,
      publicToken: token,
      purchaserUserId: uid,
      stripeCheckoutSessionId: checkout.id,
      stripePaymentIntentId: null,
      amount: checkout.amount_total ?? (isEnglish ? 499 : 480),
      currency: checkout.currency ?? (isEnglish ? "usd" : "jpy"),
      locale: isEnglish ? "en" : "ja",
      managedPayments: isEnglish,
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
