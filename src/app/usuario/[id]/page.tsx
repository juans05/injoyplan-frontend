"use client";

import Image from 'next/image';
import Link from 'next/link';
import ReactModal from 'react-modal';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react/dist/iconify.js';

import Auth from '@/app/ui/Auth';
import { useAuthStore } from '@/app/zustand/auth';
import { useProfileStore } from '@/app/zustand/profile';
import { useEventCreateStore } from '@/app/zustand/eventCreate';
import type { UserDTO } from '@/app/interfaces/user';
import SidebarLeft from '@/app/ui/Profile/SidebarLeft';
import SidebarRight from '@/app/ui/Profile/SidebarRight';
import { getProfileAssets } from '@/app/utils/profileAssets';
import { eventPath } from '@/app/utils/urls';

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    borderRadius: '12px',
    border: 'none',
    padding: '0px',
    width: 'min(520px, 92vw)',
    maxHeight: '80vh',
    overflow: 'hidden',
  },
  overlay: {
    zIndex: 999,
  },
} as const;

function UserRow({ user }: { user: UserDTO }) {
  const profile = user.profile;
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || user.email;
  // Use centralized asset logic
  const { avatar } = getProfileAssets(profile);

  return (
    <Link href={`/usuario/${user.id}`} className="flex items-center gap-3 p-4 border-b border-solid border-[#EDEFF5]">
      <div className="w-10 h-10 rounded-full overflow-hidden border border-solid border-[#EDEFF5] bg-[#F7F7F7]">
        <img loading="lazy" src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-[#212121] truncate">{name}</p>
        <p className="text-[13px] text-[#666] truncate">{user.email}</p>
      </div>
      <Icon icon="mdi:chevron-right" width={22} className="text-[#A3ABCC]" />
    </Link>
  );
}

export default function UsuarioPage() {
  const params = useParams();
  const id = (params as any)?.id as string;

  const { auth } = useAuthStore();
  const {
    userProfile,
    getUserProfile,
    followers,
    following,
    getFollowers,
    getFollowing,
    followUser,
    unfollowUser,
    isLoading,
    userEvents,
    getUserEvents,
    myProfile,
    getMyProfile,
  } = useProfileStore();

  const [openAuth, setOpenAuth] = useState(false);
  const [openFollowers, setOpenFollowers] = useState(false);
  const [openFollowing, setOpenFollowing] = useState(false);

  useEffect(() => {
    getMyProfile();
    if (!id) return;
    getUserProfile(id);
    getUserEvents(id);
  }, [id]);

  const profile = userProfile?.profile;

  const displayName = useMemo(() => {
    const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
    return fullName || userProfile?.email || 'Usuario';
  }, [profile?.firstName, profile?.lastName, userProfile?.email]);

  const assets = getProfileAssets(profile);
  const coverSrc = assets.cover;
  const avatarSrc = assets.avatar;

  const counts = userProfile?._count || {};
  const followersCount = counts.followers ?? 0;
  const followingCount = counts.following ?? 0;
  const postsCount = counts.posts ?? 0;
  const eventsCount = counts.events ?? 0;

  const isFollowing = userProfile?.isFollowing === true;

  return (
    <div className="bg-[#F9FAFC] min-h-screen py-6 relative">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Left Sidebar */}
          <div className="hidden md:block md:col-span-3 lg:col-span-2 sticky top-24 self-start">
            <SidebarLeft />
          </div>

          {/* Center Content */}
          <div className="col-span-1 md:col-span-9 lg:col-span-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-[#212121]">Perfil</h1>
                <p className="text-[#666] mt-1">{displayName}</p>
              </div>
              <Link href="/" className="text-[#007FA4] font-bold">
                Volver
              </Link>
            </div>

            <div className="bg-white border border-solid border-[#EDEFF5] rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-[160px] md:h-[220px] bg-[#EEE]">
                <img loading="lazy" src={coverSrc} alt="Portada" className="w-full h-full object-cover" />
              </div>

              <div className="px-6 md:px-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                  <div className="-mt-10 md:-mt-14 flex items-end gap-4 relative z-10">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white bg-[#F7F7F7]">
                      <img loading="lazy" src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                    </div>

                  </div>

                  <div className="mt-4 md:mt-4 flex items-center gap-3 pb-5">
                    {String(auth?.id) !== String(id) && (
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/mensajes?chatWith=${id}`}
                          className="bg-[#007FA4] text-white font-bold px-6 py-2.5 rounded-full hover:bg-[#006080] transition-colors flex items-center gap-2"
                        >
                          <Icon icon="solar:chat-line-bold" width={20} />
                          Enviar Mensaje
                        </Link>

                        <button
                          onClick={async () => {
                            if (!auth) {
                              setOpenAuth(true);
                              return;
                            }
                            if (!id) return;

                            if (isFollowing) {
                              await unfollowUser(id);
                            } else {
                              await followUser(id);
                            }
                          }}
                          className={
                            isFollowing
                              ? 'border border-solid border-[#861F21] text-[#861F21] font-bold px-6 py-2.5 rounded-full'
                              : 'bg-[#861F21] text-white font-bold px-6 py-2.5 rounded-full'
                          }
                        >
                          {isFollowing ? 'Siguiendo' : 'Seguir'}
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-6">
                  <button
                    onClick={async () => {
                      if (!id) return;
                      setOpenFollowers(true);
                      await getFollowers(id);
                    }}
                    className="text-left bg-[#FAFBFF] border border-solid border-[#EDEFF5] rounded-xl p-4"
                  >
                    <p className="text-sm text-[#666]">Seguidores</p>
                    <p className="text-2xl font-black text-[#212121]">{followersCount}</p>
                  </button>
                  <button
                    onClick={async () => {
                      if (!id) return;
                      setOpenFollowing(true);
                      await getFollowing(id);
                    }}
                    className="text-left bg-[#FAFBFF] border border-solid border-[#EDEFF5] rounded-xl p-4"
                  >
                    <p className="text-sm text-[#666]">Seguidos</p>
                    <p className="text-2xl font-black text-[#212121]">{followingCount}</p>
                  </button>

                  <div className="text-left bg-[#FAFBFF] border border-solid border-[#EDEFF5] rounded-xl p-4">
                    <p className="text-sm text-[#666]">Eventos</p>
                    <p className="text-2xl font-black text-[#212121]">{eventsCount}</p>
                  </div>
                </div>
                <div className="pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-black text-[#212121]">{displayName}</h1>
                    <span className={
                      userProfile?.userType === 'COMPANY'
                        ? 'text-[12px] font-bold bg-[#861F21] text-white px-3 py-1 rounded-full'
                        : 'text-[12px] font-bold bg-[#DBEBF1] text-[#007FA4] px-3 py-1 rounded-full'
                    }>
                      {userProfile?.userType === 'COMPANY' ? 'Empresa' : 'Persona'}
                    </span>
                  </div>
                  <p className="text-[#666] text-sm mt-1">{userProfile?.email}</p>
                </div>
                <div className="pb-8 border-b border-solid border-[#EDEFF5]">
                  <h2 className="font-bold text-[#212121] text-lg">Acerca de</h2>
                  <p className="text-[#444] mt-2 whitespace-pre-line">
                    {profile?.description || 'Este usuario aún no agregó una descripción.'}
                  </p>
                </div>

                {/* Events Grid */}
                <div className="pt-8 pb-8">
                  <h2 className="font-bold text-[#212121] text-lg mb-4">Eventos</h2>

                  {!isLoading && userEvents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 bg-[#FAFBFF] rounded-xl border border-dashed border-[#EDEFF5]">
                      <Icon icon="solar:camera-minimalistic-broken" width={48} className="text-[#A3ABCC] mb-2" />
                      <p className="text-[#666]">Aún no ha publicado eventos.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-4">
                    {userEvents.map((event: any) => {
                      const isOwner = String(auth?.id) === String(event.userId);
                      return (
                        <div key={event.id} className="relative aspect-square bg-[#F7F7F7] overflow-hidden group rounded-lg">
                          <Link
                            href={eventPath(event.id, event.title, event.dates?.[0]?.id)}
                            className="block w-full h-full"
                          >
                            {event.imageUrl ? (
                              <Image
                                src={event.imageUrl}
                                alt={event.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-[#A3ABCC]">
                                <Icon icon="solar:gallery-broken" width={32} />
                              </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white font-bold pointer-events-none">
                              <div className="flex items-center gap-1">
                                <Icon icon="solar:heart-bold" width={20} />
                                <span>{event._count?.favorites || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Icon icon="solar:chat-round-dots-bold" width={20} />
                                <span>{event._count?.comments || 0}</span>
                              </div>
                            </div>
                          </Link>

                          {/* Edit/Delete Actions */}
                          {isOwner && (
                            <div className="absolute top-2 right-2 flex items-center gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link
                                href={`/perfil/crear-evento?edit=${event.id}`}
                                className="w-8 h-8 rounded-full bg-white text-[#007FA4] flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                                title="Editar"
                              >
                                <Icon icon="solar:pen-bold" width={16} />
                              </Link>
                              <button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  if (confirm('¿Estás seguro de eliminar este evento?')) {
                                    // Quick delete
                                    const success = await useEventCreateStore.getState().deleteEvent(event.id);
                                    if (success) {
                                      // Refresh list
                                      getUserEvents(String(id));
                                    }
                                  }
                                }}
                                className="w-8 h-8 rounded-full bg-white text-[#FF4D4D] flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                                title="Eliminar"
                              >
                                <Icon icon="solar:trash-bin-trash-bold" width={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <ReactModal
              ariaHideApp={false}
              isOpen={openFollowers}
              onRequestClose={() => setOpenFollowers(false)}
              style={modalStyles}
            >
              <div className="bg-white">
                <div className="flex items-center justify-between p-4 border-b border-solid border-[#EDEFF5]">
                  <h3 className="font-bold text-[#212121]">Seguidores</h3>
                  <button onClick={() => setOpenFollowers(false)}>
                    <Icon icon="line-md:close" fontSize={22} />
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                  {followers.length > 0 ? followers.map((u) => <UserRow key={u.id} user={u} />) : (
                    <div className="p-6 text-center text-[#666]">No hay seguidores.</div>
                  )}
                </div>
              </div>
            </ReactModal>

            <ReactModal
              ariaHideApp={false}
              isOpen={openFollowing}
              onRequestClose={() => setOpenFollowing(false)}
              style={modalStyles}
            >
              <div className="bg-white">
                <div className="flex items-center justify-between p-4 border-b border-solid border-[#EDEFF5]">
                  <h3 className="font-bold text-[#212121]">Seguidos</h3>
                  <button onClick={() => setOpenFollowing(false)}>
                    <Icon icon="line-md:close" fontSize={22} />
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                  {following.length > 0 ? following.map((u) => <UserRow key={u.id} user={u} />) : (
                    <div className="p-6 text-center text-[#666]">No sigue a nadie.</div>
                  )}
                </div>
              </div>
            </ReactModal>

            {isLoading && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-solid border-[#EDEFF5] shadow-sm rounded-full px-4 py-2 text-sm text-[#444] z-50">
                Cargando...
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24 self-start">
            <SidebarRight myProfile={myProfile} isLoading={isLoading} />
          </div>

        </div>

        <Auth openAuth={openAuth} setOpenAuth={setOpenAuth} />

      </div>
    </div>
  );
}
