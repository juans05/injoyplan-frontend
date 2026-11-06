"use client";
import Link from 'next/link'
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import logo from '../../../../public/svg/injoyplan.svg'
import { useAuthStore } from '../../zustand/auth'
import { useEventStore } from '../../zustand/events'
import { useFavoriteStore } from '../../zustand/favorites'
import { useCategoriesState } from '../../zustand/categories'
import dayjs from '@/app/utils/date';
import Auth from '../Auth';
import useOutsideClick from '@/app/hooks/useOutsideClick';
import useDebounce from '@/app/hooks/useDebounce';
import usePublishEvent from '@/app/hooks/usePublishEvent';
import { getProfileAssets } from '@/app/utils/profileAssets';
import { track } from '@/app/utils/analytics';
import { eventPath, searchPath } from '@/app/utils/urls';

const RECENT_KEY = 'recentSearches';

const readRecent = (): string[] => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
};

const shortDate = (value?: string) =>
    value ? dayjs(value).utcOffset(-5).format('ddd D MMM').replace('.', '') : '';

/* ---------- Search ---------- */

// Results panel shared by the desktop dropdown and the mobile full-screen search
function SearchResults({ term, onPick }: { term: string; onPick: (term: string) => void }) {
    const { eventSearch } = useEventStore();
    const [recent, setRecent] = useState<string[]>([]);

    useEffect(() => { setRecent(readRecent()); }, [term]);

    if (term.length > 3) {
        if (eventSearch === null || eventSearch === undefined) {
            return <p className="px-4 py-6 text-label text-ink-soft">Buscando…</p>;
        }
        if (eventSearch.length === 0) {
            return (
                <div className="px-4 py-6">
                    <p className="text-body font-semibold text-ink">Sin resultados para “{term}”</p>
                    <p className="mt-1 text-label text-ink-soft">Prueba con el nombre del artista, del lugar o del distrito.</p>
                </div>
            );
        }
        return (
            <div>
                <ul className="py-2">
                    {eventSearch.slice(0, 8).map((item) => (
                        <li key={`${item.ideventos}-${item.idfecha}`}>
                            <Link
                                href={eventPath(item.ideventos, item.titulo, item.idfecha)}
                                onClick={() => onPick(item.titulo)}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-canvas"
                            >
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-control bg-brand-mist">
                                    {item.url && <Image src={item.url} alt="" fill sizes="48px" className="object-cover" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-label text-ink">{item.titulo}</p>
                                    <p className="truncate text-caption text-ink-soft">{item.NombreLocal}</p>
                                </div>
                                <span className="shrink-0 text-caption font-semibold capitalize text-brand">{shortDate(item.FechaInicio)}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <Link
                    href={searchPath({ q: term })}
                    onClick={() => onPick(term)}
                    className="block border-t border-line px-4 py-3 text-label text-brand hover:bg-canvas"
                >
                    Ver todos los resultados para “{term}”
                </Link>
            </div>
        );
    }

    if (recent.length === 0) {
        return <p className="px-4 py-6 text-label text-ink-soft">Escribe al menos 4 letras para buscar eventos o lugares.</p>;
    }
    return (
        <div className="py-2">
            <p className="px-4 pb-1 pt-2 text-caption font-semibold text-ink-soft">Búsquedas recientes</p>
            <ul>
                {recent.map((r) => (
                    <li key={r}>
                        <Link href={searchPath({ q: r })} onClick={() => onPick(r)} className="flex items-center gap-2 px-4 py-2 text-label font-medium text-ink hover:bg-canvas">
                            <Icon icon="solar:history-linear" width={16} className="text-brand-gray" aria-hidden />
                            {r}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function useHeaderSearch() {
    const router = useRouter();
    const { getEventBySearch, resetEventBySearch, getValueSearch } = useEventStore();
    const [term, setTerm] = useState('');
    const debounced = useDebounce(term, 400);

    useEffect(() => {
        if (debounced.length > 3) {
            useEventStore.setState({ eventSearch: null }); // "Buscando…" until results arrive
            getEventBySearch(debounced);
        } else {
            resetEventBySearch();
        }
    }, [debounced]);

    const remember = (value: string) => {
        if (!value) return;
        getValueSearch(value);
        track('search', { search_term: value });
        localStorage.setItem(RECENT_KEY, JSON.stringify([value, ...readRecent().filter((r) => r !== value)].slice(0, 8)));
        setTerm('');
    };

    const submit = () => {
        const value = term.trim();
        if (!value) return;
        remember(value);
        router.push(searchPath({ q: value }));
    };

    return { term, setTerm, remember, submit };
}

/* ---------- Favorites ---------- */

function FavoritesList({ onNavigate }: { onNavigate: () => void }) {
    const { favorites, deleteFavorite } = useFavoriteStore();
    const list: any[] = favorites ?? [];

    if (list.length === 0) {
        return (
            <div className="px-6 py-10 text-center">
                <Icon icon="solar:heart-linear" width={36} className="mx-auto text-brand-gray" aria-hidden />
                <p className="mt-3 text-body font-semibold text-ink">Aún no tienes favoritos</p>
                <p className="mt-1 text-label text-ink-soft">Toca el corazón de un evento para guardarlo aquí.</p>
            </div>
        );
    }

    return (
        <ul className="py-2">
            {list.map((item) => (
                <li key={item.idfavoritos ?? `${item.ideventos}-${item.idfecha}`} className="group relative">
                    <Link href={eventPath(item.ideventos, item.titulo, item.idfecha)} onClick={onNavigate} className="flex items-center gap-3 px-4 py-2.5 pr-12 hover:bg-canvas">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-control bg-brand-mist">
                            {item.url && <Image src={item.url} alt="" fill sizes="48px" className="object-cover" />}
                        </div>
                        <div className="min-w-0">
                            <p className="text-caption font-semibold capitalize text-brand">{shortDate(item.FechaInicio)}{item.HoraInicio ? `, ${item.HoraInicio}` : ''}</p>
                            <p className="truncate text-label text-ink">{item.titulo}</p>
                            <p className="truncate text-caption text-ink-soft">{item.NombreLocal}</p>
                        </div>
                    </Link>
                    <button
                        type="button"
                        onClick={() => deleteFavorite(item)}
                        aria-label={`Quitar ${item.titulo} de favoritos`}
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft hover:bg-white hover:text-brand-wine"
                    >
                        <Icon icon="solar:close-circle-linear" width={20} />
                    </button>
                </li>
            ))}
        </ul>
    );
}

/* ---------- Header ---------- */

const NAV = [
    { href: '/', label: 'Inicio' },
    { href: '/eventos', label: 'Explorar eventos' },
];

const Header = () => {
    const { auth, me, logout, authModal, openAuthModal, closeAuthModal } = useAuthStore();
    const { getFavorites, favorites } = useFavoriteStore();
    const { countsCategories, getCategoriesCount } = useCategoriesState();
    const router = useRouter();
    const path = usePathname() || '/';
    const publishEvent = usePublishEvent();
    const search = useHeaderSearch();

    const [isSearchOpen, setIsSearchOpen, searchRef] = useOutsideClick(false);
    const [isFavOpen, setIsFavOpen, favRef] = useOutsideClick(false);
    const [isUserOpen, setIsUserOpen, userRef] = useOutsideClick(false);
    const [isCatOpen, setIsCatOpen, catRef] = useOutsideClick(false);
    const [mobileSearch, setMobileSearch] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);

    useEffect(() => {
        me();
        getFavorites();
    }, []);

    // Friend-invite links (email/WhatsApp) land with ?invite=1 -> open registration
    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('invite') === '1' && !auth) openAuthModal(true);
    }, [auth]);

    // Close every overlay on navigation
    useEffect(() => {
        setMobileMenu(false);
        setMobileSearch(false);
        setIsFavOpen(false);
        setIsUserOpen(false);
        setIsCatOpen(false);
    }, [path]);

    // Lock page scroll behind full-screen mobile panels
    useEffect(() => {
        const locked = mobileMenu || mobileSearch;
        document.body.style.overflow = locked ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenu, mobileSearch]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            setMobileMenu(false); setMobileSearch(false); setIsFavOpen(false); setIsUserOpen(false); setIsCatOpen(false); setIsSearchOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const openCategories = () => {
        if (!countsCategories) getCategoriesCount();
        setIsCatOpen((v) => !v);
    };

    const logoutUser = () => {
        logout();
        useFavoriteStore.setState({ favorites: [] });
        setIsUserOpen(false);
        router.push('/');
    };

    if (path.startsWith('/admin')) return null;

    const showSearch = !path.startsWith('/eventos');
    const categories: any[] = (countsCategories || []).filter((c: any) => c.cantidad > 0);
    const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
    const favoritesCount = favorites?.length ?? 0;
    const { avatar } = getProfileAssets(auth?.profile as any);

    const userLinks = auth ? [
        { href: `/usuario/${auth.id}`, icon: 'solar:user-linear', label: 'Mi perfil' },
        { href: '/explorar', icon: 'solar:compass-linear', label: 'Comunidad' },
        { href: '/amigos', icon: 'solar:users-group-rounded-linear', label: 'Amigos' },
        { href: '/mensajes', icon: 'solar:chat-round-dots-linear', label: 'Mensajes' },
        ...(auth.userType === 'COMPANY' ? [{ href: '/mis-eventos', icon: 'solar:calendar-linear', label: 'Mis eventos' }] : []),
        { href: '/perfil/editar', icon: 'solar:settings-linear', label: 'Configuración' },
        ...(auth.role === 'ADMIN' ? [{ href: '/admin', icon: 'solar:widget-linear', label: 'Panel de administración' }] : []),
    ] : [];

    // Solid background on purpose: backdrop-filter would trap the fixed menu and search overlays inside the header
    return (
        <header className="sticky top-0 z-40 border-b border-line bg-white">
            <Auth
                openAuth={authModal.open}
                setOpenAuth={(open: boolean) => (open ? openAuthModal(authModal.register) : closeAuthModal())}
                isRegister={authModal.register}
                setIsRegister={(register: boolean) => openAuthModal(register)}
            />

            <div className="container-page flex h-16 items-center gap-3 lg:h-[72px] lg:gap-6">
                <Link href="/" className="shrink-0" aria-label="Injoyplan, ir al inicio">
                    <Image src={logo} alt="Injoyplan" priority className="h-auto w-[132px] lg:w-[150px]" />
                </Link>

                {/* Desktop navigation */}
                <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
                    {NAV.map((n) => (
                        <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? 'page' : undefined}
                            className={`rounded-control px-3 py-2 text-label transition-colors ${isActive(n.href) ? 'text-brand' : 'text-ink hover:text-brand'}`}>
                            {n.label}
                        </Link>
                    ))}
                    <div className="relative" ref={catRef}>
                        <button type="button" onClick={openCategories} aria-expanded={isCatOpen}
                            className="flex items-center gap-1 rounded-control px-3 py-2 text-label text-ink hover:text-brand">
                            Categorías
                            <Icon icon="solar:alt-arrow-down-linear" width={16} className={`transition-transform ${isCatOpen ? 'rotate-180' : ''}`} aria-hidden />
                        </button>
                        {isCatOpen && (
                            <div className="absolute left-0 top-full mt-2 w-72 rounded-card border border-line bg-white p-2 shadow-float">
                                {categories.length === 0 ? (
                                    <p className="px-3 py-4 text-label text-ink-soft">Cargando categorías…</p>
                                ) : categories.map((c) => (
                                    <Link key={c.idCategorias} href={searchPath({ categoria: c.nombreCategoria })}
                                        onClick={() => track('select_category', { category: c.nombreCategoria })}
                                        className="flex items-center justify-between rounded-control px-3 py-2.5 text-label text-ink hover:bg-canvas hover:text-brand">
                                        {c.nombreCategoria}
                                        <span className="text-caption text-ink-soft">{c.cantidad}</span>
                                    </Link>
                                ))}
                                <Link href="/eventos" className="mt-1 block border-t border-line px-3 pb-1 pt-3 text-label text-brand">Ver todos los eventos</Link>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Desktop search */}
                <div className="hidden flex-1 md:block">
                    {showSearch && (
                        <div className="relative mx-auto max-w-md" ref={searchRef}>
                            <form role="search" onSubmit={(e) => { e.preventDefault(); search.submit(); setIsSearchOpen(false); }}>
                                <label htmlFor="header-search" className="sr-only">Buscar eventos o lugares</label>
                                <Icon icon="solar:magnifer-linear" width={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray" aria-hidden />
                                <input
                                    id="header-search"
                                    type="search"
                                    autoComplete="off"
                                    value={search.term}
                                    onFocus={() => setIsSearchOpen(true)}
                                    onChange={(e) => { search.setTerm(e.target.value); setIsSearchOpen(true); }}
                                    placeholder="Busca un evento, artista o lugar"
                                    className="h-11 w-full rounded-full border border-line bg-canvas pl-11 pr-4 text-label font-medium text-ink placeholder:font-normal placeholder:text-brand-gray focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
                                />
                            </form>
                            {isSearchOpen && (
                                <div className="absolute left-0 right-0 top-full mt-2 max-h-[70vh] overflow-y-auto rounded-card border border-line bg-white shadow-float">
                                    <SearchResults term={search.term} onPick={(t) => { search.remember(t); setIsSearchOpen(false); }} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
                    {showSearch && (
                        <button type="button" onClick={() => setMobileSearch(true)} aria-label="Buscar"
                            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-canvas md:hidden">
                            <Icon icon="solar:magnifer-linear" width={22} />
                        </button>
                    )}

                    <button type="button" onClick={publishEvent} className="btn-ghost btn-sm hidden xl:inline-flex">
                        <Icon icon="solar:add-circle-linear" width={18} aria-hidden />
                        Publica tu evento
                    </button>

                    {/* Favorites */}
                    <div className="relative" ref={favRef}>
                        <button type="button" onClick={() => setIsFavOpen((v) => !v)} aria-expanded={isFavOpen}
                            aria-label={`Favoritos${favoritesCount ? ` (${favoritesCount})` : ''}`}
                            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isFavOpen ? 'bg-brand-mist text-brand-wine' : 'text-ink hover:bg-canvas'}`}>
                            <Icon icon={favoritesCount ? 'solar:heart-bold' : 'solar:heart-linear'} width={22} className={favoritesCount ? 'text-brand-wine' : ''} />
                            {favoritesCount > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-wine px-1 text-[10px] font-bold text-white">{favoritesCount}</span>
                            )}
                        </button>
                        {isFavOpen && (
                            <div className="fixed inset-x-3 top-[68px] max-h-[75vh] overflow-y-auto rounded-card border border-line bg-white shadow-float sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[380px]">
                                <p className="sticky top-0 border-b border-line bg-white px-4 py-3 text-body font-bold text-ink">Tus favoritos</p>
                                <FavoritesList onNavigate={() => setIsFavOpen(false)} />
                            </div>
                        )}
                    </div>

                    {/* Account */}
                    {auth ? (
                        <div className="relative" ref={userRef}>
                            <button type="button" onClick={() => setIsUserOpen((v) => !v)} aria-expanded={isUserOpen} aria-label="Menú de tu cuenta"
                                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-1 ring-line hover:ring-brand">
                                <img src={avatar} alt="" className="h-full w-full object-cover" />
                            </button>
                            {isUserOpen && (
                                <div className="absolute right-0 top-full mt-2 w-60 rounded-card border border-line bg-white py-2 shadow-float">
                                    <p className="truncate px-4 pb-2 pt-1 text-caption text-ink-soft">{auth.email}</p>
                                    {userLinks.map((l) => (
                                        <Link key={l.href} href={l.href} onClick={() => setIsUserOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-label font-medium text-ink hover:bg-canvas hover:text-brand">
                                            <Icon icon={l.icon} width={20} className="text-brand" aria-hidden />
                                            {l.label}
                                        </Link>
                                    ))}
                                    <button type="button" onClick={logoutUser}
                                        className="mt-1 flex w-full items-center gap-3 border-t border-line px-4 pb-1 pt-3 text-label font-medium text-brand-wine hover:bg-canvas">
                                        <Icon icon="solar:logout-2-linear" width={20} aria-hidden />
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button type="button" onClick={() => openAuthModal(false)} className="btn-primary btn-sm hidden sm:inline-flex">
                            Ingresar
                        </button>
                    )}

                    <button type="button" onClick={() => { if (!countsCategories) getCategoriesCount(); setMobileMenu(true); }} aria-label="Abrir menú" aria-expanded={mobileMenu}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-canvas lg:hidden">
                        <Icon icon="solar:hamburger-menu-linear" width={24} />
                    </button>
                </div>
            </div>

            {/* Mobile full-screen search */}
            {mobileSearch && (
                <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden" role="dialog" aria-modal="true" aria-label="Buscar eventos">
                    <form role="search" onSubmit={(e) => { e.preventDefault(); search.submit(); }} className="flex items-center gap-2 border-b border-line px-4 py-3">
                        <Icon icon="solar:magnifer-linear" width={20} className="text-brand-gray" aria-hidden />
                        <input autoFocus type="search" value={search.term} onChange={(e) => search.setTerm(e.target.value)}
                            placeholder="Busca un evento, artista o lugar" aria-label="Buscar eventos o lugares"
                            className="h-10 flex-1 bg-transparent text-body text-ink placeholder:text-brand-gray focus:outline-none" />
                        <button type="button" onClick={() => { setMobileSearch(false); search.setTerm(''); }} className="btn-ghost btn-sm">Cancelar</button>
                    </form>
                    <div className="flex-1 overflow-y-auto">
                        <SearchResults term={search.term} onPick={(t) => { search.remember(t); setMobileSearch(false); }} />
                    </div>
                </div>
            )}

            {/* Mobile / tablet menu */}
            {mobileMenu && (
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
                    <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Cerrar menú" onClick={() => setMobileMenu(false)} />
                    <div className="absolute right-0 top-0 flex h-full w-[min(88vw,360px)] flex-col overflow-y-auto bg-white">
                        <div className="flex h-16 items-center justify-between border-b border-line px-4">
                            <Image src={logo} alt="Injoyplan" className="h-auto w-[120px]" />
                            <button type="button" onClick={() => setMobileMenu(false)} aria-label="Cerrar menú" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-canvas">
                                <Icon icon="solar:close-circle-linear" width={24} />
                            </button>
                        </div>
                        <nav aria-label="Menú móvil" className="flex flex-col gap-1 p-4">
                            {NAV.map((n) => (
                                <Link key={n.href} href={n.href} className={`rounded-control px-3 py-3 text-body font-semibold ${isActive(n.href) ? 'bg-brand-mist text-brand-deep' : 'text-ink'}`}>{n.label}</Link>
                            ))}
                        </nav>
                        {categories.length > 0 && (
                            <div className="border-t border-line p-4">
                                <p className="mb-3 text-caption font-semibold text-ink-soft">Categorías</p>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((c) => (
                                        <Link key={c.idCategorias} href={searchPath({ categoria: c.nombreCategoria })} onClick={() => track('select_category', { category: c.nombreCategoria })} className="chip">{c.nombreCategoria}</Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mt-auto flex flex-col gap-2 border-t border-line p-4">
                            <button type="button" onClick={() => { setMobileMenu(false); publishEvent(); }} className="btn-secondary">
                                <Icon icon="solar:add-circle-linear" width={18} aria-hidden />
                                Publica tu evento
                            </button>
                            {!auth && (
                                <button type="button" onClick={() => { setMobileMenu(false); openAuthModal(false); }} className="btn-primary">Ingresar</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}

export default Header
