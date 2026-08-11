import type { Metadata } from "next";
import { StartGame } from "@/components/Game";

export const metadata: Metadata = {
  title: "ゲームをはじめる",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <StartGame />;
}
