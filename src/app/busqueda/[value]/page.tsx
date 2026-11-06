import { permanentRedirect } from 'next/navigation';
import { BASE_URL } from '@/app/utils/fetch';
import { searchPath, slotFromHours, type SearchQuery } from '@/app/utils/urls';

type Props = {
    params: Promise<{ value: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) || undefined;

// Old /busqueda/{categoryId|text}?fechaInicio&... links move to /eventos/...
export default async function LegacySearch({ params, searchParams }: Props) {
    const [{ value }, sp] = await Promise.all([params, searchParams]);
    const raw = decodeURIComponent(value || '').trim();
    const q: SearchQuery = {
        distrito: one(sp.distrito),
        gratis: one(sp.esGratis) === 'true' || undefined,
        q: one(sp.q) || one(sp.busqueda),
        desde: one(sp.fechaInicio)?.slice(0, 10),
        hasta: one(sp.fechaFin)?.slice(0, 10),
        horario: slotFromHours(one(sp.horaInicio), one(sp.horaFin)),
        vista: one(sp.vista) === 'mapa' ? 'mapa' : undefined,
    };
    if (/^\d+$/.test(raw)) {
        if (raw !== '0') {
            try {
                const res = await fetch(`${BASE_URL}/events/stats/by-category`, { next: { revalidate: 3600 } });
                const cats: any[] = await res.json();
                q.categoria = cats.find((c) => String(c.idCategorias) === raw)?.nombreCategoria;
            } catch { /* unknown category: plain listing */ }
        }
    } else if (raw) {
        q.q = raw;
    }
    permanentRedirect(searchPath(q));
}
