import type { MetadataRoute } from 'next';
import { BASE_URL, SITE_URL } from './utils/fetch';
import { eventPath, searchPath } from './utils/urls';

export const revalidate = 3600;

const STATIC_PAGES = ['', '/eventos', '/eventos/gratis', '/nosotros', '/contactanos', '/preguntas-frecuentes', '/libro-de-reclamaciones',
  '/terminos-y-condiciones', '/politicas-privacidad', '/politicas-cookies'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = STATIC_PAGES.map((p) => ({ url: `${SITE_URL}${p}` }));
  try {
    // ponytail: single page of 500 events; paginate if the catalog grows past that
    const [res, catRes] = await Promise.all([
      fetch(`${BASE_URL}/events/public/search?page=1&limit=500&expandDates=false`),
      fetch(`${BASE_URL}/events/stats/by-category`),
    ]);
    const { eventos = [] } = await res.json();
    const cats: any[] = await catRes.json().catch(() => []);
    const events = eventos.map((e: any) => ({ url: `${SITE_URL}${eventPath(e.id, e.title)}`, lastModified: e.updatedAt }));
    // Landings only for filters that have something to show
    const categories = (Array.isArray(cats) ? cats : []).filter((c) => c.cantidad > 0)
      .map((c) => ({ url: `${SITE_URL}${searchPath({ categoria: c.nombreCategoria })}` }));
    const districts = [...new Set<string>(eventos.map((e: any) => e.location?.district).filter(Boolean))]
      .map((d) => ({ url: `${SITE_URL}${searchPath({ distrito: d })}` }));
    return [...pages, ...categories, ...districts, ...events];
  } catch {
    return pages;
  }
}
