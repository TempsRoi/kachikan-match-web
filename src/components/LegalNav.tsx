import Link from "next/link";
import type { Locale } from "@/lib/locales";

const links = {
  ja: [
    ["/terms", "利用規約"],
    ["/privacy", "プライバシーポリシー"],
    ["/refunds", "キャンセル・返金"],
    ["/cookies", "Cookieポリシー"],
    ["/commerce", "特定商取引法に基づく表記"],
    ["/contact", "お問い合わせ"],
    ["/", "トップへ戻る"],
  ],
  en: [
    ["/en/terms", "Terms"],
    ["/en/privacy", "Privacy"],
    ["/en/refunds", "Refunds"],
    ["/en/cookies", "Cookies"],
    ["/en/commerce", "Seller disclosure"],
    ["/en/contact", "Contact"],
    ["/en", "Back to FutariShiru"],
  ],
} satisfies Record<Locale, Array<[string, string]>>;

export function LegalNav({ locale }: { locale: Locale }) {
  return (
    <nav
      className="legal-nav"
      aria-label={locale === "en" ? "Legal" : "法務情報"}
    >
      {links[locale].map(([href, label]) => (
        <Link href={href} key={href}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
