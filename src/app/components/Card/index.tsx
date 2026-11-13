import Image from "next/image";
import Link from "next/link";
import ImagePeek from '@/app/components/ImagePeek';
import { Icon } from "@iconify/react";
import { useRef, useEffect } from "react";
import dayjs from '@/app/utils/date';
import { Event } from "@/app/interfaces/event";
import { track } from "@/app/utils/analytics";
import { shareEvent } from "@/app/utils/share";
import { eventPath } from '@/app/utils/urls';

interface IProps {
    item: Event
    height?: number
    addFavoritesByUser: (event: Event) => void
    heartDisabled?: boolean
    isDragging?: boolean
    // Larger layout for the lead card of a section
    featured?: boolean
}

export const isFavorite = (item: Event) => Boolean(item?.favorito) || item?.esfavorito === 1;

export const eventHref = (item: Event) => eventPath(item?.idEventos || item?.ideventos, item?.titulo, item?.idfecha);

export const formatPrice = (monto?: number | string) =>
    Number(monto) > 0 ? `S/ ${Number(monto).toFixed(2)}` : 'Gratis';

// Trailing street numbers / "S/N" are noise in a card
const venueName = (name?: string) => name?.replace(/\s*(S\/N|s\/n|\d+)$/i, '').trim();

const sourceHref = (url?: string) => (url ? (url.startsWith('http') ? url : `https://${url}`) : '');

const Card = ({ item, addFavoritesByUser, heartDisabled, isDragging, featured }: IProps) => {
    const wasDraggingRef = useRef(false);

    // Carousels: a drag must not count as a click on the card
    useEffect(() => {
        if (isDragging) {
            wasDraggingRef.current = true;
        } else if (wasDraggingRef.current) {
            const timer = setTimeout(() => { wasDraggingRef.current = false; }, 100);
            return () => clearTimeout(timer);
        }
    }, [isDragging]);

    const date = item?.FechaInicio ? dayjs(item.FechaInicio).utcOffset(-5) : null;
    const saved = isFavorite(item);
    const time = [item?.HoraInicio, item?.HoraFinal].filter(Boolean).join(' – ');
    const source = sourceHref(item?.urlFuente);

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!saved) track('add_to_favorites', { event_id: item?.idEventos || item?.ideventos });
        addFavoritesByUser(item);
    };

    return (
        <article className="group relative flex h-full w-full flex-col">
            <Link
                href={eventHref(item)}
                onClick={(e) => {
                    if (isDragging || wasDraggingRef.current) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }}
                className="flex h-full flex-col rounded-card focus-visible:ring-offset-4"
            >
                <ImagePeek src={item?.url} alt={item.titulo || 'Evento'} className={`relative w-full overflow-hidden rounded-card bg-brand-mist ${featured ? 'aspect-[4/3] md:aspect-[16/10] lg:aspect-auto lg:min-h-[320px] lg:flex-1' : 'aspect-[4/3]'}`}>
                    {item?.url ? (
                        <Image
                            src={item.url.trim()}
                            alt={item.titulo || 'Evento'}
                            fill
                            sizes={featured ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'}
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                    ) : (
                        // No photo from the organizer: neutral brand placeholder, never a stock image
                        <div className="flex h-full w-full items-center justify-center text-brand/40">
                            <Icon icon="solar:ticket-linear" width={48} aria-hidden />
                        </div>
                    )}

                    {/* Ticket stub: the date is the first thing people scan for */}
                    {date && (
                        <div className="absolute bottom-3 left-3 flex min-w-[52px] flex-col items-center rounded-control bg-white px-2.5 py-1.5 text-center leading-none">
                            <span className="text-[1.375rem] font-extrabold text-ink">{date.format('D')}</span>
                            <span className="mt-0.5 text-caption font-semibold text-brand">{date.format('MMM')}</span>
                        </div>
                    )}

                    {item?.Destacado === 1 && (
                        <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-caption font-semibold text-white">
                            Destacado
                        </span>
                    )}
                </ImagePeek>

                <div className={`flex flex-col pt-3 ${featured ? 'lg:flex-none' : 'flex-1'}`}>
                    <p className="text-caption font-medium text-ink-soft">
                        {date ? date.format('dddd') : ''}{time ? `, ${time}` : ''}
                    </p>
                    <h3 className={`mt-1 line-clamp-2 font-bold text-ink transition-colors group-hover:text-brand ${featured ? 'text-xl md:text-2xl' : 'text-h3'}`}>
                        {item?.titulo}
                    </h3>
                    {venueName(item?.NombreLocal) && (
                        <p className="mt-1.5 flex items-center gap-1 text-label font-medium text-ink-soft">
                            <Icon icon="solar:map-point-linear" width={16} className="shrink-0 text-brand-gray" aria-hidden />
                            <span className="truncate">{venueName(item?.NombreLocal)}</span>
                        </p>
                    )}
                    <p className="mt-auto pt-3 text-body font-bold text-ink">
                        {Number(item?.Monto) > 0 && <span className="mr-1 text-caption font-medium text-ink-soft">Desde</span>}
                        {formatPrice(item?.Monto)}
                    </p>
                </div>
            </Link>

            {!heartDisabled && (
                <button
                    type="button"
                    onClick={toggleFavorite}
                    aria-pressed={saved}
                    aria-label={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink backdrop-blur transition-colors hover:text-brand-wine"
                >
                    <Icon icon={saved ? 'solar:heart-bold' : 'solar:heart-linear'} width={20} className={saved ? 'text-brand-wine' : ''} />
                </button>
            )}

            <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); shareEvent(eventHref(item), item?.titulo); }}
                aria-label="Compartir evento"
                className={`absolute right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink backdrop-blur transition-colors hover:text-brand ${heartDisabled ? 'top-3' : 'top-14'}`}
            >
                <Icon icon="solar:share-linear" width={19} />
            </button>

            {source && (
                <a
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 w-fit text-caption font-medium text-brand-gray hover:text-brand"
                >
                    Ver fuente original
                </a>
            )}
        </article>
    );
}

export default Card;
