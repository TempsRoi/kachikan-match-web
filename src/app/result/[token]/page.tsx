import type { Metadata } from "next";
import { Result } from "@/components/Game";

export const metadata: Metadata = {
  title: "ふたりの結果",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return <Result token={(await params).token} />;
}
