import type { Metadata } from "next";
import { EnglishInvite } from "@/components/EnglishGame";

export const metadata: Metadata = {
  title: "Share your invitation",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  return <EnglishInvite token={(await params).token} />;
}
