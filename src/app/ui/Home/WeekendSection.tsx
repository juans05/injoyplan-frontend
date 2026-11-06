"use client";
import Link from 'next/link';
import dayjs from '@/app/utils/date';
import Card from '@/app/components/Card';
import CardSkeleton from '@/app/components/CardSkeleton';
import useEventList from '@/app/hooks/useEventList';
import { toggleFavorite } from '@/app/zustand/favorites';
import SectionHeader from './SectionHeader';
import { searchPath } from '@/app/utils/urls';

// Lima is UTC-5 all year: Saturday 00:00 local = 05:00Z
export function upcomingWeekend(now = dayjs().utcOffset(-5)) {
    const day = now.day(); // 0 = Sunday
    const saturday = day === 0 ? now.subtract(1, 'day') : now.add(6 - day, 'day');
    const start = day === 6 || day === 0 ? now : saturday; // already the weekend: from today
    const mondayStart = saturday.add(2, 'day').startOf('day');
    return {
        from: start.format('YYYY-MM-DD'),
        fromIso: `${start.format('YYYY-MM-DD')}T05:00:00.000Z`,
        toIso: `${mondayStart.format('YYYY-MM-DD')}T05:00:00.000Z`,
        // Inclusive last day for the search page URL
        to: saturday.add(1, 'day').format('YYYY-MM-DD'),
        label: `${saturday.format('D')} y ${saturday.add(1, 'day').format('D [de] MMMM')}`,
    };
}

const WeekendSection = () => {
    const w = upcomingWeekend();
    const { events, loading } = useEventList({ fechaInicio: w.fromIso, fechaFin: w.toIso, limit: '8', expandDates: 'false' });

    if (!loading && events.length === 0) return null;

    const range = { desde: w.from, hasta: w.to };

    return (
        <section className="section bg-canvas" aria-labelledby="weekend-title">
            <div className="container-page">
                <SectionHeader
                    id="weekend-title"
                    title="Qué hacer este fin de semana"
                    description={`Planes para el sábado y domingo, ${w.label}.`}
                    link={{ href: searchPath(range), label: 'Ver todo el fin de semana' }}
                />
                <div className="mb-6 flex flex-wrap gap-2">
                    <Link href={searchPath({ ...range, gratis: true })} className="chip">Gratis este fin de semana</Link>
                    <Link href={searchPath({ ...range, horario: 'noche' })} className="chip">Desde las 6 p. m.</Link>
                </div>
                <ul className="rail lg:grid lg:grid-cols-4 lg:gap-6">
                    {(loading ? Array.from({ length: 4 }) : events).map((item: any, i) => (
                        <li key={item ? `${item.idEventos}-${item.idfecha}` : i} className="w-[78vw] max-w-[300px] shrink-0 lg:w-auto lg:max-w-none">
                            {item ? <Card item={item} addFavoritesByUser={toggleFavorite} /> : <CardSkeleton />}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default WeekendSection;
