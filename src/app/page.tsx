import type { Metadata } from "next";
import { MarketingHome } from "@/components/MarketingHome";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: { ja: "/", en: "/en" },
  },
};

export default function Home() {
  return <MarketingHome locale="ja" />;
}
