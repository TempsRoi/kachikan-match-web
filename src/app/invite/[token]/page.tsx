import type { Metadata } from "next";
import { Invite } from "@/components/Game";

export const metadata: Metadata = {
  title: "招待を共有",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return <Invite token={(await params).token} />;
}
