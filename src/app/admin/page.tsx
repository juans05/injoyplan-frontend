'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useAuthStore } from '../zustand/auth';
import useAlertStore from '../zustand/alert';
import useDebounce from '../hooks/useDebounce';
import { get, post, patch, del, postFormData, isApiError } from '../utils/fetch';
import { SidebarItem, StatCard, BarChartMock, ConfirmModal } from './components';
import { BannerModal } from './BannerModal';
import { EventModal } from './EventModal';

export default function AdminPage() {
    const router = useRouter();
    const { auth, me, logout } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [eventsTotal, setEventsTotal] = useState(0);
    const [eventsPage, setEventsPage] = useState(1);
    const [eventsViewMode, setEventsViewMode] = useState<'cards' | 'table'>('cards');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'standard'>('all');
    const [categories, setCategories] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'banners' | 'events'>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<any>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const mainRef = useRef<HTMLDivElement>(null);

    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    // Auth check: the backend AdminGuard is the real protection, this only avoids showing the panel
    useEffect(() => {
        me().then(() => {
            if (useAuthStore.getState().auth?.role !== 'ADMIN') router.replace('/iniciar-sesion-admin');
        });
    }, []);

    useEffect(() => {
        if (auth?.role === 'ADMIN') {
            setLoading(false);
            fetchData();
        }
    }, [auth]);

    // Refetch when filters change
    useEffect(() => {
        if (!loading && auth && auth.role === 'ADMIN') {
            fetchEvents(1);
        }
    }, [filterStatus, filterFeatured, debouncedSearch]);

    const notify = useAlertStore((st) => st.alert);
    const askConfirm = (title: string, message: string, onConfirm: () => Promise<void> | void) =>
        setConfirmModal({ isOpen: true, title, message, onConfirm: async () => { await onConfirm(); closeConfirm(); } });
    const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    const handleDeleteAllEvents = async () => {
        const resp = await del('events/all');
        if (isApiError(resp)) return notify('No se pudieron eliminar los eventos', 'error');
        fetchData(); // Reloads stats and events
    };

    const openConfirmDeleteAll = () => askConfirm(
        '¿Estás seguro?',
        'Esta acción ELIMINARÁ TODOS los eventos de la base de datos permanentemente. Se recomienda tener un respaldo.',
        handleDeleteAllEvents
    );

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, bannersRes, categoriesRes] = await Promise.all([
                get<any>('admin/stats'),
                get<any>('admin/users?limit=10'),
                get<any>('admin/banners'),
                get<any>('events/stats/by-category').catch(() => []),
            ]);
            setStats(statsRes);
            setUsers(usersRes.users || []);
            setBanners(Array.isArray(bannersRes) ? bannersRes : []);
            const catsArray = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes?.data || categoriesRes?.categories || []);
            const cats = catsArray.map((c: any) => c?.nombreCategoria || c?.name || c?.category || '').filter(Boolean);
            setCategories(cats.length > 0 ? cats : ['Conciertos', 'Teatro', 'Ferias', 'Deportes', 'Gastronomía']);
            await fetchEvents(1);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchEvents = async (page: number) => {
        try {
            let url = `events?limit=24&page=${page}&status=${filterStatus}`;
            if (filterFeatured === 'featured') url += `&isFeatured=true`;
            if (filterFeatured === 'standard') url += `&isFeatured=false`;
            if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;

            const eventsRes = await get<any>(url);
            const list = Array.isArray(eventsRes?.data) ? eventsRes.data : Array.isArray(eventsRes?.events) ? eventsRes.events : Array.isArray(eventsRes) ? eventsRes : [];
            setEvents(list);
            setEventsTotal(eventsRes?.total || list.length || 0);
            setEventsPage(page);
            mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            console.error(e);
        }
    };

    const toggleUserRole = async (userId: string, currentRole: string) => {
        await patch(`admin/users/${userId}/role`, { role: currentRole === 'ADMIN' ? 'USER' : 'ADMIN' });
        fetchData();
    };

    const toggleBannerActive = async (bannerId: string, isActive: boolean) => {
        await patch(`admin/banners/${bannerId}`, { isActive: !isActive });
        fetchData();
    };

    const deleteBanner = (bannerId: string) => askConfirm(
        '¿Eliminar Banner?',
        'Esta acción no se puede deshacer. El banner dejará de ser visible para los usuarios.',
        async () => { await del(`admin/banners/${bannerId}`); fetchData(); }
    );

    const toggleEventStatus = async (eventId: string) => {
        await patch(`events/${eventId}/toggle-status`, {});
        fetchEvents(eventsPage);
    };

    const deleteEvent = (eventId: string) => askConfirm(
        '¿Eliminar evento?',
        'Esta acción no se puede deshacer.',
        async () => { await del(`events/${eventId}`); fetchEvents(eventsPage); }
    );

    const handleSaveBanner = async (data: any, file: File | null) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) formData.append(key, data[key]);
        });
        if (file) formData.append('file', file);

        try {
            const resp: any = editingBanner
                ? await postFormData(`admin/banners/${editingBanner.id}`, formData, 'PATCH')
                : await postFormData('admin/banners', formData);
            if (isApiError(resp)) return notify(`Error al guardar banner: ${resp.message || 'Desconocido'}`, 'error');
            setIsModalOpen(false);
            setEditingBanner(null);
            fetchData();
        } catch (e) {
            console.error(e);
            notify('Error al guardar banner', 'error');
        }
    };

    const handleImportEvents = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const resp: any = await postFormData('admin/events/import', formData);
            if (isApiError(resp)) return notify(`Error: ${resp.message || 'No se pudo importar'}`, 'error');
            notify(`Importados ${resp.count || 0} eventos`, 'success');
            fetchEvents(1);
        } catch {
            notify('Error al subir archivo', 'error');
        }
    };

    const openEditModal = (banner: any) => {
        setEditingBanner(banner);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingBanner(null);
        setIsModalOpen(true);
    };


    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 text-[#277FA4]">Cargando panel...</div>;
    const user = auth;

    return (
        <div className="flex h-screen bg-[#F0F4F8] font-sans">

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:static lg:shadow-none border-r border-slate-100 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-8 pb-4 flex items-center justify-center border-b border-gray-100/50">
                        <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-800 font-black text-2xl uppercase tracking-wider">INJOY<span className="text-[#277FA4]">PLAN</span></span>
                            </div>
                        </Link>
                    </div>

                    <div className="p-4 mt-4 space-y-2 flex-1">
                        <SidebarItem
                            icon="solar:home-smile-bold"
                            label="Dashboard"
                            active={activeTab === 'dashboard'}
                            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
                        />
                        <SidebarItem
                            icon="solar:users-group-rounded-bold"
                            label="Usuarios"
                            active={activeTab === 'users'}
                            onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
                        />

                        <SidebarItem
                            icon="solar:calendar-bold"
                            label="Eventos"
                            active={activeTab === 'events'}
                            onClick={() => { setActiveTab('events'); setIsSidebarOpen(false); }}
                        />
                    </div>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={() => {
                                logout();
                                router.push('/');
                            }}
                            className="w-full flex items-center gap-4 px-4 py-3 text-[#E31A1A] hover:bg-red-50 rounded-xl transition-colors font-medium"
                        >
                            <Icon icon="solar:logout-2-bold" width={24} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>


                </div>
            </aside>

            {isSidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

            {/* Main Content */}
            <main ref={mainRef} className="flex-1 overflow-y-auto h-full p-4 md:p-8 relative">

                {/* Topbar */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white/50 backdrop-blur-sm p-4 rounded-[20px] sticky top-2 z-30">
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Pages / <span className="text-[#277FA4]">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span></p>
                        <h1 className="text-slate-800 text-3xl font-bold mt-1">
                            {activeTab === 'dashboard' ? 'Main Dashboard' : activeTab === 'users' ? 'Gestión de Usuarios' : activeTab === 'banners' ? 'Gestión de Banners' : 'Gestión de Eventos'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-full shadow-sm border border-slate-100">
                        <div className="flex items-center bg-slate-50 rounded-full px-4 py-2">
                            <Icon icon="solar:magnifer-linear" className="text-[#277FA4]" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm text-slate-600 ml-2 w-24 md:w-32"
                            />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#277FA4] text-white flex items-center justify-center font-bold overflow-hidden">
                            {user?.profile?.avatar ? <img loading="lazy" src={user.profile.avatar} className="w-full h-full object-cover" /> : (user?.profile?.firstName?.[0] || 'A')}
                        </div>
                        <button className="lg:hidden text-slate-800 ml-2" onClick={() => setIsSidebarOpen(true)}>
                            <Icon icon="solar:hamburger-menu-linear" width={24} />
                        </button>
                    </div>
                </header>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && stats && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <StatCard icon="solar:users-group-rounded-bold" title="Total Usuarios" value={stats.totalUsers} subtitle="desde el mes pasado" trend="up" />
                            <StatCard icon="solar:calendar-bold" title="Eventos Totales" value={stats.totalEvents} subtitle="activos en plataforma" />
                            <StatCard icon="solar:check-circle-bold" title="Verificados" value={stats.verifiedUsers} subtitle="usuarios de confianza" trend="up" />
                            <StatCard icon="solar:gallery-wide-bold" title="Banners Activos" value={stats.activeBanners} subtitle="visualizándose ahora" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <div className="bg-white p-6 rounded-[20px] shadow-[0px_18px_40px_rgba(112,144,176,0.12)]">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-slate-800 text-xl font-bold">Actividad de Usuarios</h3>
                                        <p className="text-[#05CD99] text-sm font-bold mt-1 flex items-center gap-1"><Icon icon="solar:arrow-up-linear" /> (+23) nuevos esta semana</p>
                                    </div>
                                </div>
                                <BarChartMock />
                            </div>

                            <div className="bg-white p-6 rounded-[20px] shadow-[0px_18px_40px_rgba(112,144,176,0.12)]">
                                <h3 className="text-slate-800 text-xl font-bold mb-6">Resumen de Eventos</h3>
                                <div className="flex items-center justify-center py-4">
                                    <div className="relative w-48 h-48 rounded-full border-[16px] border-[#F4F7FE] flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full border-[16px] border-[#4318FF] border-t-transparent border-l-transparent rotate-45"></div>
                                        <div className="text-center">
                                            <p className="text-slate-400 text-sm">Total</p>
                                            <h4 className="text-slate-800 text-2xl font-bold">{stats.totalEvents}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Management Grid */}
                {activeTab === 'users' && (
                    <div className="bg-white p-6 rounded-[20px] shadow-[0px_18px_40px_rgba(112,144,176,0.12)]">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#f1f5f9] rounded-lg">
                                    <tr>
                                        <th className="text-left p-4 text-slate-500 font-medium text-xs uppercase rounded-l-lg">Usuario</th>
                                        <th className="text-left p-4 text-slate-500 font-medium text-xs uppercase">Rol</th>
                                        <th className="text-left p-4 text-slate-500 font-medium text-xs uppercase">Verificado</th>
                                        <th className="text-left p-4 text-slate-500 font-medium text-xs uppercase rounded-r-lg">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b border-gray-100 last:border-none">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full flex-shrink-0 bg-blue-100 flex items-center justify-center font-bold text-[#277FA4]">
                                                        {(u.profile?.firstName?.[0] || u.email[0]).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-slate-800 font-bold text-sm">{u.profile?.firstName} {u.profile?.lastName}</h5>
                                                        <p className="text-slate-400 text-xs">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-md text-xs font-bold ${u.role === 'ADMIN' ? 'bg-[#277FA4] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {u.isVerified
                                                    ? <Icon icon="solar:check-circle-bold" className="text-[#05CD99]" width={24} />
                                                    : <Icon icon="solar:close-circle-bold" className="text-[#E31A1A]" width={24} />
                                                }
                                            </td>
                                            <td className="p-4">
                                                <button onClick={() => toggleUserRole(u.id, u.role)} className="text-[#277FA4] font-bold text-sm hover:underline">
                                                    Cambiar Rol
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Banners Grid */}
                {activeTab === 'banners' && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <button onClick={openCreateModal} className="bg-[#277FA4] text-white px-6 py-3 rounded-[16px] font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:bg-[#206a8a] transition-all">
                                <Icon icon="solar:add-circle-bold" width={20} />
                                Crear Banner
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {banners.map(banner => (
                                <div key={banner.id} className="bg-white rounded-[20px] p-4 shadow-[0px_18px_40px_rgba(112,144,176,0.12)] group">
                                    <div className="relative h-40 w-full rounded-[16px] overflow-hidden mb-4 bg-gray-100">
                                        {banner.imageUrl && <img loading="lazy" src={banner.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />}
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${banner.isActive ? 'bg-[#05CD99]' : 'bg-gray-400'}`}>
                                                {banner.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="text-slate-800 font-bold text-lg mb-1">{banner.title}</h3>
                                    <div className="flex items-center gap-1 text-[#707EAE] text-xs font-bold mb-1">
                                        <Icon icon="solar:link-circle-bold" />
                                        <a href={banner.link || '#'} target="_blank" className="hover:underline truncate text-slate-800">{banner.link || 'Sin enlace destino'}</a>
                                    </div>
                                    <p className="text-slate-400 text-xs mb-4 truncate">Fuente: {banner.urlFuente || 'N/A'}</p>

                                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                        <button onClick={() => toggleBannerActive(banner.id, banner.isActive)} className="text-[#277FA4] text-sm font-bold flex items-center gap-1">
                                            <Icon icon={banner.isActive ? "solar:eye-linear" : "solar:eye-closed-linear"} />
                                            {banner.isActive ? 'Ocultar' : 'Publicar'}
                                        </button>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditModal(banner)} className="text-[#277FA4] bg-[#E0F2F7] p-2 rounded-lg hover:bg-[#D6D6FF]">
                                                <Icon icon="solar:pen-bold" width={18} />
                                            </button>
                                            <button onClick={() => deleteBanner(banner.id)} className="text-[#E31A1A] bg-[#FFEAEA] p-2 rounded-lg hover:bg-[#FFD6D6]">
                                                <Icon icon="solar:trash-bin-trash-bold" width={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Events Management */}
                {activeTab === 'events' && (
                    <div className="space-y-6">
                        {/* Header with controls */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <p className="text-slate-400 text-sm">{eventsTotal} eventos en total (página {eventsPage} de {Math.ceil(eventsTotal / 24) || 1})</p>
                            </div>
                            <div className="flex flex-wrap gap-3 items-center">
                                {/* Filters */}
                                <select
                                    value={filterStatus}
                                    onChange={(e: any) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800 font-bold text-sm cursor-pointer"
                                >
                                    <option value="all">Estado: Todos</option>
                                    <option value="active">Activos</option>
                                    <option value="inactive">Inactivos</option>
                                </select>
                                <select
                                    value={filterFeatured}
                                    onChange={(e: any) => setFilterFeatured(e.target.value)}
                                    className="px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800 font-bold text-sm cursor-pointer"
                                >
                                    <option value="all">Tipo: Todos</option>
                                    <option value="featured">Destacados</option>
                                    <option value="standard">Estándar</option>
                                </select>

                                {/* View Toggle */}
                                <div className="flex bg-slate-50 rounded-xl p-1">
                                    <button
                                        onClick={() => setEventsViewMode('cards')}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${eventsViewMode === 'cards' ? 'bg-white text-[#277FA4] shadow-sm' : 'text-slate-400'}`}
                                    >
                                        <Icon icon="solar:widget-5-bold" width={18} />
                                    </button>
                                    <button
                                        onClick={() => setEventsViewMode('table')}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${eventsViewMode === 'table' ? 'bg-white text-[#277FA4] shadow-sm' : 'text-slate-400'}`}
                                    >
                                        <Icon icon="solar:list-bold" width={18} />
                                    </button>
                                </div>
                                {/* Excel Upload */}
                                <label className="bg-[#05CD99] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer text-sm">
                                    <Icon icon="solar:file-linear" width={18} />
                                    Excel
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) await handleImportEvents(file);
                                            e.target.value = '';
                                        }}
                                    />
                                </label>

                                {/* Delete All Button */}
                                <button
                                    onClick={openConfirmDeleteAll}
                                    className="bg-[#FFEAEA] text-[#E31A1A] px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:bg-[#FFD6D6] transition-all text-sm cursor-pointer"
                                    title="Eliminar todos los eventos"
                                >
                                    <Icon icon="solar:trash-bin-trash-bold" width={18} />
                                    Vaciar Todo
                                </button>
                                <button
                                    onClick={() => { setEditingEvent(null); setIsEventModalOpen(true); }}
                                    className="bg-[#277FA4] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all text-sm"
                                >
                                    <Icon icon="solar:add-circle-bold" width={18} />
                                    Crear
                                </button>
                            </div>
                        </div>

                        {/* Events Content */}
                        {events.length === 0 ? (
                            <div className="bg-white p-6 rounded-[20px] shadow-[0px_18px_40px_rgba(112,144,176,0.12)]">
                                <p className="text-slate-400 text-center py-8">
                                    No hay eventos en esta página.
                                    <br />
                                    <span className="text-slate-800 font-bold">Crea uno o importa desde Excel.</span>
                                </p>
                            </div>
                        ) : eventsViewMode === 'cards' ? (
                            /* Cards View */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {events.map((event: any) => (
                                    <div key={event.id} className="bg-white rounded-[20px] p-4 shadow-[0px_18px_40px_rgba(112,144,176,0.12)] group">
                                        <div className="relative h-32 w-full rounded-[16px] overflow-hidden mb-3 bg-gray-100">
                                            {event.imageUrl && <img loading="lazy" src={event.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />}
                                            <div className="absolute top-2 right-2 flex gap-1">
                                                {event.isFeatured && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#277FA4]">★</span>
                                                )}
                                                {event.isBanner && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#FF8C00]">Banner</span>
                                                )}
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${event.isActive ? 'bg-[#05CD99]' : 'bg-gray-400'}`}>
                                                    {event.isActive ? 'ON' : 'OFF'}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="text-slate-800 font-bold text-sm mb-1 line-clamp-1">{event.title}</h3>
                                        <p className="text-slate-400 text-xs mb-3 truncate">{event.category || 'Sin cat.'}</p>
                                        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">

                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => { setEditingEvent(event); setIsEventModalOpen(true); }} className="text-[#277FA4] bg-[#E0F2F7] p-1.5 rounded-lg hover:bg-[#D6D6FF]" title="Editar">
                                                    <Icon icon="solar:pen-bold" width={14} />
                                                </button>
                                                <button
                                                    onClick={() => toggleEventStatus(event.id)}
                                                    className="text-[#277FA4] bg-[#E0F2F7] p-1.5 rounded-lg hover:bg-[#D6D6FF]"
                                                    title={event.isActive ? 'Desactivar' : 'Activar'}
                                                >
                                                    <Icon icon={event.isActive ? "solar:eye-linear" : "solar:eye-closed-linear"} width={14} />
                                                </button>
                                                <button
                                                    onClick={() => deleteEvent(event.id)}
                                                    className="text-[#E31A1A] bg-[#FFEAEA] p-1.5 rounded-lg hover:bg-[#FFD6D6]"
                                                >
                                                    <Icon icon="solar:trash-bin-trash-bold" width={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Table View */
                            <div className="bg-white p-6 rounded-[20px] shadow-[0px_18px_40px_rgba(112,144,176,0.12)]">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 rounded-lg">
                                            <tr>
                                                <th className="text-left p-3 text-slate-400 font-medium text-xs uppercase rounded-l-lg">Evento</th>
                                                <th className="text-left p-3 text-slate-400 font-medium text-xs uppercase">Categoría</th>
                                                <th className="text-left p-3 text-slate-400 font-medium text-xs uppercase">Fechas</th>
                                                <th className="text-left p-3 text-slate-400 font-medium text-xs uppercase">Estado</th>
                                                <th className="text-left p-3 text-slate-400 font-medium text-xs uppercase rounded-r-lg">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {events.map((event: any) => (
                                                <tr key={event.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50">
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-lg flex-shrink-0 bg-gray-100 overflow-hidden">
                                                                {event.imageUrl && <img loading="lazy" src={event.imageUrl} className="w-full h-full object-cover" />}
                                                            </div>
                                                            <div>
                                                                <h5 className="text-slate-800 font-bold text-sm line-clamp-1">
                                                                    {event.title}
                                                                    {event.isBanner && <span className="ml-2 px-1.5 py-0.5 rounded bg-[#FF8C00] text-white text-[10px] font-bold">Banner</span>}
                                                                </h5>
                                                                <p className="text-slate-400 text-xs">{event.location?.name || 'Sin ubicación'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3"><span className="text-slate-800 text-sm">{event.category || '-'}</span></td>
                                                    <td className="p-3"><span className="text-[#277FA4] font-bold text-sm">{event.dates?.length || 0}</span></td>
                                                    <td className="p-3">
                                                        <span className={`px-3 py-1 rounded-md text-xs font-bold ${event.isActive ? 'bg-[#E8FFF3] text-[#05CD99]' : 'bg-gray-100 text-gray-500'}`}>
                                                            {event.isActive ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex gap-2">
                                                            <button onClick={() => { setEditingEvent(event); setIsEventModalOpen(true); }} className="text-[#277FA4] font-bold text-sm hover:underline">Editar</button>
                                                            <button
                                                                onClick={() => toggleEventStatus(event.id)}
                                                                className="text-slate-400 font-bold text-sm hover:underline"
                                                            >
                                                                {event.isActive ? 'Desact.' : 'Activar'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {eventsTotal > 24 && (
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => fetchEvents(eventsPage - 1)}
                                    disabled={eventsPage <= 1}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm ${eventsPage <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#277FA4] text-white hover:bg-[#3311CC]'}`}
                                >
                                    Anterior
                                </button>
                                <span className="px-4 py-2 bg-slate-50 rounded-xl font-bold text-slate-800">
                                    {eventsPage} / {Math.ceil(eventsTotal / 24)}
                                </span>
                                <button
                                    onClick={() => fetchEvents(eventsPage + 1)}
                                    disabled={eventsPage >= Math.ceil(eventsTotal / 24)}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm ${eventsPage >= Math.ceil(eventsTotal / 24) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#277FA4] text-white hover:bg-[#3311CC]'}`}
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </main>

            <BannerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveBanner}
                initialData={editingBanner}
            />
            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => { setIsEventModalOpen(false); setEditingEvent(null); }}
                initialData={editingEvent}
                onSave={async (data: any) => {
                    try {
                        const payload = {
                            title: data.title,
                            description: data.description,
                            category: data.category,
                            imageUrl: data.imageUrl || undefined,
                            websiteUrl: data.websiteUrl || undefined,
                            isFeatured: data.isFeatured,
                            isBanner: data.isBanner,
                            ticketUrls: data.ticketUrls || [],
                            dates: (data.dates || []).map((d: any) => ({
                                date: d.date,
                                startTime: d.startTime || undefined,
                                endTime: d.endTime || undefined,
                                price: d.price ? Number(d.price) : undefined
                            })),
                            locationName: data.locationName || undefined,
                            department: data.department || undefined,
                            province: data.province || undefined,
                            district: data.district || undefined,
                            address: data.address || undefined,
                            latitude: data.latitude ? Number(data.latitude) : undefined,
                            longitude: data.longitude ? Number(data.longitude) : undefined
                        };

                        const isEdit = data.isEdit && data.eventId;
                        const resp: any = isEdit ? await patch(`events/${data.eventId}`, payload) : await post('events', payload);
                        if (isApiError(resp)) {
                            notify(`Error: ${resp.message || 'No se pudo guardar el evento'}`, 'error');
                        } else {
                            setIsEventModalOpen(false);
                            setEditingEvent(null);
                            fetchEvents(eventsPage);
                        }
                    } catch (e) {
                        notify('Error al guardar evento', 'error');
                    }
                }}
                categories={categories}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />
        </div>
    );
}
