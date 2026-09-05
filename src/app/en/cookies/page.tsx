import type { Metadata } from "next";
import { LegalNav } from "@/components/LegalNav";
import { SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Cookie and Local Storage Policy",
  description:
    "How FutariShiru uses essential cookies, local storage, Firebase, Stripe, and Link technologies.",
  alternates: {
    canonical: "/en/cookies",
    languages: { ja: "/cookies", en: "/en/cookies" },
  },
};

export default function Page() {
  return (
    <main className="legal" lang="en">
      <p className="eyebrow">COOKIES</p>
      <h1>Cookie and Local Storage Policy</h1>
      <p className="legal-updated">Effective: September 5, 2026</p>
      <p>
        FutariShiru uses cookies, browser local storage, and similar
        technologies needed to run the game, maintain anonymous authentication,
        restore purchased reports, and provide secure checkout.
      </p>

      <h2>1. Essential technologies</h2>
      <ul>
        <li>
          local storage that restores in-progress game data and results on your
          device;
        </li>
        <li>Firebase storage used to maintain anonymous authentication;</li>
        <li>
          a signed cookie used to restore access to a purchased report; and
        </li>
        <li>
          hosting technologies needed for security, routing, load balancing, and
          abuse prevention.
        </li>
      </ul>
      <p>
        These technologies are necessary for requested functionality and are not
        used by us for behavioral advertising.
      </p>

      <h2>2. Stripe and Link</h2>
      <p>
        When you open checkout, Stripe and Link may use cookies or similar
        technologies for payment, authentication, fraud prevention,
        localization, and transaction management. Their use is governed by their
        applicable privacy and cookie notices.
      </p>

      <h2>3. Analytics and advertising</h2>
      <p>
        We do not currently place optional analytics cookies or behavioral
        advertising cookies. If we introduce them, we will update this Policy
        and request consent where required before they are used.
      </p>

      <h2>4. Duration and control</h2>
      <p>
        Local game data remains until replaced or cleared. A purchased-report
        recovery cookie expires with the associated access period. Provider
        security and authentication technologies may have their own durations.
        You can delete cookies and site data through your browser, but doing so
        may remove in-progress game data or access saved on that device. Keep
        your PDF and recovery code secure.
      </p>

      <h2>5. Contact</h2>
      <p>
        Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with
        questions about these technologies.
      </p>
      <LegalNav locale="en" />
    </main>
  );
}
