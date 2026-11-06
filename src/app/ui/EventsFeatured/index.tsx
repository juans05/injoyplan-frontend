"use client";
import { useEventStore } from '../../zustand/events'
import { toggleFavorite } from '../../zustand/favorites'
import Card from '@/app/components/Card'
import CardSkeleton from '@/app/components/CardSkeleton'
import SectionHeader from '../Home/SectionHeader'

// Events the admin marks as featured. The first one gets a larger card.
const EventsFeatured = () => {
    const { eventsDestacades, isLoading } = useEventStore();

    if (!isLoading && !eventsDestacades?.length) return null;
    const loading = isLoading && !eventsDestacades?.length;

    return (
        <section className="section" aria-labelledby="featured-title">
            <div className="container-page">
                <SectionHeader id="featured-title" title="Eventos destacados" description="Una selección de lo que no te puedes perder." />
                <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                    {loading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <li key={i} className={i === 0 ? 'sm:col-span-2 lg:row-span-2' : ''}><CardSkeleton /></li>
                        ))
                        : eventsDestacades.map((item, i) => (
                            <li key={`${item.idEventos}-${item.idfecha}`} className={i === 0 ? 'sm:col-span-2 lg:row-span-2' : ''}>
                                <Card item={item} addFavoritesByUser={toggleFavorite} featured={i === 0} />
                            </li>
                        ))}
                </ul>
            </div>
        </section>
    )
}

export default EventsFeatured
