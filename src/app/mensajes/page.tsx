"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import SidebarLeft from '@/app/ui/Profile/SidebarLeft';
import Auth from '@/app/ui/Auth';
import { useAuthStore } from '@/app/zustand/auth';
import { useChatStore } from '@/app/zustand/chat';
import type { ChatRoomDTO } from '@/app/interfaces/chat';

function getDisplayName(user: any) {
  const fullName = [user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(' ').trim();
  return fullName || user?.email || 'Usuario';
}

function getAvatar(user: any) {
  return user?.profile?.avatar || '/svg/us.svg';
}

function getOtherUser(room: ChatRoomDTO, currentUserId?: string) {
  if (room.type !== 'INDIVIDUAL') return null;
  const other = room.participants?.find((p) => p.userId !== currentUserId)?.user;
  return other || null;
}

export default function MessagesPage() {
  const { auth } = useAuthStore();
  const [openAuth, setOpenAuth] = useState(false);

  if (!auth) {
    return (
      <div className="bg-[#F9FAFC] min-h-[70vh] flex items-center justify-center px-5">
        <div className="w-full max-w-md bg-white border border-[#EDEFF5] rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#E0F2F7] rounded-full flex items-center justify-center text-[#007FA4] mx-auto mb-4">
            <Icon icon="solar:chat-round-dots-line-duotone" width={34} />
          </div>
          <h1 className="text-2xl font-black text-[#212121]">Mensajes</h1>
          <p className="text-[#666] mt-2">Inicia sesión para chatear con tus contactos (seguimiento mutuo).</p>
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

  return (
    <div className="bg-[#F9FAFC] min-h-[calc(100vh-120px)]">
      <Suspense fallback={<div className="p-8 text-center text-[#666]">Cargando mensajes...</div>}>
        <MessagesContent openAuth={openAuth} setOpenAuth={setOpenAuth} />
      </Suspense>
      <Auth openAuth={openAuth} setOpenAuth={setOpenAuth} />
    </div>
  );
}

function MessagesContent({ openAuth, setOpenAuth }: { openAuth: boolean, setOpenAuth: (v: boolean) => void }) {
  const { auth, me } = useAuthStore();
  const {
    rooms,
    contacts,
    activeRoomId,
    messages,
    isLoadingRooms,
    isLoadingMessages,
    isSending,
    error,
    loadRooms,
    loadContacts,
    selectRoom,
    createDirectRoom,
    sendMessage,
  } = useChatStore();

  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [openNewChat, setOpenNewChat] = useState(false);

  const currentUserId = auth?.id as string | undefined;

  const searchParams = useSearchParams();
  const chatWithUser = searchParams.get('chatWith');

  useEffect(() => {
    me();
  }, []);

  useEffect(() => {
    if (!auth) return;
    loadRooms().then(async () => {
      if (chatWithUser) {
        const room = await createDirectRoom(chatWithUser);
        if (room?.id) {
          await selectRoom(room.id);
        }
      }
    });
    loadContacts();
  }, [auth, chatWithUser]);

  const activeRoom = useMemo(() => {
    return rooms.find((r) => r.id === activeRoomId) ?? null;
  }, [rooms, activeRoomId]);

  const activeOtherUser = useMemo(() => {
    if (!activeRoom) return null;
    return getOtherUser(activeRoom, currentUserId);
  }, [activeRoom, currentUserId]);

  const filteredRooms = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rooms;

    return rooms.filter((room) => {
      const other = getOtherUser(room, currentUserId);
      const name = other ? getDisplayName(other) : room.name || 'Grupo';
      const last = room.messages?.[0]?.content || '';
      return name.toLowerCase().includes(term) || last.toLowerCase().includes(term);
    });
  }, [rooms, search, currentUserId]);

  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length, activeRoomId]);

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 flex gap-6">
      {/* Left Sidebar */}
      <div className="hidden md:block w-[80px] lg:w-[240px] flex-shrink-0">
        <SidebarLeft />
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-white rounded-2xl border border-[#EDEFF5] shadow-sm flex overflow-hidden min-h-[70vh]">
        {/* Conversations List */}
        <div className={`w-full md:w-[340px] lg:w-[400px] border-r border-[#EDEFF5] flex flex-col ${activeRoomId ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-5 border-b border-[#EDEFF5]">
            <div className="flex items-center justify-between gap-3">
              <h1 className="font-black text-xl text-[#212121]">Mensajes</h1>
              <button
                onClick={() => setOpenNewChat((v) => !v)}
                className="w-9 h-9 rounded-full bg-[#007FA4] text-white flex items-center justify-center hover:bg-[#006080] transition-colors"
                title="Nuevo chat"
              >
                <Icon icon="solar:pen-new-square-bold" width={18} />
              </button>
            </div>

            <div className="relative mt-4">
              <Icon icon="solar:magnifer-linear" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" width={20} />
              <input
                type="text"
                placeholder="Buscar mensajes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F7F7F7] pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#007FA4]/20 transition-all"
              />
            </div>

            {openNewChat && (
              <div className="mt-4 rounded-xl border border-[#EDEFF5] bg-white overflow-hidden">
                <div className="px-4 py-3 bg-[#FAFBFF] border-b border-[#EDEFF5]">
                  <p className="text-sm font-bold text-[#212121]">Contactos</p>
                  <p className="text-xs text-[#666]">Solo aparecen usuarios con seguimiento mutuo.</p>
                </div>
                <div className="max-h-[280px] overflow-y-auto">
                  {contacts.length > 0 ? contacts.map((u: any) => (
                    <button
                      key={u.id}
                      onClick={async () => {
                        setOpenNewChat(false);
                        const room = await createDirectRoom(u.id);
                        if (room?.id) {
                          await selectRoom(room.id);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F9FAFC] border-b border-[#F7F7F7] text-left"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-solid border-[#EDEFF5] bg-[#F7F7F7]">
                        <img loading="lazy" src={getAvatar(u)} alt={getDisplayName(u)} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#212121] text-sm truncate">{getDisplayName(u)}</p>
                        <p className="text-[12px] text-[#666] truncate">{u.email}</p>
                      </div>
                      <Icon icon="mdi:chevron-right" width={22} className="text-[#A3ABCC]" />
                    </button>
                  )) : (
                    <div className="p-4 text-sm text-[#666]">Aún no tienes contactos con seguimiento mutuo.</div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <p className="mt-4 text-sm font-bold text-[#861F21]">{error}</p>
            )}
          </div>

          {/* Rooms List */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingRooms ? (
              <div className="p-6 text-sm text-[#666]">Cargando conversaciones...</div>
            ) : filteredRooms.length > 0 ? (
              filteredRooms.map((room) => {
                const other = getOtherUser(room, currentUserId);
                const name = other ? getDisplayName(other) : room.name || 'Grupo';
                const avatar = other ? getAvatar(other) : '/svg/us.svg';
                const last = room.messages?.[0];

                return (
                  <button
                    key={room.id}
                    onClick={() => selectRoom(room.id)}
                    className={`w-full p-4 flex items-center gap-3 text-left cursor-pointer hover:bg-[#F9FAFC] transition-colors border-b border-[#F7F7F7] ${activeRoomId === room.id ? 'bg-[#F0F7FA]' : ''}`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F7F7F7] border border-[#EDEFF5]">
                      <img loading="lazy" src={avatar} alt={name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className={`font-bold text-sm truncate ${activeRoomId === room.id ? 'text-[#007FA4]' : 'text-[#212121]'}`}>{name}</h3>
                        <span className="text-[11px] text-[#999]">
                          {last?.createdAt ? new Date(last.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-xs truncate text-[#666]">
                        {last?.content || 'Sin mensajes todavía'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-sm text-[#666]">No tienes conversaciones todavía.</div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!activeRoomId ? 'hidden md:flex' : 'flex'}`}>
          {activeRoomId && activeRoom ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-[#EDEFF5] flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-3">
                  <button className="md:hidden" onClick={() => selectRoom(null)}>
                    <Icon icon="solar:arrow-left-linear" width={24} />
                  </button>

                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#F7F7F7] border border-[#EDEFF5]">
                    <img loading="lazy" src={getAvatar(activeOtherUser)} alt="Chat" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="font-black text-[#212121] text-sm md:text-base">
                      {activeOtherUser ? getDisplayName(activeOtherUser) : (activeRoom.name || 'Chat')}
                    </h2>
                    <p className="text-[11px] text-[#666]">Seguimiento mutuo</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[#666]">
                  <Icon icon="solar:menu-dots-bold" width={24} className="cursor-pointer hover:text-[#007FA4]" />
                </div>
              </div>

              {/* Messages */}
              <div ref={listRef} className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F9FAFC] space-y-4">
                {isLoadingMessages ? (
                  <div className="text-sm text-[#666]">Cargando mensajes...</div>
                ) : messages.length > 0 ? (
                  messages.map((msg: any) => {
                    const mine = msg.senderId === currentUserId;
                    return (
                      <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] md:max-w-[60%] rounded-2xl p-3 md:p-4 text-sm ${mine
                          ? 'bg-[#007FA4] text-white rounded-tr-sm shadow-md'
                          : 'bg-white text-[#444] rounded-tl-sm shadow-sm border border-[#EDEFF5]'
                          }`}>
                          <p className="whitespace-pre-line">{msg.content}</p>
                          <span className={`text-[10px] block mt-1 text-right ${mine ? 'text-white/80' : 'text-[#999]'}`}>
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-[#666]">Aún no hay mensajes. ¡Di hola!</div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-[#EDEFF5]">
                <div className="flex items-center gap-3 bg-[#F7F7F7] rounded-full px-4 py-2 border border-transparent focus-within:border-[#007FA4] transition-colors">
                  <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const ok = await sendMessage(activeRoomId, draft);
                        if (ok) setDraft('');
                      }
                    }}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-[#212121] py-1"
                  />
                  <button
                    disabled={isSending}
                    onClick={async () => {
                      const ok = await sendMessage(activeRoomId, draft);
                      if (ok) setDraft('');
                    }}
                    className={
                      isSending
                        ? 'w-8 h-8 rounded-full bg-[#007FA4]/60 text-white flex items-center justify-center cursor-not-allowed'
                        : 'w-8 h-8 rounded-full bg-[#007FA4] text-white flex items-center justify-center hover:bg-[#006080] transition-colors shadow-sm'
                    }
                  >
                    <Icon icon="solar:plain-bold" width={18} className="-ml-0.5 mt-0.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#F9FAFC]">
              <div className="w-24 h-24 bg-[#E0F2F7] rounded-full flex items-center justify-center text-[#007FA4] mb-4">
                <Icon icon="solar:chat-round-dots-line-duotone" width={48} />
              </div>
              <h2 className="text-xl font-black text-[#212121] mb-2">Tus Mensajes</h2>
              <p className="text-[#666] max-w-sm">Selecciona una conversación o crea un nuevo chat desde tus contactos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
