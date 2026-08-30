import type { Metadata } from "next";
import { EnglishStartGame } from "@/components/EnglishGame";

export const metadata: Metadata = {
  title: "Start a game",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <EnglishStartGame />;
}
