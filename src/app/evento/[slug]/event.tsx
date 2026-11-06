'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { searchPath } from '@/app/utils/urls';
import { Icon } from '@iconify/react';
import dayjs from '@/app/utils/date';
import { safeHtml } from '@/app/utils/safeHtml';
import { track } from '@/app/utils/analytics';
import { shareEvent } from '@/app/utils/share';
import { toggleFavorite } from '@/app/zustand/favorites';
import { formatPrice, isFavorite } from '@/app/components/Card';
import RelatedEvents from '@/app/ui/RelatedEvents';
import ModalDates from './ModalDate/ModalDates';

// mapbox-gl is heavy and browser-only: load it on demand
const Map = dynamic(() => import('@/app/components/Map'), { ssr: false });

const VISIBLE_DATES = 5;
const lima = (d?: string) => dayjs(d).utcOffset(-5);
const withProtocol = (url?: string) => (url ? (String(url).startsWith('http') ? String(url) : `https://${url}`) : '');
const venueName = (name?: string) => name?.replace(/\s*(S\/N|s\/n|\d+)$/i, '').trim();

function relativeDay(fecha?: string) {
    const diff = lima(fecha).startOf('day').diff(dayjs().utcOffset(-5).startOf('day'), 'days');
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    return diff > 0 ? `En ${diff} días` : '';
}

function ticketIcon(name = '') {
    const n = name.toLowerCase();
    if (n.includes('tiktok')) return 'ic:baseline-tiktok';
    if (n.includes('instagram')) return 'mdi:instagram';
    if (n.includes('facebook')) return 'mdi:facebook';
    if (n.includes('whatsapp')) return 'mdi:whatsapp';
    if (n.includes('web')) return 'mdi:web';
    return 'solar:ticket-linear';
}

type Ticket = { label: string; href: string; icon?: string; image?: string };

// Sales links from both sources; repeated names get a number ("Web 1", "Web 2")
function buildTickets(platforms: any[] = [], ticketUrls: { name: string; url: string }[] = []): Ticket[] {
    const fromPlatforms = platforms.map((p) => ({ label: p.nombrePlataforma, href: withProtocol(p.urlWebLugar), image: p.iconos }));
    const links = (Array.isArray(ticketUrls) ? ticketUrls : []).filter((l) => l?.url?.trim());
    const counts: Record<string, number> = {};
    links.forEach((l) => { counts[l.name] = (counts[l.name] || 0) + 1; });
    const seen: Record<string, number> = {};
    const fromUrls = links.map((l) => {
        seen[l.name] = (seen[l.name] || 0) + 1;
        // "-" or "#" means offline sales (e.g. at the box office): show it, but not as a link
        const offline = l.url === '-' || l.url === '#';
        return { label: counts[l.name] > 1 ? `${l.name} ${seen[l.name]}` : l.name, href: offline ? '' : withProtocol(l.url), icon: ticketIcon(l.name) };
    });
    return [...fromPlatforms, ...fromUrls];
}

