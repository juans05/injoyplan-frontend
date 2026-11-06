import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { BASE_URL } from '@/app/utils/fetch';
import { isHorario, parseSearchSegments, searchPath, searchTitle, type SearchQuery } from '@/app/utils/urls';
import SearchClient from '../SearchClient';

type Props = {
    params: Promise<{ filtros?: string[] }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) || undefined;

async function categoryNames(): Promise<string[]> {
    try {
        const res = await fetch(`${BASE_URL}/events/stats/by-category`, { next: { revalidate: 3600 } });
        const json = await res.json();
        return (Array.isArray(json) ? json : []).map((c: any) => c.nombreCategoria).filter(Boolean);
    } catch {
        return [];
    }
}

async function resolve({ params, searchParams }: Props): Promise<SearchQuery | null> {
    const [{ filtros = [] }, sp, names] = await Promise.all([params, searchParams, categoryNames()]);
    const segs = parseSearchSegments(filtros, names);
    if (!segs) return null;
    const desde = one(sp.desde), hasta = one(sp.hasta), horario = one(sp.horario);
    return {
        ...segs,
        q: one(sp.q)?.trim() || undefined,
        desde: desde && DAY.test(desde) ? desde : undefined,
        hasta: hasta && DAY.test(hasta) ? hasta : undefined,
        horario: isHorario(horario) ? horario : undefined,
        vista: one(sp.vista) === 'mapa' ? 'mapa' : undefined,
    };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const q = await resolve(props);
    if (!q) return { title: 'Página no encontrada | Injoyplan', robots: { index: false } };
    const title = searchTitle(q);
    // Path filters are landing pages; query-only variations (dates, text, map) point back to them
    const canonical = searchPath({ categoria: q.categoria, distrito: q.distrito, gratis: q.gratis });
    const description = `${title}: agenda de teatro, música, cultura y entretenimiento con fechas, lugares y precios. Encuentra tu próximo plan en Injoyplan.`;
    return {
        title: `${title} | Injoyplan`,
        description,
        alternates: { canonical },
        robots: q.q ? { index: false, follow: true } : undefined,
        openGraph: { title: `${title} | Injoyplan`, description, url: canonical, type: 'website', locale: 'es_PE', siteName: 'Injoyplan' },
    };
}

export default async function EventosPage(props: Props) {
    const q = await resolve(props);
    if (!q) notFound();
    // One URL per filter combination: /eventos/miraflores/teatro -> /eventos/teatro/miraflores
    const { filtros = [] } = await props.params;
    const canonicalPath = searchPath({ categoria: q.categoria, distrito: q.distrito, gratis: q.gratis }).split('?')[0];
    if (`/eventos${filtros.length ? `/${filtros.map((s) => decodeURIComponent(s)).join('/')}` : ''}` !== canonicalPath) {
        permanentRedirect(searchPath(q));
    }
    return <SearchClient initial={q} />;
}
