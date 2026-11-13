"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import ImagePeek from '@/app/components/ImagePeek';
import Link from "next/link";
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/app/zustand/auth';
import dayjs from '@/app/utils/date';
import { getProfileAssets } from '@/app/utils/profileAssets';
import { Event } from "@/app/interfaces/event";
import { eventPath } from '@/app/utils/urls';

interface FeedCardProps {
    event: Event;
    owner: any;
    favoritesCount: number;
    commentsCount: number;
    isFavorite: boolean;
    onToggleFavorite: (e: any) => void;
}

export default function FeedCard({
    event,
    owner,
    favoritesCount,
    commentsCount,
    isFavorite,
    onToggleFavorite
}: FeedCardProps) {

    // Calculate "time ago" or formatted date for top pill
    const timeDisplay = event.createdAt
        ? dayjs(event.createdAt).fromNow()
        : dayjs(event.FechaInicio).format('D MMM');

    // Optimistic State
    const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);
    const [localFavoritesCount, setLocalFavoritesCount] = useState(favoritesCount);

    // Sync with external updates
    useEffect(() => {
        setLocalIsFavorite(isFavorite);
        setLocalFavoritesCount(favoritesCount);
    }, [isFavorite, favoritesCount]);

    const { auth } = useAuthStore();

    const handleToggleFavorite = (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        // Optimistic update
        const newIsFavorite = !localIsFavorite;
        setLocalIsFavorite(newIsFavorite);
        setLocalFavoritesCount(prev => newIsFavorite ? prev + 1 : prev - 1);

        // Call parent handler (async) - Zustand store will eventually sync, but we don't wait for it
        onToggleFavorite(e);
    };

    return (
        <div className="relative w-full aspect-[4/5] rounded-[32px] overflow-hidden group shadow-lg">
            {/* Background Image */}
            <ImagePeek src={event.url || event.imageUrl} alt={event.titulo} className="absolute inset-0 bg-gray-200">
                {event.url || event.imageUrl ? (
                    <Image
                        src={event.url || event.imageUrl || ''}
                        alt={event.titulo}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <Icon icon="solar:gallery-broken" className="text-gray-400" width={48} />
                    </div>
                )}
            </ImagePeek>

            {/* Dark Gradient Overlay - Deep at bottom, light at top */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10 pointer-events-none" />

            {/* Top Bar: User & Context */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                {/* User Pill */}
                <Link
                    href={`/usuario/${owner?.id || ''}`}
                    className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full pl-1 pr-4 py-1 hover:bg-black/50 transition-colors border border-white/10"
                >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-white">
                        <img
                            src={getProfileAssets(owner?.profile).avatar}
                            alt={owner?.profile?.firstName || 'User'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white text-xs font-bold leading-none">
                            {owner?.profile?.firstName || owner?.email?.split('@')[0] || 'Usuario'}
                        </span>
                        <span className="text-white/60 text-[10px] font-medium leading-none mt-0.5">
                            {timeDisplay}
                        </span>
                    </div>
                </Link>

                {/* Context Menu Button (Visual only for now) */}
                {/* <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors border border-white/10">
                    <Icon icon="solar:menu-dots-bold" width={20} />
                </button> */}
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">

                {/* Title */}
                <Link href={eventPath(event.idEventos || event.ideventos, event.titulo, event.idfecha)}>
                    <h3 className="text-white text-xl font-bold leading-tight mb-1 line-clamp-2 hover:underline decoration-[#fff]/50 cursor-pointer text-shadow">
                        {event.titulo}
                    </h3>
                </Link>

                {/* Location / Date info */}
                <div className="flex items-center text-white/80 text-xs font-semibold mb-3">
                    <span className="truncate max-w-[200px]">{event.NombreLocal || 'Ubicación por definir'}</span>
                </div>

                {/* Interactive Row */}
                <div className="flex items-center justify-between">
                    {/* Metrics / Actions */}
                    <div className="flex items-center gap-4">
                        {/* Like Button */}
                        <button
                            onClick={handleToggleFavorite}
                            className="flex items-center gap-1.5 group/btn"
                        >
                            <Icon
                                icon={localIsFavorite ? "solar:heart-bold" : "solar:heart-linear"}
                                className={`transition-colors ${localIsFavorite ? "text-[#FF4D4D]" : "text-white group-hover/btn:text-[#FF4D4D]"}`}
                                width={24}
                            />
                            <span className="text-white font-bold text-sm">{localFavoritesCount}</span>
                        </button>

                        {/* Comments */}
                        <Link href={eventPath(event.idEventos || event.ideventos, event.titulo, event.idfecha)} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                            <Icon icon="solar:chat-round-dots-linear" className="text-white" width={24} />
                            <span className="text-white font-bold text-sm">{commentsCount}</span>
                        </Link>
                    </div>

                    {/* Edit Button (Owner Only) */}
                    {/* {auth?.id === owner?.id && (
                        <Link
                            href={`/perfil/crear-evento?edit=${event.id}`}
                            className="bg-[#F0F7FA] text-[#007FA4] w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#E0F2F7] transition-colors"
                            title="Editar evento"
                        >
                            <Icon icon="solar:pen-bold" width={20} />
                        </Link>
                    )} */}

                    {/* CTA Button */}
                    <Link
                        href={eventPath(event.idEventos || event.ideventos, event.titulo, event.idfecha)}
                        className="bg-white text-black font-extrabold text-xs px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        Ver más
                    </Link>
                </div>
            </div>
        </div>
    );
}
