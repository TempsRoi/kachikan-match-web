import type { Metadata } from "next";
import { MarketingHome } from "@/components/MarketingHome";
import { absoluteSiteUrl, SITE_ORIGIN } from "@/lib/site";

const englishHomeUrl = absoluteSiteUrl("/en");

export const metadata: Metadata = {
  title: "FutariShiru | How well do you really know each other?",
  description:
    "Answer 24 questions, predict each other’s choices, and discover the similarities, differences, and surprises worth talking about.",
  applicationName: "FutariShiru",
  keywords: [
    "couples quiz",
    "how well do you know your partner",
    "relationship questions",
    "values game",
    "best friend quiz",
  ],
  alternates: {
    canonical: englishHomeUrl,
    languages: {
      ja: SITE_ORIGIN,
      en: englishHomeUrl,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: englishHomeUrl,
    siteName: "FutariShiru",
    title: "FutariShiru | How well do you really know each other?",
    description:
      "Guess each other’s answers and discover what you share, where you differ, and what surprises you.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "FutariShiru two-person connection game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FutariShiru | A two-person connection game",
    description:
      "Guess each other’s answers and discover how well you really know each other.",
    images: ["/og.png"],
  },
};

export default function EnglishHome() {
  return <MarketingHome locale="en" />;
}
