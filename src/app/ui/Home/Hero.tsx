"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import dayjs from '@/app/utils/date';
import { useEventStore } from '@/app/zustand/events';
import { useCategoriesState } from '@/app/zustand/categories';
import { DISTRITOS_LIMA } from '@/app/data/distritos';
import { track } from '@/app/utils/analytics';
import { eventHref } from '@/app/components/Card';
import { searchPath } from '@/app/utils/urls';

/* ---------- Search panel: builds the same URLs the search page already understands ---------- */

function HeroSearch() {
    const router = useRouter();
    const { countsCategories } = useCategoriesState();
    const categories: any[] = (countsCategories || []).filter((c: any) => c.cantidad > 0);
    const [form, setForm] = useState({ q: '', category: '', district: '', date: '' });
    const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const q = form.q.trim();
        const categoria = categories.find((c) => String(c.idCategorias) === form.category)?.nombreCategoria;
        if (q) track('search', { search_term: q });
        router.push(searchPath({ categoria, distrito: form.district || undefined, desde: form.date || undefined, q: q || undefined }));
    };

    return (
        <form onSubmit={submit} role="search" aria-label="Buscar eventos" className="surface mt-8 p-3 shadow-float sm:p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label htmlFor="hero-q" className="field-label">Qué quieres hacer</label>
                    <div className="relative">
                        <Icon icon="solar:magnifer-linear" width={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray" aria-hidden />
                        <input id="hero-q" type="search" value={form.q} onChange={set('q')} placeholder="Concierto, feria, obra de teatro…" className="field pl-11" />
                    </div>
                </div>
                <div>
                    <label htmlFor="hero-cat" className="field-label">Categoría</label>
                    <select id="hero-cat" value={form.category} onChange={set('category')} className="field">
                        <option value="">Todas</option>
                        {categories.map((c) => <option key={c.idCategorias} value={c.idCategorias}>{c.nombreCategoria}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="hero-district" className="field-label">Distrito</label>
                    <select id="hero-district" value={form.district} onChange={set('district')} className="field">
                        <option value="">Todos</option>
                        {DISTRITOS_LIMA.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="hero-date" className="field-label">Desde el día</label>
                    <input id="hero-date" type="date" min={dayjs().format('YYYY-MM-DD')} value={form.date} onChange={set('date')} className="field" />
                </div>
                <div className="flex items-end">
                    <button type="submit" className="btn-primary btn-lg w-full">Explorar eventos</button>
                </div>
            </div>
        </form>
    );
}

/* ---------- Banner carousel: events the admin marks as banner ---------- */

function BannerCarousel() {
    const { bannerEvents, getBannerEvents } = useEventStore();
    const [loaded, setLoaded] = useState(false);
    const [index, setIndex] = useState(0);
    const paused = useRef(false);

    useEffect(() => {
        Promise.resolve(getBannerEvents()).finally(() => setLoaded(true));
    }, []);

    const count = bannerEvents?.length ?? 0;

    useEffect(() => {
        if (count < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const id = setInterval(() => { if (!paused.current) setIndex((i) => (i + 1) % count); }, 6000);
        return () => clearInterval(id);
    }, [count]);

    if (!loaded && count === 0) {
        return <div className="aspect-[4/3] w-full animate-pulse rounded-panel bg-line lg:aspect-auto lg:h-full" aria-hidden />;
    }

    // No banners configured: invite organizers instead of showing an empty frame
    if (count === 0) {
        return (
            <div className="flex aspect-[4/3] w-full flex-col items-start justify-end rounded-panel bg-brand-wine p-8 text-white lg:aspect-auto lg:h-full">
                <Icon icon="solar:star-shine-linear" width={40} aria-hidden />
                <p className="mt-4 text-2xl font-extrabold leading-tight md:text-3xl">¿Tienes un evento? Destácalo en este espacio.</p>
                <Link href="/contactanos" className="btn mt-6 bg-white text-brand-wine hover:bg-brand-mist">Escríbenos</Link>
            </div>
        );
    }

    const current = bannerEvents[index % count];
    const date = current?.FechaInicio ? dayjs(current.FechaInicio).utcOffset(-5) : null;

    return (
        <section
            aria-roledescription="carrusel"
            aria-label="Eventos destacados en portada"
            className="relative aspect-[4/3] w-full overflow-hidden rounded-panel bg-ink lg:aspect-auto lg:h-full lg:min-h-[480px]"
            onMouseEnter={() => { paused.current = true; }}
            onMouseLeave={() => { paused.current = false; }}
            onFocus={() => { paused.current = true; }}
            onBlur={() => { paused.current = false; }}
        >
            {bannerEvents.map((item, i) => (
                <div key={`${item.idEventos}-${item.idfecha}`} aria-hidden={i !== index}
                    className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}>
                    {item.url && (
                        <Image src={item.url} alt={item.titulo} fill priority={i === 0} sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" />
                    )}
                </div>
            ))}
            {/* Legibility gradient only behind the caption */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden />

            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7" aria-live="polite">
                {date && <p className="text-label font-semibold text-white/85">{date.format('dddd D [de] MMMM')}{current.HoraInicio ? `, ${current.HoraInicio}` : ''}</p>}
                <p className="mt-1 line-clamp-2 max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">{current.titulo}</p>
                {current.NombreLocal && <p className="mt-1 truncate text-label font-medium text-white/80">{current.NombreLocal}</p>}
                <div className="mt-4 flex items-center justify-between gap-4">
                    <Link href={eventHref(current)} className="btn bg-white text-ink hover:bg-brand-mist">Ver evento</Link>
                    {count > 1 && (
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setIndex((index - 1 + count) % count)} aria-label="Banner anterior"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur hover:bg-white/30">
                                <Icon icon="solar:alt-arrow-left-linear" width={20} />
                            </button>
                            <span className="min-w-[3ch] text-center text-label tabular-nums text-white/85">{index + 1}/{count}</span>
                            <button type="button" onClick={() => setIndex((index + 1) % count)} aria-label="Banner siguiente"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur hover:bg-white/30">
                                <Icon icon="solar:alt-arrow-right-linear" width={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

const Hero = () => (
    <section className="bg-canvas">
        <div className="container-page grid gap-8 py-8 md:py-12 lg:grid-cols-12 lg:gap-12 lg:py-14">
            <div className="flex flex-col justify-center lg:col-span-5">
                <h1 className="heading-1">Descubre experiencias que hacen especial cada momento</h1>
                <p className="mt-4 max-w-lg text-lead text-ink-soft">
                    Encuentra eventos, actividades y experiencias para disfrutar, compartir y vivir algo diferente.
                </p>
                <HeroSearch />
            </div>
            <div className="lg:col-span-7">
                <BannerCarousel />
            </div>
        </div>
    </section>
);

export default Hero;
