"use client";
import { Dispatch, SetStateAction, useState } from 'react'
import Link from 'next/link'
import { useEventStore } from '../../zustand/events'
import { toggleFavorite } from '../../zustand/favorites'
import Card from '@/app/components/Card'
import CardSkeleton from '@/app/components/CardSkeleton'
import SectionHeader from '../Home/SectionHeader'

// After a few "load more" clicks we hand off to the full search page with filters
const MAX_INLINE_PAGES = 3;

const Events = ({ setPage }: { setPage: Dispatch<SetStateAction<number>> }) => {
    const { events, isLoading } = useEventStore();
    const [pagesLoaded, setPagesLoaded] = useState(1);

    const loadMore = () => {
        setPagesLoaded((p) => p + 1);
        setPage((p) => p + 1);
    };

    return (
        <section className="section" aria-labelledby="foryou-title">
            <div className="container-page">
                <SectionHeader id="foryou-title" title="Más planes para ti" link={{ href: '/eventos', label: 'Buscar con filtros' }} />

                {!isLoading && events.length === 0 ? (
                    <div className="surface p-8 text-center">
                        <p className="text-body font-semibold text-ink">No hay eventos publicados en este momento</p>
                        <p className="mt-1 text-label font-normal text-ink-soft">Vuelve pronto o revisa los eventos destacados.</p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {events.map((item) => (
                            <li key={`${item.idEventos}-${item.idfecha}`}><Card item={item} addFavoritesByUser={toggleFavorite} /></li>
                        ))}
                        {isLoading && Array.from({ length: 4 }).map((_, i) => <li key={`sk-${i}`}><CardSkeleton /></li>)}
                    </ul>
                )}

                {events.length > 0 && (
                    <div className="mt-12 flex justify-center">
                        {pagesLoaded >= MAX_INLINE_PAGES ? (
                            <Link href="/eventos" className="btn-secondary btn-lg">Ver todos con filtros</Link>
                        ) : (
                            <button type="button" onClick={loadMore} disabled={isLoading} className="btn-secondary btn-lg">
                                {isLoading ? 'Cargando…' : 'Ver más planes'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}

export default Events
