"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@iconify/react';

import SidebarLeft from '@/app/ui/Profile/SidebarLeft';
import Auth from '@/app/ui/Auth';

import { useAuthStore } from '@/app/zustand/auth';
import { useProfileStore } from '@/app/zustand/profile';
import { useEventCreateStore } from '@/app/zustand/eventCreate';

export default function MisEventosPage() {
    const { auth, me } = useAuthStore();
    const { userEvents, getUserEvents, isLoading } = useProfileStore();
    const { deleteEvent } = useEventCreateStore();
    const router = useRouter();

    const [openAuth, setOpenAuth] = useState(false);
    const [showCompanyOnlyModal, setShowCompanyOnlyModal] = useState(false);

    const handleCreateEventClick = () => {
        if ((auth as any)?.userType === 'COMPANY') {
            router.push('/perfil/crear-evento');
        } else {
            setShowCompanyOnlyModal(true);
        }
    };

    useEffect(() => {
        me();
    }, []);

    useEffect(() => {
        if (!auth) return;
        // Fetch events created by the logged-in user
        getUserEvents(String(auth.id));
    }, [auth]);

    if (!auth) {
        return (
            <div className="bg-[#F9FAFC] min-h-[70vh] flex items-center justify-center px-5">
                <div className="w-full max-w-md bg-white border border-[#EDEFF5] rounded-2xl p-8 text-center shadow-sm">
                    <div className="w-16 h-16 bg-[#E0F2F7] rounded-full flex items-center justify-center text-[#007FA4] mx-auto mb-4">
                        <Icon icon="solar:calendar-bold" width={30} />
                    </div>
                    <h1 className="text-2xl font-black text-[#212121]">Mis Eventos</h1>
                    <p className="text-[#666] mt-2">Inicia sesión para ver los eventos que has creado.</p>
                    <button
                        onClick={() => setOpenAuth(true)}
                        className="mt-6 w-full bg-[#007FA4] text-white font-bold px-8 py-3 rounded-full hover:bg-[#006080] transition-colors"
                    >
                        Ingresar
                    </button>
                    <Auth openAuth={openAuth} setOpenAuth={setOpenAuth} />
                </div>
            </div>
        );
    }

    const handleDelete = async (eventId: string) => {
        if (confirm('¿Estás seguro de eliminar este evento?')) {
            const success = await deleteEvent(eventId);
            if (success) {
                getUserEvents(String(auth.id));
            }
        }
    };

    return (
        <div className="bg-[#F9FAFC] min-h-[calc(100vh-120px)]">
            <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 flex gap-6">
                <div className="hidden md:block w-[80px] lg:w-[240px] flex-shrink-0">
                    <SidebarLeft />
                </div>

                <div className="flex-1">
                    {/* Header */}
                    <div className="bg-white rounded-2xl p-6 border border-[#EDEFF5] shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-[#212121]">Mis Eventos</h1>
                            <p className="text-[#666] mt-1">Eventos que has creado.</p>
                        </div>
                        <button
                            onClick={handleCreateEventClick}
                            className="bg-[#007FA4] text-white font-bold px-6 py-3 rounded-full hover:bg-[#006080] transition-colors flex items-center gap-2 w-fit"
                        >
                            <Icon icon="solar:calendar-add-bold" width={20} />
                            Crear Evento
                        </button>
                    </div>

                    {/* Content */}
                    <div className="mt-6">
                        {isLoading ? (
                            <div className="bg-white rounded-2xl p-8 border border-[#EDEFF5] shadow-sm text-center">
                                <div className="animate-pulse flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                                </div>
                            </div>
                        ) : userEvents.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 border border-[#EDEFF5] shadow-sm text-center">
                                <div className="w-16 h-16 bg-[#FAFBFF] rounded-full flex items-center justify-center text-[#007FA4] mx-auto mb-4 border border-[#EDEFF5]">
                                    <Icon icon="solar:calendar-minimalistic-bold" width={28} />
                                </div>
                                <h2 className="text-xl font-black text-[#212121]">Aún no has creado eventos</h2>
                                <p className="text-[#666] mt-2 mb-6">Comienza creando tu primer evento para verlo aquí.</p>
                                <button
                                    onClick={handleCreateEventClick}
                                    className="inline-flex items-center gap-2 bg-[#007FA4] text-white font-bold px-6 py-3 rounded-full hover:bg-[#006080] transition-colors"
                                >
                                    <Icon icon="solar:calendar-add-bold" width={20} />
                                    Crear mi primer evento
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {userEvents.map((event: any) => (
                                    <div
                                        key={event.id}
                                        className="bg-white rounded-2xl border border-[#EDEFF5] shadow-sm overflow-hidden group hover:shadow-lg transition-shadow"
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-video bg-gray-100">
                                            {event.imageUrl ? (
                                                <Image
                                                    src={event.imageUrl}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[#A3ABCC]">
                                                    <Icon icon="solar:gallery-broken" width={40} />
                                                </div>
                                            )}

                                            {/* Hover Actions */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <Link
                                                    href={`/perfil/crear-evento?edit=${event.id}`}
                                                    className="w-12 h-12 rounded-full bg-white text-[#007FA4] flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Icon icon="solar:pen-bold" width={20} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(event.id)}
                                                    className="w-12 h-12 rounded-full bg-white text-[#FF4D4D] flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Icon icon="solar:trash-bin-trash-bold" width={20} />
                                                </button>
                                                <Link
                                                    href={event.dates?.[0]?.id ? `/evento/${event.id}/${event.dates[0].id}` : `/evento/${event.id}`}
                                                    className="w-12 h-12 rounded-full bg-white text-[#212121] flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                                                    title="Ver"
                                                >
                                                    <Icon icon="solar:eye-bold" width={20} />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-4">
                                            <h3 className="font-bold text-[#212121] text-lg line-clamp-1">{event.title}</h3>
                                            <p className="text-[#666] text-sm mt-1 line-clamp-1">
                                                {event.location?.name || 'Sin ubicación'}
                                            </p>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EDEFF5]">
                                                <div className="flex items-center gap-3 text-sm text-[#666]">
                                                    <span className="flex items-center gap-1">
                                                        <Icon icon="solar:heart-bold" className="text-[#FF4D4D]" width={16} />
                                                        {event._count?.favorites || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Icon icon="solar:chat-round-dots-bold" className="text-[#007FA4]" width={16} />
                                                        {event._count?.comments || 0}
                                                    </span>
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${event.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {event.isActive ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Auth openAuth={openAuth} setOpenAuth={setOpenAuth} />

            {showCompanyOnlyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[20px] w-full max-w-md shadow-2xl p-6 text-center">
                        <div className="w-16 h-16 bg-[#E0F2F7] text-[#007FA4] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon icon="solar:buildings-bold" width={32} />
                        </div>
                        <h3 className="text-[#212121] text-xl font-bold mb-2">Solo empresas pueden crear eventos</h3>
                        <p className="text-[#666] mb-6">Tu cuenta es de tipo persona natural. Regístrate como empresa para poder publicar eventos.</p>
                        <button
                            onClick={() => setShowCompanyOnlyModal(false)}
                            className="px-8 py-3 rounded-full bg-[#007FA4] text-white font-bold hover:bg-[#006080] transition-colors"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