const EventDate = ({ data, dataFecha, dataPlataformaVenta }: any) => {
    const router = useRouter();
    const pathname = usePathname();
    const idFecha = useSearchParams().get('fecha') || undefined;
    const [showModal, setShowModal] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);

    const event = data?.[0];
    const eventId = String(event?.idEventos || event?.ideventos || '');

    // Upcoming dates only, in Lima time (dates are stored at noon UTC)
    const dates = useMemo(() => {
        const today = dayjs().utcOffset(-5).startOf('day');
        return [...(dataFecha || [])]
            .filter((d: any) => lima(d.FechaInicio).startOf('day').isSameOrAfter(today))
            .sort((a: any, b: any) => new Date(a.FechaInicio).getTime() - new Date(b.FechaInicio).getTime());
    }, [dataFecha]);
    const current = dates.find((d: any) => d.idfecha === idFecha) || dates[0];

    useEffect(() => {
        if (!eventId) return;
        window.scrollTo(0, 0);
        track('view_event', { event_id: eventId, event_title: event?.titulo });
    }, [eventId]);

    if (!event) {
        return (
            <div className="container-page py-24 text-center">
                <Icon icon="solar:ticket-linear" width={48} className="mx-auto text-brand-gray" aria-hidden />
                <h1 className="mt-4 text-h3 font-bold text-ink">Este evento ya no está disponible</h1>
                <p className="mt-2 text-label font-normal text-ink-soft">Puede que haya terminado o que el organizador lo haya retirado.</p>
                <Link href={searchPath()} className="btn-primary mt-6">Explorar otros eventos</Link>
            </div>
        );
    }

    const saved = isFavorite(event);
    const tickets = buildTickets(dataPlataformaVenta, event?.ticketUrls);
    const source = withProtocol(event?.urlFuente || event?.websiteUrl);
    const venue = venueName(event?.NombreLocal);
    const address = [event?.direccion, event?.Distrito].filter(Boolean).join(', ');
    const price = Number(current?.Monto ?? event?.Monto);
    const time = [current?.HoraInicio, current?.HoraFinal].filter(Boolean).join(' – ');
    const onFavorite = () => {
        if (!saved) track('add_to_favorites', { event_id: eventId });
        toggleFavorite(event);
    };

    return (
        <div className="container-page pb-8 pt-6 md:pt-8">
            {showModal && <ModalDates setShowModal={setShowModal} showModal={showModal} dataFechaOrdenada={dates} />}

            <nav aria-label="Ruta de navegación" className="mb-5 text-label text-ink-soft">
                <Link href="/" className="hover:text-brand">Inicio</Link>
                <span className="mx-2" aria-hidden>/</span>
                <Link href={searchPath()} className="hover:text-brand">Explorar eventos</Link>
            </nav>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                {/* Header: image, title, actions */}
                <div className="lg:col-span-7 xl:col-span-8">
                    {event?.url && (
                        <div className="overflow-hidden rounded-panel bg-brand-mist">
                            {/* Main image is the LCP element: optimized and eager */}
                            <Image src={event.url} alt={event?.titulo || 'Evento'} width={1200} height={630} priority
                                sizes="(max-width: 1024px) 100vw, 60vw" className="h-auto max-h-[560px] w-full object-cover" />
                        </div>
                    )}
                    <h1 className="heading-1 mt-6 !text-h2">{event?.titulo}</h1>
                    <p className="mt-2 text-body font-medium text-ink-soft">
                        {current ? <>{lima(current.FechaInicio).format('dddd D [de] MMMM')}{relativeDay(current.FechaInicio) && <span className="ml-2 rounded-full bg-brand-mist px-2.5 py-0.5 text-caption font-semibold text-brand-deep">{relativeDay(current.FechaInicio)}</span>}</> : 'Fecha por confirmar'}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                        <button type="button" onClick={() => shareEvent(window.location.pathname, event?.titulo)} className="btn-secondary btn-sm">
                            <Icon icon="solar:share-linear" width={18} aria-hidden /> Compartir
                        </button>
                        <button type="button" onClick={onFavorite} aria-pressed={saved} className="btn-secondary btn-sm">
                            <Icon icon={saved ? 'solar:heart-bold' : 'solar:heart-linear'} width={18} className={saved ? 'text-brand-wine' : ''} aria-hidden />
                            {saved ? 'Guardado' : 'Guardar'}
                        </button>
                        {source && (
                            <a href={source} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm">
                                <Icon icon="solar:link-linear" width={18} aria-hidden /> Fuente original
                            </a>
                        )}
                    </div>
                </div>

                {/* Booking panel: right column on desktop, right after the title on mobile */}
                <aside className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 xl:col-span-4 xl:col-start-9">
                    <div className="surface space-y-6 p-5 sm:p-6 lg:sticky lg:top-24">
                        <div>
                            <p className="text-caption font-semibold text-ink-soft">{price > 0 ? 'Entradas desde' : 'Entrada'}</p>
                            <p className="text-3xl font-extrabold text-ink">{formatPrice(price)}</p>
                        </div>

                        <div>
                            <h2 className="text-label font-bold text-ink">Fecha y hora</h2>
                            <p className="mt-1 text-body text-ink-soft">
                                {current ? `${lima(current.FechaInicio).format('dddd D [de] MMMM [de] YYYY')}${time ? `, ${time}` : ''}` : 'Por confirmar'}
                            </p>
                            {dates.length > 1 && (
                                <>
                                    <p className="mt-4 text-label font-bold text-ink">Otras fechas</p>
                                    <ul className="mt-2 flex flex-wrap gap-2">
                                        {dates.slice(0, VISIBLE_DATES).map((d: any) => {
                                            const on = d.idfecha === current?.idfecha;
                                            return (
                                                <li key={d.idfecha}>
                                                    <button type="button" aria-pressed={on} onClick={() => router.replace(`${pathname}?fecha=${d.idfecha}`, { scroll: false })}
                                                        className={`flex h-16 w-16 flex-col items-center justify-center rounded-control border text-center leading-none transition-colors ${on ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink hover:border-brand'}`}>
                                                        <span className="text-lg font-extrabold">{lima(d.FechaInicio).format('D')}</span>
                                                        <span className={`mt-1 text-caption font-semibold ${on ? 'text-white/85' : 'text-brand'}`}>{lima(d.FechaInicio).format('MMM')}</span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    {dates.length > VISIBLE_DATES && (
                                        <button type="button" onClick={() => setShowModal(true)} className="mt-1 py-2.5 text-label font-semibold text-brand hover:text-brand-deep">
                                            Ver las {dates.length} fechas
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {(venue || address) && (
                            <div>
                                <h2 className="text-label font-bold text-ink">Lugar</h2>
                                {venue && <p className="mt-1 break-words text-body text-ink">{venue}</p>}
                                {address && <p className="break-words text-label font-normal text-ink-soft">{address}</p>}
                                {event?.latitud_longitud && (
                                    <button type="button" onClick={() => mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                        className="inline-flex items-center gap-1 py-2.5 text-label font-semibold text-brand hover:text-brand-deep">
                                        <Icon icon="solar:map-point-linear" width={16} aria-hidden /> Ver en el mapa
                                    </button>
                                )}
                            </div>
                        )}

                        {tickets.length > 0 && (
                            <div>
                                <h2 className="text-label font-bold text-ink">Consigue tus entradas</h2>
                                <ul className="mt-3 space-y-2">
                                    {tickets.map((t, i) => (
                                        <li key={`${t.label}-${i}`}>
                                            {t.href ? (
                                                <a href={t.href} target="_blank" rel="noopener noreferrer"
                                                    onClick={() => track('ticket_click', { event_id: eventId, platform: t.label })}
                                                    className="btn btn-lg w-full bg-brand-wine text-white hover:bg-[#6d191b]">
                                                    {t.image ? <Image src={t.image} alt="" width={20} height={20} /> : <Icon icon={t.icon || 'solar:ticket-linear'} width={20} aria-hidden />}
                                                    {t.label}
                                                </a>
                                            ) : (
                                                <p className="flex min-h-[48px] items-center justify-center gap-2 rounded-control border border-line px-4 text-body font-semibold text-ink">
                                                    <Icon icon={t.icon || 'solar:ticket-linear'} width={20} aria-hidden /> {t.label}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Description and map */}
                <div className="lg:col-span-7 xl:col-span-8">
                    {event?.descripcionEvento && (
                        <section aria-labelledby="about-title">
                            <h2 id="about-title" className="heading-3">Te contamos</h2>
                            <div className="prose-event mt-3 text-body text-ink">{safeHtml(event.descripcionEvento)}</div>
                        </section>
                    )}
                    {event?.latitud_longitud && (
                        <section aria-labelledby="map-title" className="mt-10" ref={mapRef}>
                            <h2 id="map-title" className="heading-3">Cómo llegar</h2>
                            {address && <p className="mt-1 text-label font-normal text-ink-soft">{address}</p>}
                            <div className="mt-4 overflow-hidden rounded-panel">
                                <Map location={event.latitud_longitud} />
                            </div>
                        </section>
                    )}
                </div>
            </div>

            <RelatedEvents eventId={eventId} />
        </div>
    );
};

export default EventDate;
