import type { Metadata } from "next";
import { EnglishResult } from "@/components/EnglishGame";

export const metadata: Metadata = {
  title: "Your connection result",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  return <EnglishResult token={(await params).token} />;
}
