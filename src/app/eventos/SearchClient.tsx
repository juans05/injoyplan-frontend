"use client"
import { useCategoriesState } from "@/app/zustand/categories";
import { useEventStore } from "@/app/zustand/events";
import { toggleFavorite } from "@/app/zustand/favorites";
import dayjs from '@/app/utils/date';
import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Card from "@/app/components/Card";
import CardSkeleton from '@/app/components/CardSkeleton';
import useDebounce from "@/app/hooks/useDebounce";
import { track } from "@/app/utils/analytics";
import dynamic from "next/dynamic";
import Filters, { EMPTY_FILTERS, type FilterState } from "./Filters";
import { searchPath, searchTitle, TIME_SLOTS, type SearchQuery } from "@/app/utils/urls";

const ResultsMap = dynamic(() => import('./ResultsMap'), { ssr: false });

// Pages loaded automatically while scrolling; after that the user asks for more
const AUTO_PAGES = 3;
const PAGE_SIZE = 12;

type Props = { initial: SearchQuery };

const SearchClient = ({ initial }: Props) => {
    const { getEventSearchByFilters, eventSearchByFilters, total, isLoading } = useEventStore();
    const { countsCategories, getCategoriesCount } = useCategoriesState();

    const [search, setSearch] = useState<string>(initial.q || '');
    const [filters, setFilters] = useState<FilterState>({
        category: initial.categoria || '',
        distrito: initial.distrito || '',
        date: initial.desde || '',
        dateEnd: initial.hasta || '',
        horario: initial.horario || '',
        esGratis: Boolean(initial.gratis),
    });
    const { category, distrito, date, dateEnd, horario, esGratis } = filters;
    const setFilter = (patch: Partial<FilterState>) => setFilters((f) => ({ ...f, ...patch }));
    const [view, setView] = useState<'lista' | 'mapa'>(initial.vista === 'mapa' ? 'mapa' : 'lista');

    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const sentinel = useRef<HTMLDivElement>(null);
    // Until this page's first response arrives, the store still holds nothing or an older search
    const searchStarted = useRef(false);
    const [firstLoad, setFirstLoad] = useState(true);
    useEffect(() => { if (searchStarted.current && !isLoading) setFirstLoad(false); }, [isLoading]);
    const loading = firstLoad || isLoading;

    const searchDebounce = useDebounce(search, 600);
    const categories: any[] = (countsCategories || []).filter((c: any) => c.cantidad > 0);

    useEffect(() => { getCategoriesCount(); }, []);

    const slot = horario ? TIME_SLOTS[horario] : null;
    const buildSearchData = () => ({
        categoria: category || undefined,
        distrito: distrito || undefined,
        // The listing always starts today unless the user picks another day
        fechaInicio: date || dayjs().format('YYYY-MM-DD'),
        // URL keeps the inclusive last day; the API compares against midnight UTC, so send the next day
        fechaFin: dateEnd ? dayjs(dateEnd).add(1, 'day').format('YYYY-MM-DD') : undefined,
        busqueda: searchDebounce || undefined,
        limit: PAGE_SIZE,
        page: 1,
        esGratis: esGratis || undefined,
        horaInicio: slot?.from,
        horaFin: slot?.to,
    });

    const query: SearchQuery = {
        categoria: category || undefined, distrito: distrito || undefined, gratis: esGratis || undefined,
        q: searchDebounce || undefined, desde: date || undefined, hasta: dateEnd || undefined,
        horario: horario || undefined, vista: view === 'mapa' ? 'mapa' : undefined,
    };
    const url = searchPath(query);

    // Mirror the filters in the URL without a navigation: no server round trip, no remount
    useEffect(() => {
        if (`${window.location.pathname}${window.location.search}` !== url) window.history.replaceState(null, '', url);
    }, [url]);

    useEffect(() => {
        searchStarted.current = true;
        getEventSearchByFilters(buildSearchData());
        setPage(1);
        if (searchDebounce) track('search', { search_term: searchDebounce });
    }, [searchDebounce, category, distrito, date, dateEnd, esGratis, horario]);

    const results = eventSearchByFilters || [];
    const hasMore = Boolean(total) && results.length < (total as number);

    const loadMore = () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        getEventSearchByFilters(buildSearchData(), { page: page + 1, isLoadMore: true, limit: PAGE_SIZE })
            .finally(() => { setLoadingMore(false); setPage((p) => p + 1); });
    };

    // Infinite scroll for the first pages
    useEffect(() => {
        const el = sentinel.current;
        if (!el || page >= AUTO_PAGES || !hasMore) return;
        const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadMore(); }, { rootMargin: '400px' });
        io.observe(el);
        return () => io.disconnect();
    }, [page, hasMore, loadingMore, results.length]);

    const pickCategory = (name: string) => {
        setFilter({ category: name });
        if (name) track('select_category', { category: name });
    };

    const pickDistrict = (d: string) => {
        setFilter({ distrito: d });
        if (d) track('select_district', { district: d });
    };

    // The map asks for every match with the same filters as the list
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page: _p, limit: _l, ...mapQuery } = buildSearchData();

    const hasFilters = Object.entries(filters).some(([k, v]) => v !== EMPTY_FILTERS[k as keyof FilterState]);
    const clearAll = () => { setFilters(EMPTY_FILTERS); setSearch(''); };
    const count = total ?? results.length;
    const resultLabel = loading ? 'Buscando…' : `${count} ${count === 1 ? 'evento' : 'eventos'}`;

    const title = searchTitle({ categoria: category, distrito, gratis: esGratis, q: searchDebounce });

    return (
        <div className="pb-16">
            <div className="border-b border-line bg-canvas">
                <div className="container-page py-8 md:py-10">
                    <h1 className="heading-1 !text-h2">{title}</h1>
                    <div className="relative mt-5 max-w-xl">
                        <label htmlFor="search-q" className="sr-only">Buscar eventos</label>
                        <Icon icon="solar:magnifer-linear" width={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray" aria-hidden />
                        <input id="search-q" type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Busca por nombre, artista o lugar" className="field pl-11 pr-11" />
                        {search && (
                            <button type="button" onClick={() => setSearch('')} aria-label="Borrar búsqueda"
                                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft hover:bg-line">
                                <Icon icon="solar:close-circle-linear" width={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Sticky under the header from md up (64px / 72px); on phones it scrolls away so results get the screen. Solid background: a backdrop-filter would trap the mobile sheets. */}
            <div className="border-b border-line bg-white md:sticky md:top-16 md:z-30 lg:top-[72px]">
                <div className="container-page py-3">
                    <Filters value={filters} onChange={setFilter} categories={categories}
                        onPickCategory={pickCategory} onPickDistrict={pickDistrict} />
                </div>
            </div>

            <div className="container-page">
                <div className="flex items-center justify-between gap-3 pt-6">
                    <p className="text-label text-ink-soft" aria-live="polite">{resultLabel}</p>
                    <div role="group" aria-label="Ver resultados como" className="inline-flex rounded-full border border-line bg-white p-1">
                        {([['lista', 'Lista', 'solar:list-linear'], ['mapa', 'Mapa', 'solar:map-linear']] as const).map(([v, label, icon]) => (
                            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}
                                className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-label transition-colors ${view === v ? 'bg-brand text-white' : 'text-ink hover:text-brand'}`}>
                                <Icon icon={icon} width={18} aria-hidden /> {label}
                            </button>
                        ))}
                    </div>
                </div>
                {view === 'mapa' ? (
                    <div className="pt-4">
                        <ResultsMap query={mapQuery} />
                    </div>
                ) : (
                <div className="pt-4 lg:pt-8">
                    {firstLoad || (isLoading && results.length === 0) ? (
                        <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => <li key={i}><CardSkeleton /></li>)}
                        </ul>
                    ) : results.length === 0 ? (
                        <div className="surface mx-auto max-w-lg p-8 text-center">
                            <Icon icon="solar:ticket-linear" width={44} className="mx-auto text-brand-gray" aria-hidden />
                            <h2 className="mt-4 text-h3 font-bold text-ink">No encontramos eventos con estos filtros</h2>
                            <p className="mt-2 text-label font-normal text-ink-soft">Prueba con otras fechas, otro distrito o quita algún filtro.</p>
                            {(hasFilters || search) && <button type="button" onClick={clearAll} className="btn-primary mt-6">Quitar filtros</button>}
                        </div>
                    ) : (
                        <ul aria-busy={loading} className={`grid grid-cols-1 gap-x-6 gap-y-10 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${loading ? 'opacity-50' : ''}`}>
                            {results.map((item: any, index: number) => (
                                <li key={`${item?.idEventos ?? item?.ideventos}-${item?.idfecha ?? item?.FechaInicio}-${index}`}>
                                    <Card item={item} addFavoritesByUser={toggleFavorite} />
                                </li>
                            ))}
                            {loadingMore && Array.from({ length: 4 }).map((_, i) => <li key={`more-${i}`}><CardSkeleton /></li>)}
                        </ul>
                    )}

                    <div ref={sentinel} aria-hidden />

                    {hasMore && page >= AUTO_PAGES && !loadingMore && (
                        <div className="mt-12 flex justify-center">
                            <button type="button" onClick={loadMore} className="btn-secondary btn-lg">Ver más planes</button>
                        </div>
                    )}
                </div>
                )}
            </div>
        </div>
    )
}

export default SearchClient;
