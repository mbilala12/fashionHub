export function isHttpUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function isSkippable(href: string): boolean {
  if (!href) return true;
  const trimmed = href.trim();
  if (trimmed === '' || trimmed === '#' ) return true;
  if (/^(mailto:|tel:|javascript:)/i.test(trimmed)) return true;
  return false;
}

export function normalize(base: string, href: string): string {
  try {
    if (isHttpUrl(href)) return new URL(href).toString();
    return new URL(href, base.endsWith('/') ? base : base + '/').toString();
  } catch {
    return href;
  }
}
