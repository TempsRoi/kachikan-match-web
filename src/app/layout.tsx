import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "価値観マッチ｜ふたりで遊ぶ相互理解ゲーム",
  description: "相手の答えを予想して、ふたりの価値観と理解度を見つける相互理解ゲーム。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
