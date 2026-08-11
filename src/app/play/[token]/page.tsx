import type { Metadata } from "next";
import { PlayGame } from "@/components/Game";

export const metadata: Metadata = {
  title: "招待されたゲームに回答",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return <PlayGame token={(await params).token} />;
}
