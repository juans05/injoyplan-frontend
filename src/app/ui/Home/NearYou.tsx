"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import Card from '@/app/components/Card';
import CardSkeleton from '@/app/components/CardSkeleton';
import useEventList from '@/app/hooks/useEventList';
import { toggleFavorite } from '@/app/zustand/favorites';
import { DISTRITOS_LIMA } from '@/app/data/distritos';
import { track } from '@/app/utils/analytics';
import SectionHeader from './SectionHeader';
import { searchPath } from '@/app/utils/urls';

const STORAGE_KEY = 'injoyplan:distrito';

// Location is chosen by hand: no geolocation prompt, and the choice is remembered on this device
const NearYou = () => {
    const [district, setDistrict] = useState('');
    const { events, loading } = useEventList(district ? { distrito: district, limit: '4', expandDates: 'false' } : null);

    useEffect(() => {
        try { setDistrict(localStorage.getItem(STORAGE_KEY) || ''); } catch { /* storage blocked */ }
    }, []);

    const choose = (value: string) => {
        setDistrict(value);
        track('select_district', { district: value });
        try { value ? localStorage.setItem(STORAGE_KEY, value) : localStorage.removeItem(STORAGE_KEY); } catch { /* storage blocked */ }
    };

    return (
        <section className="section" aria-labelledby="near-title">
            <div className="container-page">
                <SectionHeader
                    id="near-title"
                    title={district ? `Eventos en ${district}` : 'Eventos cerca de ti'}
                    description="Elige tu distrito para ver qué pasa cerca. Lo recordaremos en este dispositivo."
                    link={district ? { href: searchPath({ distrito: district }), label: `Ver todo en ${district}` } : undefined}
                />

                <div className="mb-6 max-w-xs">
                    <label htmlFor="near-district" className="field-label">Tu distrito</label>
                    <div className="relative">
                        <Icon icon="solar:map-point-linear" width={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand" aria-hidden />
                        <select id="near-district" value={district} onChange={(e) => choose(e.target.value)} className="field pl-11">
                            <option value="">Selecciona un distrito</option>
                            {DISTRITOS_LIMA.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                {!district ? null : loading ? (
                    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => <li key={i}><CardSkeleton /></li>)}
                    </ul>
                ) : events.length === 0 ? (
                    <div className="surface flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-body font-semibold text-ink">Por ahora no hay eventos publicados en {district}</p>
                            <p className="mt-1 text-label font-normal text-ink-soft">Prueba con un distrito cercano o revisa todos los eventos.</p>
                        </div>
                        <Link href="/eventos" className="btn-secondary">Ver todos los eventos</Link>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {events.map((item) => (
                            <li key={`${item.idEventos}-${item.idfecha}`}><Card item={item} addFavoritesByUser={toggleFavorite} /></li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
};

export default NearYou;
