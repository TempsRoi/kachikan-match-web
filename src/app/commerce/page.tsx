import Link from "next/link";

const rows = [
  ["サービス名", "KACHIKAN MATCH（価値観マッチ）"],
  [
    "販売事業者",
    "請求があった場合、遅滞なく開示します。開示を希望される方は、下記お問い合わせ先へご連絡ください。",
  ],
  [
    "所在地・電話番号",
    "請求があった場合、遅滞なく開示します。開示を希望される方は、下記お問い合わせ先へご連絡ください。",
  ],
  ["お問い合わせ", "onseisakusei@gmail.com"],
  ["販売価格", "詳細レポート1件 480円（税込）"],
  [
    "商品代金以外の費用",
    "インターネット接続料金、通信料金等は利用者の負担となります。",
  ],
  ["支払方法", "クレジットカード決済（Stripe）"],
  ["支払時期", "購入手続き完了時に決済されます。"],
  ["提供時期", "決済完了後、対象の結果ページ上で直ちに提供します。"],
  [
    "キャンセル・返金",
    "デジタルコンテンツの性質上、提供開始後のお客様都合によるキャンセル・返金には応じません。ただし、重複決済、当サービスの不具合により購入した詳細レポートを閲覧できない場合、その他提供内容に不備がある場合は、確認のうえ返金または閲覧可能化の対応を行います。",
  ],
  ["定期課金", "ありません。1回限りの買い切りです。"],
  [
    "利用環境",
    "インターネットに接続された、最新版の一般的なスマートフォンまたはPCブラウザが必要です。",
  ],
  [
    "カード明細表記",
    "KACHIKAN MATCH（実際の表記はカード会社により異なる場合があります）",
  ],
];

export default function Page() {
  return (
    <main className="legal">
      <p className="eyebrow">COMMERCE</p>
      <h1>特定商取引法に基づく表記</h1>
      <p className="legal-updated">制定日：2026年8月12日</p>
      <dl className="commerce-list">
        {rows.map(([term, description]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>
              {term === "お問い合わせ" ? (
                <a href="mailto:onseisakusei@gmail.com">{description}</a>
              ) : (
                description
              )}
            </dd>
          </div>
        ))}
      </dl>
      <p className="legal-caution">
        販売事業者情報の開示請求には、購入の申込み前に確認できるよう遅滞なく回答します。
      </p>
      <nav className="legal-nav">
        <Link href="/terms">利用規約</Link>
        <Link href="/privacy">プライバシーポリシー</Link>
        <Link href="/">トップへ戻る</Link>
      </nav>
    </main>
  );
}
