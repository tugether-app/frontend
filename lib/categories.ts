// Goal categories. Each maps to an illustrated icon in /public/art/cat.
// labelKey resolves via i18n (cat.*). icon path is /art/cat/<key>.png.

export const CATEGORIES = [
  "trip",
  "gift",
  "wedding",
  "birthday",
  "home",
  "community",
  "business",
  "education",
  "emergency",
  "custom",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function catIcon(cat?: string): string {
  const c = (CATEGORIES as readonly string[]).includes(cat ?? "") ? cat : "custom";
  return `/art/cat/${c}.png`;
}
