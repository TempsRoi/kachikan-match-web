import type { Metadata } from "next";
import { LegalNav } from "@/components/LegalNav";
import { SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Cookieポリシー",
  alternates: {
    canonical: "/cookies",
    languages: { ja: "/cookies", en: "/en/cookies" },
  },
};

export default function Page() {
  return (
    <main className="legal">
      <p className="eyebrow">COOKIES</p>
      <h1>Cookie・ローカルストレージポリシー</h1>
      <p className="legal-updated">制定日：2026年9月5日</p>
      <p>
        本サービスは、ゲーム進行、匿名認証、購入済みレポートの復旧および安全な決済のため、Cookie、ブラウザのローカルストレージその他これらに類する技術を使用します。
      </p>

      <h2>1. 必須技術</h2>
      <ul>
        <li>
          ゲームの途中状態と結果を端末上で復元するためのローカルストレージ
        </li>
        <li>Firebaseによる匿名認証状態の維持</li>
        <li>購入済みレポートの復旧状態を保持する署名付きCookie</li>
        <li>
          セキュリティ、負荷分散および不正利用防止に必要なホスティング技術
        </li>
      </ul>

      <h2>2. Stripe・Link</h2>
      <p>
        決済画面へ進むと、StripeおよびLinkが決済、認証、不正利用防止、取引管理に必要なCookie等を使用する場合があります。これらは各社のポリシーに従って取り扱われます。
      </p>

      <h2>3. アナリティクス・広告</h2>
      <p>
        現在、本サービスは行動ターゲティング広告用Cookieまたは任意のアクセス解析Cookieを設置していません。将来導入する場合は、本ポリシーを更新し、必要な地域では事前同意を取得します。
      </p>

      <h2>4. 管理方法</h2>
      <p>
        ブラウザ設定からCookieやサイトデータを削除できます。ただし、削除するとゲームの途中状態や購入済みレポートへの端末上のアクセスが失われる場合があります。PDFと復旧コードは安全な場所に保管してください。
      </p>

      <h2>5. お問い合わせ</h2>
      <p>
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
      <LegalNav locale="ja" />
    </main>
  );
}
