"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useCategoriesState } from '@/app/zustand/categories';
import { track } from '@/app/utils/analytics';
import SectionHeader from './SectionHeader';
import { searchPath } from '@/app/utils/urls';

// Categories come from the backend (name, icon, live event count); empty ones are hidden
const CategoryRail = () => {
    const { countsCategories, isLoading } = useCategoriesState();
    const categories: any[] = (countsCategories || []).filter((c: any) => c.cantidad > 0);

    if (!isLoading && categories.length === 0) return null;

    return (
        <section className="section" aria-labelledby="cat-title">
            <div className="container-page">
                <SectionHeader id="cat-title" title="Explora por categoría" link={{ href: '/eventos', label: 'Ver todos los eventos' }} />
                <ul className="rail lg:grid lg:grid-cols-4 xl:grid-cols-5">
                    {isLoading && categories.length === 0
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <li key={i} className="h-[76px] w-[220px] shrink-0 animate-pulse rounded-card bg-line lg:w-auto" aria-hidden />
                        ))
                        : categories.map((c) => (
                            <li key={c.idCategorias} className="w-[220px] shrink-0 lg:w-auto">
                                <Link
                                    href={searchPath({ categoria: c.nombreCategoria })}
                                    onClick={() => track('select_category', { category: c.nombreCategoria })}
                                    className="group flex items-center gap-3 rounded-card border border-line bg-white p-3 transition-colors hover:border-brand"
                                >
                                    {/* Category icons are drawn for the brand's granate background */}
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-brand-wine">
                                        {c.iconos
                                            ? <Image src={c.iconos} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                                            : <Icon icon="solar:ticket-linear" width={26} className="text-white" aria-hidden />}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-body font-bold text-ink group-hover:text-brand">{c.nombreCategoria}</span>
                                        <span className="block text-caption text-ink-soft">{c.cantidad} {c.cantidad === 1 ? 'evento' : 'eventos'}</span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    {!isLoading && (
                        <li className="w-[220px] shrink-0 lg:w-auto">
                            <Link href="/eventos/gratis" onClick={() => track('select_category', { category: 'Gratis' })}
                                className="group flex items-center gap-3 rounded-card border border-line bg-white p-3 transition-colors hover:border-brand">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-brand-mist text-brand-deep">
                                    <Icon icon="solar:gift-linear" width={26} aria-hidden />
                                </span>
                                <span>
                                    <span className="block text-body font-bold text-ink group-hover:text-brand">Eventos gratuitos</span>
                                    <span className="block text-caption text-ink-soft">Planes sin costo de entrada</span>
                                </span>
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </section>
    );
};

export default CategoryRail;
