import type { Metadata } from "next";
import { LegalNav } from "@/components/LegalNav";
import { disclosureMailtoEn, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Seller and Commercial Disclosure",
  description:
    "Seller, pricing, delivery, cancellation, and disclosure information for FutariShiru.",
  alternates: {
    canonical: "/en/commerce",
    languages: { ja: "/commerce", en: "/en/commerce" },
  },
};

const rows = [
  ["Service", "FutariShiru"],
  ["Operator", "Independently operated from Japan"],
  [
    "Seller’s legal name",
    "Available without delay by email upon request before purchase, under the proviso to Article 11 of Japan’s Act on Specified Commercial Transactions.",
  ],
  [
    "Business address and telephone number",
    "Available without delay by email upon request before purchase, under the proviso to Article 11 of Japan’s Act on Specified Commercial Transactions.",
  ],
  ["Disclosure requests and product support", SUPPORT_EMAIL],
  [
    "Price",
    "USD 4.99 for one Full Report. Applicable tax and any localized total are shown at checkout.",
  ],
  [
    "Other charges",
    "Internet access, data, currency conversion, or other charges imposed by the customer’s providers are the customer’s responsibility.",
  ],
  [
    "Payment method",
    "Methods displayed at the Link checkout, which may include cards and supported wallets or local payment methods.",
  ],
  ["Payment timing", "The customer is charged when the purchase is completed."],
  [
    "Delivery and access",
    "The Full Report is made available immediately after payment confirmation. Web access lasts 12 months from payment, and a PDF can be downloaded during access.",
  ],
  [
    "Cancellation and refunds",
    "Because access begins immediately, change-of-mind refunds are generally unavailable after delivery. Duplicate charges, failure to provide the purchased report, material nonconformity, and rights required by law are handled under the Refund Policy.",
  ],
  ["Subscription", "None. This is a one-time purchase."],
  [
    "System requirements",
    "A current mainstream browser on an internet-connected phone or computer. PDF viewing software may be required for downloaded reports.",
  ],
  [
    "Merchant of record",
    "For Managed Payments transactions, Link appears as the merchant of record at checkout and on transaction documents.",
  ],
];

export default function Page() {
  return (
    <main className="legal" lang="en">
      <p className="eyebrow">SELLER DISCLOSURE</p>
      <h1>Seller and commercial disclosure</h1>
      <p className="legal-updated">Effective: September 5, 2026</p>
      <dl className="commerce-list">
        {rows.map(([term, description]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>
              {term === "Disclosure requests and product support" ? (
                <a href={disclosureMailtoEn}>{description}</a>
              ) : (
                description
              )}
            </dd>
          </div>
        ))}
      </dl>
      <p className="legal-caution">
        To request the seller’s legal name, active business address, and
        reachable telephone number, email us before purchasing. No prior
        purchase or reason is required. We will provide the information by email
        without delay and in time for you to review it before deciding whether
        to purchase.
      </p>
      <a className="contact-mail" href={disclosureMailtoEn}>
        Request seller information
      </a>
      <LegalNav locale="en" />
    </main>
  );
}
