export const SITE_ORIGIN = "https://playfutarishiru.com";

export function absoluteSiteUrl(path = "/") {
  return new URL(path, `${SITE_ORIGIN}/`).toString();
}
