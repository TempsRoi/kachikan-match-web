export const SUPPORTED_LOCALES = ["ja", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ja";

export const CONTENT_VERSIONS: Record<Locale, string> = {
  ja: "ja-v2",
  en: "en-v1",
};

export function isSupportedLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale)
  );
}

export function normalizeLocale(value: unknown): Locale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

export function contentVersionFor(locale: Locale): string {
  return CONTENT_VERSIONS[locale];
}
