/** Site name. Appended to every page title and used as `og:site_name`. */
export const SITE_NAME = "Aron Fridvalszky";
/** Fallback meta description for pages that don't set their own. */
export const SITE_DESCRIPTION =
  "Product designer based in Budapest, working across UI/UX, branding, and motion.";
/** Canonical origin. Resolves canonical URLs, social images, and the sitemap. */
export const SITE_URL = "https://aronfridvalszky.com";
/** BCP 47 locale tag used to format dates and numbers. */
export const SITE_LOCALE = "en-US";
/**
 * Formspree endpoint the contact form posts to, e.g.
 * `https://formspree.io/f/xxxxxxxx`. Left empty, the form sends nothing and
 * only reports a fake success (see `Form.astro`'s `action` prop).
 */
export const CONTACT_FORM_ENDPOINT = "https://formspree.io/f/xdekedqz";
/**
 * Routes kept out of search results. Each is excluded from the sitemap and
 * served with a `robots: noindex, nofollow` tag, so the two can't disagree.
 *
 * Surrounding slashes are optional: `"/thanks"`, `"thanks"` and `"/thanks/"`
 * all match the same route.
 */
export const NOINDEX_ROUTES: string[] = ["/404"];
