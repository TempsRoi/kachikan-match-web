import type { Metadata } from "next";
import { LegalNav } from "@/components/LegalNav";
import { disclosureMailtoJa, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "お問い合わせ",
  alternates: {
    canonical: "/contact",
    languages: { ja: "/contact", en: "/en/contact" },
  },
};

export default function Page() {
  return (
    <main className="legal contact-page">
      <p className="eyebrow">CONTACT</p>
      <h1>お問い合わせ</h1>
      <p>
        決済、詳細レポート、個人情報の取扱い、特定商取引法に基づく事業者情報の開示請求は、以下のメールアドレスへご連絡ください。
      </p>
      <a
        className="contact-mail"
        href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("フタリシルへのお問い合わせ")}`}
      >
        {SUPPORT_EMAIL}
      </a>
      <h2>ご記載いただきたい内容</h2>
      <ul>
        <li>お問い合わせ内容</li>
        <li>対象の結果URL（決済に関する場合）</li>
        <li>決済日時と金額（分かる範囲）</li>
      </ul>
      <p className="legal-caution">
        クレジットカード番号、セキュリティコード、パスワードは記載しないでください。
      </p>
      <h2>販売事業者情報の開示請求</h2>
      <p>
        購入前に、販売事業者の法定氏名、活動住所および確実に連絡可能な電話番号の開示を請求できます。購入実績や請求理由は必要ありません。
      </p>
      <a className="contact-mail" href={disclosureMailtoJa}>
        事業者情報の開示を請求する
      </a>
      <p className="legal-caution">
        購入の意思決定に先立って確認できるよう、遅滞なく電子メールで回答します。
      </p>
      <LegalNav locale="ja" />
    </main>
  );
}
