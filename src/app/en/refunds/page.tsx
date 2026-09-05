import type { Metadata } from "next";
import { LegalNav } from "@/components/LegalNav";
import { SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Cancellation and refund terms for the FutariShiru Full Report.",
  alternates: {
    canonical: "/en/refunds",
    languages: { ja: "/refunds", en: "/en/refunds" },
  },
};

export default function Page() {
  return (
    <main className="legal" lang="en">
      <p className="eyebrow">REFUNDS</p>
      <h1>Refund Policy</h1>
      <p className="legal-updated">Effective: September 5, 2026</p>

      <h2>1. Immediate digital delivery</h2>
      <p>
        The Full Report is digital content made available after payment
        confirmation. It includes 12 months of web access from payment and a
        downloadable PDF.
      </p>

      <h2>2. Change-of-mind cancellations</h2>
      <p>
        Because delivery begins immediately, change-of-mind refunds are
        generally unavailable after access is provided, to the extent permitted
        by applicable law. This does not limit cancellation, refund, or other
        consumer rights that cannot legally be waived.
      </p>

      <h2>3. When we provide assistance or a refund</h2>
      <p>Contact us if:</p>
      <ul>
        <li>you were charged more than once for the same report;</li>
        <li>
          a technical problem prevents access to the purchased report or PDF;
        </li>
        <li>
          the purchased content materially differs from its description; or
        </li>
        <li>applicable law requires a refund or another remedy.</li>
      </ul>
      <p>
        Depending on the issue, we may restore access, correct the problem, or
        arrange a refund.
      </p>

      <h2>4. How to request help</h2>
      <p>
        Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with the
        result URL, payment date, amount, and a description of the issue. Never
        send a full card number, card security code, password, or secret
        recovery code.
      </p>

      <h2>5. Link transaction support</h2>
      <p>
        Link is the merchant of record for Managed Payments transactions and
        provides transaction-level support. You may request transaction
        assistance or a refund through Link support. FutariShiru continues to
        handle product access and report-related issues through the contact
        above.
      </p>
      <LegalNav locale="en" />
    </main>
  );
}
