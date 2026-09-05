import type { Metadata } from "next";
import { LegalNav } from "@/components/LegalNav";
import { disclosureMailtoJa, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  alternates: {
    canonical: "/commerce",
    languages: { ja: "/commerce", en: "/en/commerce" },
  },
};

const rows = [
  ["サービス名", "フタリシル（ふたりで遊ぶ価値観マッチ）"],
  ["運営形態", "日本に所在する個人運営"],
  [
    "販売事業者の法定氏名",
    "特定商取引法第11条ただし書に基づき、請求があった場合、購入の意思決定に先立って遅滞なく電子メールで開示します。",
  ],
  [
    "所在地・電話番号",
    "特定商取引法第11条ただし書に基づき、請求があった場合、購入の意思決定に先立って遅滞なく電子メールで開示します。",
  ],
  ["開示請求・お問い合わせ", SUPPORT_EMAIL],
  [
    "販売価格",
    "日本語版：詳細レポート1件480円（税込）。英語版：詳細レポート1件4.99米ドル。英語版に適用される税金は決済画面に表示されます。",
  ],
  [
    "商品代金以外の費用",
    "インターネット接続料金、通信料金等は利用者の負担となります。",
  ],
  [
    "支払方法",
    "日本語版はStripeによるクレジットカード決済。英語版はLinkが販売者（Merchant of Record）として提供する決済画面に表示される方法。",
  ],
  ["支払時期", "購入手続き完了時に決済されます。"],
  [
    "提供時期・期間",
    "決済完了後、対象の結果ページ上で直ちに提供します。英語版のWeb閲覧期間は決済日から12カ月で、購入期間中にPDFをダウンロードできます。",
  ],
  [
    "キャンセル・返金",
    "デジタルコンテンツの性質上、提供開始後のお客様都合によるキャンセル・返金には原則として応じません。重複決済、当サービスの不具合により購入内容を利用できない場合、法令上返金が必要な場合は、返金または利用可能化の対応を行います。詳細はキャンセル・返金ポリシーをご確認ください。",
  ],
  ["定期課金", "ありません。1回限りの買い切りです。"],
  [
    "利用環境",
    "インターネットに接続された、最新版の一般的なスマートフォンまたはPCブラウザが必要です。",
  ],
  [
    "決済上の販売者",
    "英語版のManaged Payments取引では、Linkが販売者として決済画面・領収書等に表示されます。",
  ],
];

export default function Page() {
  return (
    <main className="legal">
      <p className="eyebrow">COMMERCE</p>
      <h1>特定商取引法に基づく表記</h1>
      <p className="legal-updated">最終改定日：2026年9月5日</p>
      <dl className="commerce-list">
        {rows.map(([term, description]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>
              {term === "開示請求・お問い合わせ" ? (
                <a href={disclosureMailtoJa}>{description}</a>
              ) : (
                description
              )}
            </dd>
          </div>
        ))}
      </dl>
      <p className="legal-caution">
        法定氏名、活動住所および確実に連絡可能な電話番号の開示を希望する方は、購入前に上記メールアドレスへご請求ください。購入の意思決定に先立って確認できるよう、遅滞なく電子メールで回答します。開示請求に購入実績は必要ありません。
      </p>
      <LegalNav locale="ja" />
    </main>
  );
}
