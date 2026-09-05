import type { Metadata } from "next";
import Link from "next/link";
import { LegalNav } from "@/components/LegalNav";
import { SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How FutariShiru collects, uses, shares, stores, and protects information.",
  alternates: {
    canonical: "/en/privacy",
    languages: { ja: "/privacy", en: "/en/privacy" },
  },
};

export default function Page() {
  return (
    <main className="legal" lang="en">
      <p className="eyebrow">PRIVACY</p>
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Effective: September 5, 2026</p>
      <p>
        This Policy explains how FutariShiru, independently operated from Japan,
        handles information in the international version of the service. Product
        and privacy questions can be sent to{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. The operator’s
        legal identity is available through the{" "}
        <Link href="/en/commerce">pre-purchase disclosure process</Link>.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li>
          nicknames, answers, predicted answers, and generated comparison
          results;
        </li>
        <li>private invitation and result identifiers;</li>
        <li>
          anonymous authentication identifiers and basic technical or access
          information;
        </li>
        <li>
          purchase status, transaction identifiers, amount, currency, and
          payment result; and
        </li>
        <li>your email address and message when you contact us.</li>
      </ul>
      <p>
        The game does not ask for your legal name, home address, telephone
        number, or email address. Payment and billing details are collected by
        Stripe and Link during checkout and are not stored as full card data on
        FutariShiru servers.
      </p>

      <h2>2. How we use information</h2>
      <ul>
        <li>
          to create, save, compare, and display a two-person game and report;
        </li>
        <li>to manage invitations and restrict access to participants;</li>
        <li>
          to confirm payment, provide purchased content, restore access, and
          handle refunds;
        </li>
        <li>to answer support, privacy, and disclosure requests;</li>
        <li>to secure, troubleshoot, and improve the service; and</li>
        <li>
          to meet legal, tax, accounting, and fraud-prevention obligations.
        </li>
      </ul>

      <h2>3. Legal grounds</h2>
      <p>
        Depending on your location, we process information to perform the
        service you request, with your consent, to comply with legal
        obligations, and for legitimate interests such as security, support, and
        improving reliability. You may withdraw consent where processing relies
        on consent, without affecting earlier lawful processing.
      </p>

      <h2>4. Sharing between participants</h2>
      <p>
        Your answers, predictions, and comparison results are shared with the
        other participant in the same game. Anyone who receives an invitation
        link, result link, PDF, or recovery code may be able to access related
        information. Share these only with people you trust.
      </p>

      <h2>5. Service providers and recipients</h2>
      <ul>
        <li>Google Firebase for anonymous authentication and data storage;</li>
        <li>Vercel for hosting, delivery, and infrastructure security; and</li>
        <li>
          Stripe and Link for Managed Payments, billing, tax handling, fraud
          prevention, transaction communications, and payment support.
        </li>
      </ul>
      <p>
        These providers process information under their own terms and privacy
        notices where they act independently, and under our instructions where
        they act as service providers.
      </p>

      <h2>6. International transfers</h2>
      <p>
        We operate from Japan and use global service providers. Information may
        therefore be processed in Japan, the United States, and other countries
        where our providers operate. Privacy protections may differ from those
        in your country. Where required, the relevant provider or operator uses
        recognized safeguards for cross-border transfers.
      </p>

      <h2>7. Storage and retention</h2>
      <p>
        Game and transaction-related information is retained only as reasonably
        necessary to provide the service, maintain purchase records, resolve
        disputes, prevent abuse, and comply with law. Paid web access lasts 12
        months; this access period is not necessarily the same as the legal
        retention period for transaction records. Browser storage remains until
        it expires, is replaced, or you clear it. See our{" "}
        <Link href="/en/cookies">Cookie and Local Storage Policy</Link>.
      </p>

      <h2>8. Security</h2>
      <p>
        We use measures including encrypted transmission, anonymous
        authentication, access controls, signed payment webhooks, signed
        recovery credentials, and restricted report access. No internet service
        can guarantee absolute security.
      </p>

      <h2>9. Your choices and rights</h2>
      <p>
        Subject to applicable law, you may request access, correction, deletion,
        restriction, objection, or a portable copy of information associated
        with you. You may also complain to a competent privacy authority. We may
        request a result URL, recovery information, or limited transaction
        details to verify authority over the relevant game. Deletion of a shared
        game may affect both participants and may be limited where records must
        be retained by law.
      </p>

      <h2>10. Sale, sharing, and advertising</h2>
      <p>
        We do not sell personal information and do not currently share it for
        cross-context behavioral advertising. We do not currently use optional
        advertising or analytics cookies. If this changes, we will update this
        Policy and provide legally required choices.
      </p>

      <h2>11. Children</h2>
      <p>
        The international version is not intended for anyone under 18. If you
        believe a minor has submitted information, contact us so we can
        investigate and take appropriate action.
      </p>

      <h2>12. Changes and contact</h2>
      <p>
        We may update this Policy to reflect changes in the service, law, or our
        practices. Material changes will be presented clearly. Contact{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with privacy
        questions or requests.
      </p>
      <LegalNav locale="en" />
    </main>
  );
}
