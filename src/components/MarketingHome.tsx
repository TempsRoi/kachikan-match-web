import Link from "next/link";
import type { Locale } from "@/lib/locales";
import { marketingContent } from "@/lib/marketing-content";
import { absoluteSiteUrl, SITE_ORIGIN } from "@/lib/site";

const stepImages = ["answer", "invite", "result"];

export function MarketingHome({ locale }: { locale: Locale }) {
  const content = marketingContent[locale];
  const siteUrl = locale === "en" ? absoluteSiteUrl("/en") : SITE_ORIGIN;
  const legalPrefix = locale === "en" ? "/en" : "";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        url: siteUrl,
        name: content.brand,
        alternateName: ["ふたりしる", "FUTARISHIRU"],
        inLanguage: locale,
      },
      {
        "@type": "WebApplication",
        "@id": `${siteUrl}#webapp`,
        name: content.brand,
        url: siteUrl,
        isPartOf: { "@id": `${siteUrl}#website` },
        applicationCategory: "EntertainmentApplication",
        operatingSystem: "Web",
        inLanguage: locale,
        isAccessibleForFree: true,
        description: content.hero.lead2,
        offers: {
          "@type": "Offer",
          name: content.report.label,
          price: locale === "en" ? "4.99" : "480",
          priceCurrency: locale === "en" ? "USD" : "JPY",
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: content.faq.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  const primaryCta = (label: string, light = false) => (
    <Link
      className={`primary${light ? " light" : ""}`}
      href={locale === "en" ? "/en/start" : "/start"}
    >
      {label} <span>→</span>
    </Link>
  );

  return (
    <main lang={locale}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <section className="hero">
        <nav className="nav">
          <span className="brand">
            <i>ふ</i>
            <span>
              {content.brand}
              <small className="brand-alias">{content.brandAlias}</small>
            </span>
          </span>
          <div className="nav-actions">
            <span className="nav-note">{content.navNote}</span>
            <Link className="locale-switch" href={content.switchHref}>
              {content.switchLabel}
            </Link>
          </div>
        </nav>
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <div className="hero-copy">
          <p className="eyebrow">{content.hero.eyebrow}</p>
          <h1>
            {content.hero.line1}
            <br />
            <em>{content.hero.line2}</em>
          </h1>
          <p className="lead">
            {content.hero.lead1}
            <br />
            {content.hero.lead2}
          </p>
          {primaryCta(content.hero.cta)}
          <p className="privacy-note">{content.hero.privacy}</p>
        </div>
        <div className="phone-card">
          <div className="mini-label">{content.preview.label}</div>
          <div className="world-pair">
            <span>
              <img src="/worlds/cafe.jpg" alt="" />
              <b>
                {content.preview.firstName}
                <br />
                <small>{content.preview.firstStyle}</small>
              </b>
            </span>
            <i>×</i>
            <span>
              <img src="/worlds/traveler.jpg" alt="" />
              <b>
                {content.preview.secondName}
                <br />
                <small>{content.preview.secondStyle}</small>
              </b>
            </span>
          </div>
          <h3>
            {content.preview.title1}
            <br />
            {content.preview.title2}
          </h3>
          <div className="meter">
            <span style={{ width: "78%" }} />
          </div>
          <p>
            {content.preview.alignmentLabel}{" "}
            <b>{content.preview.alignmentValue}</b>
          </p>
        </div>
      </section>

      <section className="how" id="how-it-works">
        <p className="eyebrow">HOW IT WORKS</p>
        <h2>
          {content.how.title1}
          <br />
          {content.how.title2}
        </h2>
        <div className="steps">
          {content.how.steps.map((step, index) => (
            <article key={step.title}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <img src={`/steps/${stepImages[index]}.jpg`} alt={step.alt} />
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="worlds">
        <p className="eyebrow">4 PERSONALITY DIMENSIONS</p>
        <h2>{content.axes.title}</h2>
        <p>{content.axes.body}</p>
        <div className="world-grid">
          {content.axes.items.map((axis) => (
            <article key={axis.name}>
              <img src={`/worlds/${axis.key}.jpg`} alt={axis.alt} />
              <div>
                <h3>{axis.name}</h3>
                <p>{axis.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="report-preview">
        <div>
          <p className="eyebrow">FREE &amp; FULL REPORT</p>
          <h2>{content.report.title}</h2>
          <p>{content.report.body}</p>
          {primaryCta(content.report.cta)}
        </div>
        <aside>
          <span>{content.report.label}</span>
          <strong>
            {content.report.price}
            <small>{content.report.priceNote}</small>
          </strong>
          <p>{content.report.purchaseNote}</p>
          <ul>
            {content.report.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="faq-section">
        <p className="eyebrow">FAQ</p>
        <h2>{content.faqTitle}</h2>
        <div className="faq-list">
          {content.faq.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="cta-worlds">
          <img src="/worlds/cafe.jpg" alt="" />
          <img src="/worlds/traveler.jpg" alt="" />
        </div>
        <h2>{content.closing.title}</h2>
        <p>{content.closing.body}</p>
        {primaryCta(content.closing.cta, true)}
      </section>
      <footer>
        <span className="brand">
          <i>ふ</i>
          <span>
            {content.brand}
            <small className="brand-alias">{content.brandAlias}</small>
          </span>
        </span>
        <div>
          <Link href={`${legalPrefix}/terms`}>{content.footer.terms}</Link>
          <Link href={`${legalPrefix}/privacy`}>{content.footer.privacy}</Link>
          <Link href={`${legalPrefix}/refunds`}>{content.footer.refunds}</Link>
          <Link href={`${legalPrefix}/cookies`}>{content.footer.cookies}</Link>
          <Link href={`${legalPrefix}/commerce`}>
            {content.footer.commerce}
          </Link>
          <Link href={`${legalPrefix}/contact`}>{content.footer.contact}</Link>
        </div>
        <small>{content.footer.copyright}</small>
      </footer>
    </main>
  );
}
