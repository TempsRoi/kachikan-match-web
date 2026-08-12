import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://www.kachikanmatch.jp";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "フタリシル｜ふたりで遊ぶ価値観マッチ・相互理解ゲーム",
    template: "%s｜フタリシル",
  },
  description:
    "友達・恋人・夫婦・家族と24問に答え、相手の回答を予想。ふたりの価値観の共通点・違い・理解度を楽しく見つける、登録不要の相互理解ゲームです。",
  applicationName: "フタリシル",
  keywords: [
    "価値観ゲーム",
    "価値観診断",
    "相互理解",
    "友達 質問ゲーム",
    "カップル 質問",
    "夫婦 会話",
  ],
  authors: [{ name: "フタリシル" }],
  creator: "フタリシル",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "フタリシル",
    title: "フタリシル｜あなたは、相手をどれだけ知っていますか？",
    description:
      "答えを比べるだけではなく、相手の答えを予想する。ふたりの価値観と理解度が見える相互理解ゲーム。",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "フタリシル―あなたは、相手をどれだけ知っていますか？",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "フタリシル｜ふたりで遊ぶ価値観マッチ",
    description:
      "相手の答えを予想して、ふたりの価値観と理解度を楽しく見つけよう。",
    images: ["/og.png"],
  },
  category: "entertainment",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
