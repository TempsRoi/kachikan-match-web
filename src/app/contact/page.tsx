import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ",
  alternates: { canonical: "/contact" },
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
        href="mailto:onseisakusei@gmail.com?subject=フタリシルへのお問い合わせ"
      >
        onseisakusei@gmail.com
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
      <nav className="legal-nav">
        <Link href="/commerce">特定商取引法に基づく表記</Link>
        <Link href="/privacy">プライバシーポリシー</Link>
        <Link href="/">トップへ戻る</Link>
      </nav>
    </main>
  );
}
