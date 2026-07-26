import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
const schema = z.object({ token: z.string().min(20).max(128) });
export async function POST(req: Request) {
  try {
    const { token } = schema.parse(await req.json());
    if (
      process.env.NEXT_PUBLIC_ENABLE_MOCK_PAYMENT === "true" ||
      !process.env.STRIPE_SECRET_KEY
    )
      return NextResponse.json({ mock: true, url: `/result/${token}?paid=1` });
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "jpy",
            unit_amount: 480,
            product_data: { name: "価値観マッチ 詳細レポート" },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/result/${token}?checkout=success`,
      cancel_url: `${origin}/result/${token}`,
      metadata: { publicToken: token },
    });
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json(
      { error: "決済を開始できませんでした" },
      { status: 400 },
    );
  }
}
