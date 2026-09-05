import type { Metadata } from "next";
import { LegalNav } from "@/components/LegalNav";
import { SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "キャンセル・返金ポリシー",
  alternates: {
    canonical: "/refunds",
    languages: { ja: "/refunds", en: "/en/refunds" },
  },
};

export default function Page() {
  return (
    <main className="legal">
      <p className="eyebrow">REFUNDS</p>
      <h1>キャンセル・返金ポリシー</h1>
      <p className="legal-updated">制定日：2026年9月5日</p>

      <h2>1. デジタルコンテンツの提供</h2>
      <p>
        詳細レポートは、決済完了後に対象の結果ページ上で直ちに提供されるデジタルコンテンツです。英語版には、決済日から12カ月のWeb閲覧とPDFダウンロードが含まれます。
      </p>

      <h2>2. お客様都合のキャンセル</h2>
      <p>
        提供開始後は、デジタルコンテンツの性質上、誤購入、利用しなかったこと、期待した内容と異なること等のお客様都合によるキャンセル・返金には原則として応じません。ただし、適用法令により認められる権利を制限するものではありません。
      </p>

      <h2>3. 対応するケース</h2>
      <p>次の場合は、状況を確認のうえ返金または利用可能化の対応を行います。</p>
      <ul>
        <li>同一内容について重複して決済された場合</li>
        <li>当サービスの不具合により購入したレポートを利用できない場合</li>
        <li>購入内容が説明と重大に異なる場合</li>
        <li>法令上、返金その他の救済が必要な場合</li>
      </ul>

      <h2>4. 申請方法</h2>
      <p>
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        へ、結果URL、決済日時、金額、問題の内容をお知らせください。カード番号、セキュリティコード、パスワードは送らないでください。
      </p>

      <h2>5. Linkによる決済</h2>
      <p>
        英語版のManaged
        Payments取引ではLinkが販売者として表示され、決済・領収書・取引レベルのサポートを提供します。購入者はLinkサポートへ返金を申請することもできます。当サービスへの製品上の問題は、上記窓口でも受け付けます。
      </p>

      <LegalNav locale="ja" />
    </main>
  );
}
