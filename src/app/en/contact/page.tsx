import type { Metadata } from "next";
import { LegalNav } from "@/components/LegalNav";
import { disclosureMailtoEn, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact FutariShiru about reports, privacy, payments, refunds, or seller disclosure.",
  alternates: {
    canonical: "/en/contact",
    languages: { ja: "/contact", en: "/en/contact" },
  },
};

export default function Page() {
  return (
    <main className="legal contact-page" lang="en">
      <p className="eyebrow">CONTACT</p>
      <h1>Contact FutariShiru</h1>
      <p>
        Contact us about the game, a purchased report, privacy, refunds, or
        seller information.
      </p>
      <a className="contact-mail" href={`mailto:${SUPPORT_EMAIL}`}>
        {SUPPORT_EMAIL}
      </a>

      <h2>Include when relevant</h2>
      <ul>
        <li>A description of your question or issue</li>
        <li>The result URL for a report-related issue</li>
        <li>The payment date and amount, if known</li>
      </ul>
      <p className="legal-caution">
        Never email a full card number, security code, password, or secret
        recovery code.
      </p>

      <h2>Request seller information before purchase</h2>
      <p>
        You may request the seller’s legal name, active business address, and
        reachable telephone number before purchasing. You do not need to have
        purchased anything or provide a reason.
      </p>
      <a className="contact-mail" href={disclosureMailtoEn}>
        Request seller information
      </a>
      <p className="legal-caution">
        We will respond by email without delay and in time for you to review the
        information before deciding whether to purchase.
      </p>
      <LegalNav locale="en" />
    </main>
  );
}
