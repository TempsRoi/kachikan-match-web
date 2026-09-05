import type { Metadata } from "next";
import Link from "next/link";
import { LegalNav } from "@/components/LegalNav";
import { SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms governing use of the FutariShiru connection game and Full Report.",
  alternates: {
    canonical: "/en/terms",
    languages: { ja: "/terms", en: "/en/terms" },
  },
};

export default function Page() {
  return (
    <main className="legal" lang="en">
      <p className="eyebrow">TERMS</p>
      <h1>Terms of Use</h1>
      <p className="legal-updated">Effective: September 5, 2026</p>
      <p>
        These Terms govern your use of FutariShiru, operated independently from
        Japan. By using the service, you agree to these Terms. If you do not
        agree, do not use the service.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        The international version is intended only for people aged 18 or older.
        You must have the legal capacity to agree to these Terms and make a
        purchase.
      </p>

      <h2>2. What FutariShiru provides</h2>
      <p>
        FutariShiru is a two-person entertainment and conversation game. It
        compares answers and predictions to show similarities, differences,
        connection styles, and conversation prompts. It is not psychological,
        medical, therapeutic, or professional advice and does not determine the
        quality of a relationship.
      </p>

      <h2>3. Invitations and shared answers</h2>
      <p>
        Invite another person only with their consent. Answers and results are
        shared with the other participant in the same game. Keep invitation
        links, result links, downloaded PDFs, and recovery codes private. You
        are responsible for anyone to whom you intentionally provide them.
      </p>

      <h2>4. Free results and the Full Report</h2>
      <p>
        Basic results are available without charge. A Full Report is a one-time
        purchase for one completed game and currently costs USD 4.99, plus any
        tax shown at checkout. It includes all 24 answer comparisons, an
        eight-category analysis, a seven-day action plan, 12 months of web
        access from payment, and a downloadable PDF. It is not a subscription.
      </p>

      <h2>5. Managed Payments</h2>
      <p>
        The international checkout uses Stripe Managed Payments. Link appears as
        the merchant of record at checkout and on transaction documents, handles
        payment and transaction-level support, and sends transaction emails.
        FutariShiru remains responsible for the game and product-level support.
        Checkout may present localized currency and payment methods based on
        your location.
      </p>

      <h2>6. Delivery, access, and recovery</h2>
      <p>
        Access is normally provided immediately after payment confirmation.
        Browser storage, a signed recovery cookie, and a recovery code may be
        used to restore access. You are responsible for keeping the PDF and
        recovery code secure. We may ask for reasonable transaction details when
        investigating an access problem, but never for your full card number or
        security code.
      </p>

      <h2>7. Cancellations and refunds</h2>
      <p>
        Because the Full Report is delivered immediately, change-of-mind refunds
        are generally unavailable after delivery, to the extent permitted by
        law. Duplicate charges, inability to provide the purchased report,
        material nonconformity, and remedies required by applicable law are
        handled under our <Link href="/en/refunds">Refund Policy</Link>. You may
        also contact Link for transaction-level support.
      </p>

      <h2>8. Acceptable use</h2>
      <p>You must not:</p>
      <ul>
        <li>
          impersonate another person or participate without their consent;
        </li>
        <li>
          publish another participant’s answers or report against their wishes;
        </li>
        <li>
          attempt unauthorized access, interfere with security, or disrupt the
          service;
        </li>
        <li>
          use the service unlawfully or to harass, exploit, or harm another
          person; or
        </li>
        <li>
          copy, scrape, resell, or commercially redistribute the service or
          reports without permission.
        </li>
      </ul>

      <h2>9. Intellectual property</h2>
      <p>
        FutariShiru’s questions, scoring, reports, design, software, and
        branding are protected by applicable intellectual property laws. You
        retain responsibility for information you submit and grant us only the
        limited permission necessary to store, compare, display, and generate
        your game results.
      </p>

      <h2>10. Availability and changes</h2>
      <p>
        We may modify, maintain, suspend, or discontinue parts of the service
        when reasonably necessary. If a service issue affects purchased content,
        we will take reasonable steps to restore access or provide another
        appropriate remedy.
      </p>

      <h2>11. Disclaimers and liability</h2>
      <p>
        The service is provided on an “as available” basis. We do not guarantee
        that every result is complete, accurate, or suitable for a particular
        purpose. To the extent permitted by law, we are not liable for indirect
        or consequential loss arising from use of the entertainment results.
        Nothing in these Terms excludes liability or consumer rights that cannot
        lawfully be excluded.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These Terms are governed by the laws of Japan. Courts with jurisdiction
        over the operator’s location in Japan will have jurisdiction to the
        extent a valid choice of forum is permitted. Mandatory consumer
        protections in your place of residence remain unaffected.
      </p>

      <h2>13. Changes to these Terms</h2>
      <p>
        We may update these Terms when the service, law, or our practices
        change. Material changes will be presented clearly on the service, and
        the effective date above will be updated.
      </p>

      <h2>14. Contact and seller disclosure</h2>
      <p>
        Contact <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. The
        seller’s legal name, active business address, and reachable telephone
        number are available without delay by email upon request before
        purchase. See the <Link href="/en/commerce">Seller Disclosure</Link>.
      </p>
      <LegalNav locale="en" />
    </main>
  );
}
