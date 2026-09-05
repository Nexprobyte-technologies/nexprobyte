import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE, SEO_BY_PATH } from "../data/seo.js";

function setMeta(attr, name, content) {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  if (content) {
    el.setAttribute("content", content);
  }
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Updates document title + SEO meta tags for the current route.
 * Falls back to sensible defaults for unknown paths.
 */
export function useSEO(custom) {
  const { pathname } = useLocation();

  useEffect(() => {
    const base = SEO_BY_PATH[pathname] || {};

    // Support dynamic overrides (e.g. blog post title) via custom param.
    const title = custom?.title || base.title || `${SITE.name} — ${SITE.tagline}`;
    const description =
      custom?.description || base.description || SITE.tagline;
    const keywords =
      custom?.keywords ||
      base.keywords ||
      "digital marketing agency Coimbatore, software company Coimbatore";

    document.title = title;

    const url = `${SITE.url}${pathname === "/" ? "/" : pathname}`;

    setMeta("name", "author", SITE.name);
    setMeta("name", "robots", "index, follow, max-image-preview:large");
    setMeta("name", "description", description);
    setMeta("name", "keywords", keywords);

    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", SITE.name);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);

    setLink("canonical", url);

    // Refresh JSON-LD og:url / breadcrumb not strictly needed here.
    return () => {};
  }, [pathname, custom?.title, custom?.description, custom?.keywords]);

  return null;
}
