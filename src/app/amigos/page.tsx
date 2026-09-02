"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';

import SidebarLeft from '@/app/ui/Profile/SidebarLeft';
import Auth from '@/app/ui/Auth';

import useAlertStore from '@/app/zustand/alert';
import { useAuthStore } from '@/app/zustand/auth';
import { useFriendshipsStore } from '@/app/zustand/friendships';
import { getProfileAssets } from '@/app/utils/profileAssets';

type Tab = 'buscar' | 'invitar' | 'solicitudes' | 'amigos';

export default function AmigosPage() {
  const { auth, me } = useAuthStore();
  const {
    searchResults, friends, pendingRequests, isLoading,
    searchUsers, inviteByEmail, sendRequest, acceptRequest, rejectRequest, removeFriend,
    getFriends, getPendingRequests,
  } = useFriendshipsStore();
  const { alert } = useAlertStore();

  const [openAuth, setOpenAuth] = useState(false);
  const [tab, setTab] = useState<Tab>('buscar');
  const [query, setQuery] = useState('');

  const [inviteMethod, setInviteMethod] = useState<'email' | 'whatsapp'>('email');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteWhatsapp, setInviteWhatsapp] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  const authAny = auth as any;
  const inviterName = [authAny?.profile?.firstName, authAny?.profile?.lastName].filter(Boolean).join(' ') || authAny?.username || 'Un amigo';

  const handleSendInvite = async () => {
    if (inviteMethod === 'email') {
      if (!inviteEmail.includes('@')) {
        alert('Ingresa un correo válido', 'error');
        return;
      }
      setIsSendingInvite(true);
      const result = await inviteByEmail(inviteEmail);
      setIsSendingInvite(false);
      if (result.success) {
        setInviteEmail('');
        alert('¡Invitación enviada! Le llegará un correo de bienvenida con el link para unirse.', 'success');
      } else {
        alert(result.message || 'No se pudo enviar la invitación', 'error');
      }
    } else {
      const digits = inviteWhatsapp.replace(/\D/g, '');
      if (digits.length < 8) {
        alert('Ingresa un número de WhatsApp válido, con código de país', 'error');
        return;
      }
      const registerUrl = `${window.location.origin}/?invite=1`;
      const text = `¡Hola! Soy ${inviterName} 👋 Te invito a Injoyplan, la app donde descubrimos y compartimos los mejores planes y eventos cerca de nosotros. Únete aquí: ${registerUrl}`;
      window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, '_blank');
      setInviteWhatsapp('');
    }
  };

  useEffect(() => {
    me();
  }, []);

  useEffect(() => {
    if (!auth) return;
    getFriends();
    getPendingRequests();
  }, [auth]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchUsers(query);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  if (!auth) {
    return (
      <div className="bg-[#F9FAFC] min-h-[70vh] flex items-center justify-center px-5">
        <div className="w-full max-w-md bg-white border border-[#EDEFF5] rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#E0F2F7] rounded-full flex items-center justify-center text-[#007FA4] mx-auto mb-4">
            <Icon icon="solar:users-group-rounded-bold" width={30} />
          </div>
          <h1 className="text-2xl font-black text-[#212121]">Amigos</h1>
          <p className="text-[#666] mt-2">Inicia sesión para buscar e invitar amigos.</p>
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
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 flex gap-6">
        <div className="hidden md:block w-[80px] lg:w-[240px] flex-shrink-0">
          <SidebarLeft />
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-2xl p-6 border border-[#EDEFF5] shadow-sm">
            <h1 className="text-2xl md:text-3xl font-black text-[#212121]">Amigos</h1>
            <p className="text-[#666] mt-1">Busca personas, envía invitaciones y gestiona tus amigos.</p>

            <div className="flex gap-2 mt-6 border-b border-[#EDEFF5]">
              {([
                { key: 'buscar', label: 'Buscar' },
                { key: 'invitar', label: 'Invitar' },
                { key: 'solicitudes', label: `Solicitudes${pendingRequests.length ? ` (${pendingRequests.length})` : ''}` },
                { key: 'amigos', label: `Mis amigos${friends.length ? ` (${friends.length})` : ''}` },
              ] as { key: Tab; label: string }[]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={
                    tab === t.key
                      ? 'px-4 py-3 font-bold text-[#007FA4] border-b-2 border-[#007FA4]'
                      : 'px-4 py-3 font-bold text-[#666] hover:text-[#007FA4] transition-colors'
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* BUSCAR */}
            {tab === 'buscar' && (
              <div className="mt-6">
                <div className="relative">
                  <Icon icon="solar:magnifer-bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" width={20} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Busca por nombre de usuario o nombre..."
                    className="w-full bg-[#F7F7F7] outline-none border border-solid border-[#ddd] p-3 pl-12 rounded-full"
                  />
                </div>

                <div className="mt-4 space-y-3">
                  {isLoading && <p className="text-[#666] text-sm">Buscando...</p>}
                  {!isLoading && query.trim().length >= 2 && searchResults.length === 0 && (
                    <p className="text-[#666] text-sm">No se encontraron usuarios.</p>
                  )}
                  {searchResults.map((u) => {
                    const name = [u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(' ') || u.username || u.email;
                    const { avatar } = getProfileAssets(u.profile);
                    return (
                      <div key={u.id} className="flex items-center justify-between bg-[#FAFBFF] border border-[#EDEFF5] rounded-xl p-3">
                        <Link href={`/usuario/${u.id}`} className="flex items-center gap-3">
                          <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-[#212121]">{name}</p>
                            {u.username && <p className="text-[#666] text-sm">@{u.username}</p>}
                          </div>
                        </Link>

                        {u.friendshipStatus === 'FRIENDS' && (
                          <span className="text-[#1D9A5D] font-bold text-sm px-4 py-2">Ya son amigos</span>
                        )}
                        {u.friendshipStatus === 'PENDING_SENT' && (
                          <span className="text-[#999] font-bold text-sm px-4 py-2">Invitación enviada</span>
                        )}
                        {u.friendshipStatus === 'PENDING_RECEIVED' && (
                          <span className="text-[#007FA4] font-bold text-sm px-4 py-2">Te invitó · revisa Solicitudes</span>
                        )}
                        {u.friendshipStatus === 'NONE' && (
                          <button
                            onClick={() => sendRequest(u.id)}
                            className="bg-[#007FA4] text-white font-bold px-4 py-2 rounded-full text-sm hover:bg-[#006080] transition-colors"
                          >
                            Invitar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* INVITAR */}
            {tab === 'invitar' && (
              <div className="mt-6 max-w-lg">
                <div className="bg-[#F0F8FA] border border-[#B8E2F2] rounded-2xl p-5 mb-6">
                  <p className="text-[#007FA4] font-bold">¿Tu amigo aún no está en Injoyplan?</p>
                  <p className="text-[#666] text-sm mt-1">Invítalo por correo o WhatsApp y le llegará un mensaje de bienvenida con el link para unirse gratis.</p>
                </div>

                <div className="flex gap-2 mb-5">
                  <button
                    onClick={() => setInviteMethod('email')}
                    className={
                      inviteMethod === 'email'
                        ? 'flex-1 flex items-center justify-center gap-2 bg-[#007FA4] text-white font-bold py-3 rounded-full text-sm'
                        : 'flex-1 flex items-center justify-center gap-2 border border-solid border-[#ddd] text-[#666] font-bold py-3 rounded-full text-sm hover:bg-gray-50'
                    }
                  >
                    <Icon icon="solar:letter-bold" width={18} />
                    Correo
                  </button>
                  <button
                    onClick={() => setInviteMethod('whatsapp')}
                    className={
                      inviteMethod === 'whatsapp'
                        ? 'flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3 rounded-full text-sm'
                        : 'flex-1 flex items-center justify-center gap-2 border border-solid border-[#ddd] text-[#666] font-bold py-3 rounded-full text-sm hover:bg-gray-50'
                    }
                  >
                    <Icon icon="ic:baseline-whatsapp" width={18} />
                    WhatsApp
                  </button>
                </div>

                {inviteMethod === 'email' ? (
                  <div>
                    <label className="font-bold text-[#444] text-sm">Correo de tu amigo</label>
                    <input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="amigo@correo.com"
                      type="email"
                      className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#ddd] p-3 rounded-md"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-[#444] text-sm">WhatsApp de tu amigo (con código de país)</label>
                    <input
                      value={inviteWhatsapp}
                      onChange={(e) => setInviteWhatsapp(e.target.value)}
                      placeholder="+51 987 654 321"
                      type="tel"
                      className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#ddd] p-3 rounded-md"
                    />
                  </div>
                )}

                <button
                  disabled={isSendingInvite}
                  onClick={handleSendInvite}
                  className={
                    isSendingInvite
                      ? 'mt-5 w-full bg-[#007FA4]/60 text-white font-bold py-3 rounded-full cursor-not-allowed'
                      : 'mt-5 w-full bg-[#007FA4] text-white font-bold py-3 rounded-full hover:bg-[#006080] transition-colors'
                  }
                >
                  {inviteMethod === 'email' ? 'Enviar invitación' : 'Abrir WhatsApp'}
                </button>
              </div>
            )}

            {/* SOLICITUDES */}
            {tab === 'solicitudes' && (
              <div className="mt-6 space-y-3">
                {pendingRequests.length === 0 && (
                  <p className="text-[#666] text-sm">No tienes solicitudes pendientes.</p>
                )}
                {pendingRequests.map((r) => {
                  const name = [r.user.profile?.firstName, r.user.profile?.lastName].filter(Boolean).join(' ') || r.user.username || r.user.email;
                  const { avatar } = getProfileAssets(r.user.profile);
                  return (
                    <div key={r.id} className="flex items-center justify-between bg-[#FAFBFF] border border-[#EDEFF5] rounded-xl p-3">
                      <Link href={`/usuario/${r.user.id}`} className="flex items-center gap-3">
                        <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
                        <p className="font-bold text-[#212121]">{name}</p>
                      </Link>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptRequest(r.id)}
                          className="bg-[#007FA4] text-white font-bold px-4 py-2 rounded-full text-sm hover:bg-[#006080] transition-colors"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => rejectRequest(r.id)}
                          className="border border-solid border-[#ccc] text-[#666] font-bold px-4 py-2 rounded-full text-sm hover:bg-gray-50 transition-colors"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MIS AMIGOS */}
            {tab === 'amigos' && (
              <div className="mt-6 space-y-3">
                {friends.length === 0 && (
                  <p className="text-[#666] text-sm">Aún no tienes amigos agregados.</p>
                )}
                {friends.map((f) => {
                  const other = f.userId === authAny.id ? f.friend : f.user;
                  const name = [other.profile?.firstName, other.profile?.lastName].filter(Boolean).join(' ') || other.username || other.email;
                  const { avatar } = getProfileAssets(other.profile);
                  return (
                    <div key={f.id} className="flex items-center justify-between bg-[#FAFBFF] border border-[#EDEFF5] rounded-xl p-3">
                      <Link href={`/usuario/${other.id}`} className="flex items-center gap-3">
                        <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
                        <p className="font-bold text-[#212121]">{name}</p>
                      </Link>
                      <button
                        onClick={() => removeFriend(f.id)}
                        className="text-[#FF4D4D] font-bold px-4 py-2 rounded-full text-sm hover:bg-red-50 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Auth openAuth={openAuth} setOpenAuth={setOpenAuth} />
    </div>
  );
}
