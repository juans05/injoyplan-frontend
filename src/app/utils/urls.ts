// Every public URL is built here so links, redirects and the sitemap agree.
import { DISTRITOS_LIMA } from '@/app/data/distritos';

export const slugify = (s = '') =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/, '');

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s = '') => new RegExp(`^${UUID.source}`, 'i').test(s);

/* ---------- Event pages: /evento/{titulo}-{id}[?fecha={dateId}] ---------- */

export const eventSlug = (id: string | number, title?: string) => {
    const t = slugify(title);
    return t ? `${t}-${id}` : String(id);
};

export const eventPath = (id: string | number, title?: string, dateId?: string | number) =>
    `/evento/${eventSlug(id, title)}${dateId ? `?fecha=${dateId}` : ''}`;

export const eventIdFromSlug = (slug = '') => slug.match(UUID)?.[0] ?? null;

/* ---------- Listings: /eventos[/categoria][/distrito][/gratis]?q&desde&hasta&horario&vista ---------- */

export const TIME_SLOTS = {
    manana: { label: 'Mañana', from: '05:00', to: '11:59' },
    tarde: { label: 'Tarde', from: '12:00', to: '17:59' },
    noche: { label: 'Noche', from: '18:00', to: '04:59' }, // wraps past midnight
} as const;
export type Horario = keyof typeof TIME_SLOTS;
export const isHorario = (s?: string | null): s is Horario => !!s && s in TIME_SLOTS;

export type SearchQuery = {
    categoria?: string; // category name as the API knows it ("Música")
    distrito?: string;  // district name ("Jesús María")
    gratis?: boolean;
    q?: string;
    desde?: string;     // YYYY-MM-DD, inclusive
    hasta?: string;     // YYYY-MM-DD, inclusive
    horario?: Horario;
    vista?: 'mapa';
};

export const FREE_SEGMENT = 'gratis';

export function searchPath(p: SearchQuery = {}) {
    const segments = [p.categoria && slugify(p.categoria), p.distrito && slugify(p.distrito), p.gratis && FREE_SEGMENT].filter(Boolean);
    const qs = new URLSearchParams();
    if (p.q) qs.set('q', p.q);
    if (p.desde) qs.set('desde', p.desde);
    if (p.hasta) qs.set('hasta', p.hasta);
    if (p.horario) qs.set('horario', p.horario);
    if (p.vista) qs.set('vista', p.vista);
    const query = qs.toString();
    return `/eventos${segments.length ? `/${segments.join('/')}` : ''}${query ? `?${query}` : ''}`;
}

/**
 * Reads the path segments of /eventos/... in any order. Returns null when a segment
 * is not a known category, district or "gratis", so the page can 404.
 */
export function parseSearchSegments(segments: string[], categoryNames: string[]) {
    const out: Pick<SearchQuery, 'categoria' | 'distrito' | 'gratis'> = {};
    for (const raw of segments) {
        const seg = decodeURIComponent(raw).toLowerCase();
        const cat = categoryNames.find((c) => slugify(c) === seg);
        const dist = DISTRITOS_LIMA.find((d) => slugify(d) === seg);
        if (seg === FREE_SEGMENT && !out.gratis) out.gratis = true;
        else if (cat && !out.categoria) out.categoria = cat;
        else if (dist && !out.distrito) out.distrito = dist;
        else return null;
    }
    return out;
}

/** Turns an hour range from older links into the matching slot */
export function slotFromHours(from?: string | null, to?: string | null): Horario | undefined {
    const exact = (Object.keys(TIME_SLOTS) as Horario[]).find((k) => TIME_SLOTS[k].from === from && TIME_SLOTS[k].to === to);
    if (exact) return exact;
    if (!from) return undefined;
    const h = Number(from.slice(0, 2));
    return h >= 18 || h < 5 ? 'noche' : h >= 12 ? 'tarde' : 'manana';
}

/** H1 and <title> for a listing: "Teatro en Miraflores", "Eventos gratis en Lima" */
export function searchTitle(p: Pick<SearchQuery, 'categoria' | 'distrito' | 'gratis' | 'q'>) {
    if (p.q && !p.categoria && !p.distrito && !p.gratis) return `Resultados para “${p.q}”`;
    const what = `${p.categoria || 'Eventos'}${p.gratis ? ' gratis' : ''}`;
    return `${what} en ${p.distrito || 'Lima'}`;
}
