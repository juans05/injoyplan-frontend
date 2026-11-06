"use client"
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { get } from '@/app/utils/fetch';
import dayjs from '@/app/utils/date';
import { formatPrice } from '@/app/components/Card';
import type { BackendEvent, EventSearchResponse } from '@/app/interfaces/event';
import { eventPath } from '@/app/utils/urls';

// The map shows every match at once, not just the loaded page of the list
const MAP_LIMIT = 1000;
const LIMA: [number, number] = [-77.03, -12.1];

type Show = { event: BackendEvent; dates: NonNullable<BackendEvent['dates']> };
type Venue = { key: string; name: string; district: string; lng: number; lat: number; shows: Show[] };

const when = (d: { date: string; startTime?: string }) =>
    `${dayjs.utc(d.date).format('ddd D MMM').replace('.', '')}${d.startTime ? ` · ${d.startTime}` : ''}`;

const ResultsMap = ({ query }: { query: Record<string, string | number | boolean | undefined> }) => {
    const [rows, setRows] = useState<BackendEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<string | null>(null);
    const container = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    // Same filters as the list
    const qs = useMemo(() => {
        const p = new URLSearchParams();
        Object.entries(query).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== false) p.set(k, String(v)); });
        p.set('page', '1');
        p.set('limit', String(MAP_LIMIT));
        return p.toString();
    }, [query]);

    useEffect(() => {
        let stale = false;
        setLoading(true);
        get<EventSearchResponse>(`events/public/search?${qs}`)
            .then((r) => { if (!stale) setRows(r?.eventos || []); })
            .catch(() => { if (!stale) setRows([]); })
            .finally(() => { if (!stale) setLoading(false); });
        return () => { stale = true; };
    }, [qs]);

    // The API returns one row per date: group them by venue, then by event
    const venues = useMemo(() => {
        const byVenue = new Map<string, Venue>();
        for (const e of rows) {
            const loc = e.location;
            if (!loc?.latitude || !loc?.longitude) continue;
            const key = `${loc.latitude},${loc.longitude}`;
            if (!byVenue.has(key)) byVenue.set(key, { key, name: loc.name || loc.address || 'Lugar del evento', district: loc.district || '', lng: Number(loc.longitude), lat: Number(loc.latitude), shows: [] });
            const venue = byVenue.get(key)!;
            const show = venue.shows.find((s) => s.event.id === e.id);
            if (show) show.dates.push(...(e.dates || []));
            else venue.shows.push({ event: e, dates: [...(e.dates || [])] });
        }
        return [...byVenue.values()].sort((a, b) => b.shows.length - a.shows.length);
    }, [rows]);

    const venue = venues.find((v) => v.key === selected) || null;
    // Drop a selection the new filters no longer include
    useEffect(() => { if (selected && !venues.some((v) => v.key === selected)) setSelected(null); }, [venues, selected]);

    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!container.current) return;
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
        const m = new mapboxgl.Map({
            container: container.current, style: 'mapbox://styles/mapbox/streets-v12', center: LIMA, zoom: 11, cooperativeGestures: true,
            locale: {
                'ScrollZoomBlocker.CtrlMessage': 'Usa Ctrl + rueda para acercar el mapa',
                'ScrollZoomBlocker.CmdMessage': 'Usa ⌘ + rueda para acercar el mapa',
                'TouchPanBlocker.Message': 'Usa dos dedos para mover el mapa',
                'NavigationControl.ZoomIn': 'Acercar',
                'NavigationControl.ZoomOut': 'Alejar',
            },
        });
        m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

        m.on('load', () => {
            // Nearby venues merge into one bubble that adds up their events
            m.addSource('venues', {
                type: 'geojson', data: { type: 'FeatureCollection', features: [] },
                cluster: true, clusterRadius: 44, clusterMaxZoom: 15,
                clusterProperties: { events: ['+', ['get', 'count']] },
            });
            const text = { 'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'], 'text-size': 13, 'text-allow-overlap': true };
            m.addLayer({ id: 'clusters', type: 'circle', source: 'venues', filter: ['has', 'point_count'],
                paint: { 'circle-color': '#006080', 'circle-radius': ['step', ['get', 'events'], 18, 10, 22, 40, 27], 'circle-stroke-width': 3, 'circle-stroke-color': '#E0F2F7' } });
            m.addLayer({ id: 'cluster-count', type: 'symbol', source: 'venues', filter: ['has', 'point_count'],
                layout: { ...text, 'text-field': ['to-string', ['get', 'events']] }, paint: { 'text-color': '#FFFFFF' } });
            m.addLayer({ id: 'venue', type: 'circle', source: 'venues', filter: ['!', ['has', 'point_count']],
                paint: { 'circle-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#006080', '#007FA4'],
                    'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 18, 15], 'circle-stroke-width': 2, 'circle-stroke-color': '#FFFFFF' } });
            m.addLayer({ id: 'venue-count', type: 'symbol', source: 'venues', filter: ['!', ['has', 'point_count']],
                layout: { ...text, 'text-field': ['to-string', ['get', 'count']] }, paint: { 'text-color': '#FFFFFF' } });

            m.on('click', 'clusters', (e) => {
                const f = e.features?.[0];
                if (!f) return;
                (m.getSource('venues') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(f.properties?.cluster_id, (err, zoom) => {
                    if (!err && zoom != null) m.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom: zoom + 0.5 });
                });
            });
            m.on('click', 'venue', (e) => { const key = e.features?.[0]?.properties?.key; if (key) setSelected(String(key)); });
            ['clusters', 'venue'].forEach((id) => {
                m.on('mouseenter', id, () => { m.getCanvas().style.cursor = 'pointer'; });
                m.on('mouseleave', id, () => { m.getCanvas().style.cursor = ''; });
            });
            setReady(true);
        });
        map.current = m;
        return () => { m.remove(); map.current = null; setReady(false); };
    }, []);

    // Feed the venues to the map and frame them
    useEffect(() => {
        const m = map.current;
        if (!m || !ready) return;
        (m.getSource('venues') as mapboxgl.GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: venues.map((v, i) => ({
                type: 'Feature', id: i + 1,
                properties: { key: v.key, count: v.shows.length },
                geometry: { type: 'Point', coordinates: [v.lng, v.lat] },
            })),
        });
        if (venues.length) {
            const bounds = new mapboxgl.LngLatBounds();
            venues.forEach((v) => bounds.extend([v.lng, v.lat]));
            m.setPadding({ left: 0, top: 0, right: 0, bottom: 0 });
            m.fitBounds(bounds, { padding: 64, maxZoom: 15, duration: 600 });
        }
    }, [venues, ready]);

    // Highlight the selected venue and bring it into view
    useEffect(() => {
        const m = map.current;
        if (!m || !ready) return;
        venues.forEach((v, i) => m.setFeatureState({ source: 'venues', id: i + 1 }, { selected: v.key === selected }));
        if (!venue) return;
        // Center the pin in the part of the map the panel leaves free (left column on desktop, top on mobile)
        const desktop = window.matchMedia('(min-width: 768px)').matches;
        const padding = desktop
            ? { left: 400, top: 0, right: 0, bottom: 0 }
            : { left: 0, top: 0, right: 0, bottom: m.getContainer().clientHeight * 0.6 };
        m.easeTo({ center: [venue.lng, venue.lat], zoom: Math.max(m.getZoom(), 15.5), padding, duration: 500 });
    }, [selected, venues, venue, ready]);

    return (
        <div className="relative h-[calc(100dvh-160px)] min-h-[480px] overflow-hidden rounded-panel border border-line bg-canvas lg:h-[calc(100dvh-180px)]">
            <div ref={container} className="h-full w-full" />

            {loading && (
                <p className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-label text-ink shadow-float" aria-live="polite">Cargando mapa…</p>
            )}
            {!loading && venues.length === 0 && (
                <div className="absolute inset-x-4 top-4 mx-auto max-w-sm rounded-card bg-white p-4 text-center shadow-float" aria-live="polite">
                    <p className="text-body font-bold text-ink">No hay eventos con estos filtros</p>
                    <p className="mt-1 text-label font-normal text-ink-soft">Cambia la fecha o el distrito para ver puntos en el mapa.</p>
                </div>
            )}
            {!loading && venues.length > 0 && !venue && (
                <p className="absolute bottom-4 left-1/2 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-white px-4 py-2 text-center text-label text-ink shadow-float md:bottom-auto md:left-4 md:top-4 md:translate-x-0">
                    {venues.length} {venues.length === 1 ? 'lugar' : 'lugares'} · toca uno para ver qué hay
                </p>
            )}

            {venue && (
                <aside aria-label={`Eventos en ${venue.name}`}
                    className="absolute inset-x-3 bottom-3 flex max-h-[60%] flex-col overflow-hidden rounded-panel bg-white shadow-float md:inset-x-auto md:bottom-auto md:left-4 md:top-4 md:max-h-[calc(100%-2rem)] md:w-[380px]">
                    <div className="flex items-start gap-3 border-b border-line p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-mist text-brand-deep">
                            <Icon icon="solar:map-point-bold" width={22} aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-h3 text-ink">{venue.name}</p>
                            <p className="text-caption text-ink-soft">{venue.district} · {venue.shows.length} {venue.shows.length === 1 ? 'evento' : 'eventos'}</p>
                        </div>
                        <button type="button" onClick={() => setSelected(null)} aria-label="Cerrar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-canvas">
                            <Icon icon="solar:close-circle-linear" width={22} />
                        </button>
                    </div>
                    <ul className="flex-1 divide-y divide-line overflow-y-auto">
                        {venue.shows.map(({ event, dates }) => {
                            const next = [...dates].sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))[0];
                            return (
                                <li key={event.id}>
                                    <Link href={eventPath(event.id, event.title, next?.id)} className="flex gap-3 p-3 transition-colors hover:bg-canvas">
                                        {event.imageUrl
                                            // eslint-disable-next-line @next/next/no-img-element
                                            ? <img src={event.imageUrl} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-control object-cover" />
                                            : <span className="h-16 w-16 shrink-0 rounded-control bg-brand-mist" aria-hidden />}
                                        <span className="min-w-0 flex-1">
                                            <span className="line-clamp-2 text-label text-ink">{event.title}</span>
                                            {next && <span className="mt-0.5 block text-caption text-ink-soft">{when(next)}{dates.length > 1 ? ` · ${dates.length} fechas` : ''}</span>}
                                            {next && <span className="mt-0.5 block text-caption font-semibold text-brand">{formatPrice(next.price ?? undefined)}</span>}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </aside>
            )}
        </div>
    );
};

export default ResultsMap;
