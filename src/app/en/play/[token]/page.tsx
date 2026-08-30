import type { Metadata } from "next";
import { EnglishPlayGame } from "@/components/EnglishGame";

export const metadata: Metadata = {
  title: "Answer your invitation",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  return <EnglishPlayGame token={(await params).token} />;
}
