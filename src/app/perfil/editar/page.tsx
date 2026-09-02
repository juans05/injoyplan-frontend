"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import moment from 'moment';

import Auth from '@/app/ui/Auth';
import { useAuthStore } from '@/app/zustand/auth';
import { useProfileStore } from '@/app/zustand/profile';
import useAlertStore from '@/app/zustand/alert';
import SidebarLeft from '@/app/ui/Profile/SidebarLeft';
import SidebarRight from '@/app/ui/Profile/SidebarRight';
import { Icon } from '@iconify/react';

const LIMA_DISTRICTS = [
  'Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos',
  'Cieneguilla', 'Comas', 'El Agustino', 'Independencia', 'Jesús María', 'La Molina',
  'La Victoria', 'Lima (Cercado)', 'Lince', 'Los Olivos', 'Lurigancho (Chosica)', 'Lurín',
  'Magdalena del Mar', 'Miraflores', 'Pachacámac', 'Pucusana', 'Pueblo Libre', 'Puente Piedra',
  'Punta Hermosa', 'Punta Negra', 'Rímac', 'San Bartolo', 'San Borja', 'San Isidro',
  'San Juan de Lurigancho', 'San Juan de Miraflores', 'San Luis', 'San Martín de Porres',
  'San Miguel', 'Santa Anita', 'Santa María del Mar', 'Santa Rosa', 'Santiago de Surco',
  'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo',
];

// Defense-in-depth input guard for free-text fields. Prisma already parameterizes every
// query on the backend (no raw SQL is used anywhere), so this isn't what prevents SQL
// injection — it just rejects obviously malicious-looking input before it's ever sent.
const SQLI_PATTERN = /(--|;|\/\*|\*\/|\bunion\b|\bselect\b|\binsert\b|\bdelete\b|\bdrop\b|\bupdate\b\s+\w+\s+\bset\b|\bor\b\s+\d+\s*=\s*\d+|'\s*or\s*'?1'?\s*=\s*'?1)/i;
const NAME_PATTERN = /^[\p{L}\s'-]*$/u;

export default function EditarPerfilPage() {
  const { auth, me } = useAuthStore();
  const { myProfile, getMyProfile, updateMyProfile, uploadAvatar, uploadCover, uploadCompanyDocument, isLoading, error } = useProfileStore();
  const { alert } = useAlertStore();

  const [openAuth, setOpenAuth] = useState(false);

  const profile = myProfile?.profile;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  // Read-only: email and username cannot be modified from this form
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  // "Cambiar contraseña" is its own action, separate from the main profile save
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [currentPasswordForPwd, setCurrentPasswordForPwd] = useState('');

  // Note: gender and birthDate should be in profile, but if schema update isn't applied yet, they might be undefined
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');

  // Convertirse en empresa
  const [isCompanyMode, setIsCompanyMode] = useState(false);
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [dni, setDni] = useState('');
  const [fichaRucUrl, setFichaRucUrl] = useState('');
  const [fichaRucFile, setFichaRucFile] = useState<File | null>(null);

  useEffect(() => {
    me();
    getMyProfile();
  }, []);

  useEffect(() => {
    // User fields are at root of myProfile
    if (myProfile) {
      setEmail(myProfile.email || '');
      setUsername(myProfile.username || '');
    }

    // Profile fields
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setFullName([profile.firstName, profile.lastName].filter(Boolean).join(' '));
      setDescription(profile.description || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setCountry(profile.country || '');
      setGender(profile.gender || '');
      setBirthDate(profile.birthDate ? moment.utc(profile.birthDate).format('YYYY-MM-DD') : '');
      setRuc(profile.ruc || '');
      setRazonSocial(profile.razonSocial || '');
      setDni(profile.dni || '');
      setFichaRucUrl(profile.fichaRucUrl || '');
    }
  }, [myProfile, profile]);

  const isCompany = myProfile?.userType === 'COMPANY';

  const handleBecomeCompany = async () => {
    if (!ruc || !razonSocial || !dni) {
      alert('Completa RUC, Razón Social y DNI', 'error');
      return;
    }
    if (SQLI_PATTERN.test(razonSocial)) {
      alert('La razón social contiene caracteres no permitidos', 'error');
      return;
    }
    let finalFichaRucUrl = fichaRucUrl;
    if (fichaRucFile) {
      const uploadedUrl = await uploadCompanyDocument(fichaRucFile);
      if (!uploadedUrl) return; // error ya seteado en el store
      finalFichaRucUrl = uploadedUrl;
      setFichaRucUrl(uploadedUrl);
    }
    if (!finalFichaRucUrl) {
      alert('Debes adjuntar tu Ficha RUC', 'error');
      return;
    }
    await updateMyProfile({ becomeCompany: true, ruc, razonSocial, dni, fichaRucUrl: finalFichaRucUrl });
    const { error: submitError } = useProfileStore.getState();
    if (!submitError) {
      setIsCompanyMode(false);
      alert('¡Listo! Tu cuenta ahora es de tipo empresa', 'success');
    }
  };

  const displayName = useMemo(() => {
    return fullName.trim() || myProfile?.email || 'Editar perfil';
  }, [fullName, myProfile?.email]);

  const handleChangePassword = async () => {
    if (!newPassword || !currentPasswordForPwd) {
      alert('Completa la nueva contraseña y tu contraseña actual', 'error');
      return;
    }
    if (newPassword.length < 8) {
      alert('La nueva contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }
    await updateMyProfile({ password: newPassword, currentPassword: currentPasswordForPwd });
    const { error: submitError } = useProfileStore.getState();
    if (!submitError) {
      setNewPassword('');
      setCurrentPasswordForPwd('');
      setIsChangingPassword(false);
      alert('Contraseña actualizada correctamente', 'success');
    }
  };

  const avatarSrc = useMemo(() => {
    if (profile?.avatar) return profile.avatar;
    // Local 3D Avatars
    if (gender === 'Male') return '/images/avatar_male.png';
    if (gender === 'Female') return '/images/avatar_female.png';
    return '/images/avatar_male.png'; // Fallback
  }, [profile?.avatar, gender]);

  const coverSrc = profile?.coverImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop'; // Sleek Gradient Blue/Purple Professional background

  // Generate default username if empty
  useEffect(() => {
    if (myProfile && !myProfile.username && !username) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const baseName = (myProfile.email.split('@')[0] || 'user').replace(/[^a-zA-Z0-9]/g, '');
      setUsername(`${baseName}${randomSuffix}`);
    }
  }, [myProfile]);

  if (!auth) {
    return (
      <div className="bg-[#F9FAFC] min-h-[60vh]">
        <div className="max-w-[998px] mx-auto px-5 xl:px-10 py-10">
          <div className="bg-white border border-solid border-[#EDEFF5] rounded-2xl p-8 shadow-sm text-center">
            <h1 className="text-2xl font-bold text-[#212121]">Editar perfil</h1>
            <p className="text-[#666] mt-2">Inicia sesión para editar tu perfil.</p>
            <button
              onClick={() => setOpenAuth(true)}
              className="mt-6 bg-[#007FA4] text-white font-bold px-8 py-3 rounded-full"
            >
              Ingresar
            </button>
          </div>
        </div>
        <Auth openAuth={openAuth} setOpenAuth={setOpenAuth} />
      </div>
    );
  }

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
                <h1 className="text-2xl md:text-3xl font-black text-[#212121]">Editar perfil</h1>
                <p className="text-[#666] mt-1">{displayName}</p>
              </div>
              <Link href="/perfil" className="text-[#007FA4] font-bold">
                Volver
              </Link>
            </div>

            <div className="bg-white border border-solid border-[#EDEFF5] rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-[160px] md:h-[220px] bg-[#EEE]">
                <img
                  src={coverSrc}
                  alt="Portada"
                  className="w-full h-full object-cover"
                />
                <label className="absolute right-4 bottom-4 bg-white/90 border border-solid border-[#EDEFF5] text-[#007FA4] p-2 rounded-full cursor-pointer flex items-center justify-center" title="Cambiar portada">
                  <Icon icon="solar:pen-2-bold" width={18} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await uploadCover(file);
                      const { error: uploadError } = useProfileStore.getState();
                      if (uploadError) alert(uploadError, 'error');
                    }}
                  />
                </label>
              </div>

              <div className="px-6 md:px-8 pb-8">
                <div className="-mt-10 md:-mt-14 flex items-end gap-4 relative z-10">
                  <div className="relative w-24 h-24 md:w-28 md:h-28">
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white bg-[#F7F7F7]">
                      <img
                        src={avatarSrc}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="absolute right-0 bottom-0 bg-white border border-solid border-[#007FA4] text-[#007FA4] p-2 rounded-full cursor-pointer flex items-center justify-center" title="Cambiar avatar">
                      <Icon icon="solar:pen-2-bold" width={16} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          await uploadAvatar(file);
                          const { error: uploadError } = useProfileStore.getState();
                          if (uploadError) alert(uploadError, 'error');
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="font-bold text-[#444]">Nombre Completo</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nombre y Apellido"
                      className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#ddd] p-3 rounded-md"
                      type="text"
                    />
                  </div>

                  {/* Public Fields Group */}
                  <div>
                    <label className="font-bold text-[#444]">Nombre de usuario</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                      <input
                        value={username}
                        readOnly
                        disabled
                        className="w-full mt-2 bg-[#EDEFF5] text-[#888] outline-none border border-solid border-[#ddd] p-3 pl-8 rounded-md cursor-not-allowed"
                        type="text"
                      />
                    </div>
                    <p className="text-xs text-[#999] mt-1">No se puede modificar.</p>
                  </div>

                  <div>
                    <label className="font-bold text-[#444]">Correo electrónico</label>
                    <input
                      value={email}
                      readOnly
                      disabled
                      className="w-full mt-2 bg-[#EDEFF5] text-[#888] outline-none border border-solid border-[#ddd] p-3 rounded-md cursor-not-allowed"
                      type="email"
                    />
                    <p className="text-xs text-[#999] mt-1">No se puede modificar.</p>
                  </div>

                  <div>
                    <label className="font-bold text-[#444]">Género</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#ddd] p-3 rounded-md"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Male">Masculino</option>
                      <option value="Female">Femenino</option>
                      <option value="Other">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#444]">Fecha de nacimiento</label>
                    <input
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#ddd] p-3 rounded-md"
                      type="date"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-bold text-[#444]">Descripción</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#ddd] p-3 rounded-md min-h-[120px]"
                    />
                  </div>

                  <div className="md:col-span-2 mt-2 mb-1">
                    <div className="bg-[#F0F8FF] border border-[#B8E2F2] rounded-xl p-4 flex items-start gap-3">
                      <Icon icon="solar:info-circle-bold" className="text-[#007FA4] mt-0.5 flex-shrink-0" width={20} />
                      <p className="text-sm text-[#007FA4]">
                        La información de teléfono, país y ciudad es confidencial y no será expuesta públicamente.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#444]">Teléfono</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#ddd] p-3 rounded-md"
                      type="tel"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#444]">Ciudad</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#ddd] p-3 rounded-md"
                    >
                      <option value="">Seleccionar distrito</option>
                      {LIMA_DISTRICTS.map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-bold text-[#444]">País</label>
                    <input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#ddd] p-3 rounded-md"
                      type="text"
                    />
                  </div>
                </div>

                {/* Cambiar contraseña */}
                <div className="mt-8 border border-solid border-[#EDEFF5] rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-[#212121]">Contraseña</h3>
                      <p className="text-[#666] text-sm mt-1">Cambia la contraseña de tu cuenta.</p>
                    </div>
                    <button
                      onClick={() => setIsChangingPassword((v) => !v)}
                      className="text-[#007FA4] font-bold text-sm border border-solid border-[#007FA4] px-4 py-2 rounded-full"
                    >
                      {isChangingPassword ? 'Cancelar' : 'Cambiar contraseña'}
                    </button>
                  </div>

                  {isChangingPassword && (
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-[#444]">Nueva contraseña</label>
                        <input
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                          className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#ddd] p-3 rounded-md"
                          type="password"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#444]">Contraseña actual</label>
                        <input
                          value={currentPasswordForPwd}
                          onChange={(e) => setCurrentPasswordForPwd(e.target.value)}
                          placeholder="Confirma tu contraseña actual"
                          className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#ddd] p-3 rounded-md"
                          type="password"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button
                          disabled={isLoading}
                          onClick={handleChangePassword}
                          className={
                            isLoading
                              ? 'bg-[#007FA4]/60 text-white font-bold px-8 py-3 rounded-full cursor-not-allowed'
                              : 'bg-[#007FA4] text-white font-bold px-8 py-3 rounded-full'
                          }
                        >
                          Guardar contraseña
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Convertirse en empresa */}
                <div className="mt-8 border border-solid border-[#EDEFF5] rounded-2xl p-6">
                  {isCompany ? (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#E7F8EF] text-[#1D9A5D] rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon icon="solar:verified-check-bold" width={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#212121]">Cuenta empresa</h3>
                        <p className="text-[#666] text-sm mt-1">
                          {razonSocial || 'Tu cuenta ya está registrada como empresa'} {ruc && `· RUC ${ruc}`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-[#212121]">¿Tienes una empresa?</h3>
                          <p className="text-[#666] text-sm mt-1">Regístrala para poder publicar eventos.</p>
                        </div>
                        <button
                          onClick={() => setIsCompanyMode((v) => !v)}
                          className="text-[#007FA4] font-bold text-sm border border-solid border-[#007FA4] px-4 py-2 rounded-full"
                        >
                          {isCompanyMode ? 'Cancelar' : 'Convertirme en empresa'}
                        </button>
                      </div>

                      {isCompanyMode && (
                        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="font-bold text-[#444]">RUC</label>
                            <input
                              value={ruc}
                              onChange={(e) => setRuc(e.target.value)}
                              placeholder="20123456789"
                              maxLength={11}
                              className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#ddd] p-3 rounded-md"
                              type="text"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-[#444]">DNI (representante)</label>
                            <input
                              value={dni}
                              onChange={(e) => setDni(e.target.value)}
                              placeholder="12345678"
                              maxLength={8}
                              className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#ddd] p-3 rounded-md"
                              type="text"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="font-bold text-[#444]">Razón Social</label>
                            <input
                              value={razonSocial}
                              onChange={(e) => setRazonSocial(e.target.value)}
                              placeholder="Mi Empresa S.A.C."
                              className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#ddd] p-3 rounded-md"
                              type="text"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="font-bold text-[#444]">Ficha RUC (PDF o imagen)</label>
                            <input
                              onChange={(e) => setFichaRucFile(e.target.files?.[0] || null)}
                              accept=".pdf,image/*"
                              className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#ddd] p-3 rounded-md"
                              type="file"
                            />
                            {(fichaRucFile || fichaRucUrl) && (
                              <p className="text-sm text-[#1D9A5D] mt-2">
                                {fichaRucFile ? fichaRucFile.name : 'Ya tienes una ficha RUC subida'}
                              </p>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <button
                              disabled={isLoading}
                              onClick={handleBecomeCompany}
                              className={
                                isLoading
                                  ? 'bg-[#007FA4]/60 text-white font-bold px-8 py-3 rounded-full cursor-not-allowed'
                                  : 'bg-[#007FA4] text-white font-bold px-8 py-3 rounded-full'
                              }
                            >
                              Guardar y convertirme en empresa
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {error && (
                  <p className="mt-4 text-[#861F21] font-bold">{error}</p>
                )}

                <div className="mt-8 flex items-center gap-3">
                  <button
                    disabled={isLoading}
                    onClick={async () => {
                      if (!NAME_PATTERN.test(fullName)) {
                        alert('El nombre completo solo puede contener letras y espacios', 'error');
                        return;
                      }
                      const riskyField = [
                        ['Descripción', description],
                        ['Teléfono', phone],
                        ['País', country],
                      ].find(([, value]) => SQLI_PATTERN.test(value));
                      if (riskyField) {
                        alert(`El campo "${riskyField[0]}" contiene caracteres no permitidos`, 'error');
                        return;
                      }

                      const trimmedFullName = fullName.trim();
                      const spaceIdx = trimmedFullName.indexOf(' ');
                      const newFirstName = spaceIdx === -1 ? trimmedFullName : trimmedFullName.slice(0, spaceIdx);
                      const newLastName = spaceIdx === -1 ? '' : trimmedFullName.slice(spaceIdx + 1).trim();

                      await updateMyProfile({
                        firstName: newFirstName || undefined,
                        lastName: newLastName || undefined,
                        description: description || undefined,
                        phone: phone || undefined,
                        city: city || undefined,
                        country: country || undefined,
                        gender: gender || undefined,
                        birthDate: birthDate || undefined,
                      });
                      const { error } = useProfileStore.getState();
                      if (!error) {
                        setFirstName(newFirstName);
                        setLastName(newLastName);
                        alert('Perfil actualizado correctamente', 'success');
                      }
                    }}
                    className={
                      isLoading
                        ? 'bg-[#007FA4]/60 text-white font-bold px-8 py-3 rounded-full cursor-not-allowed'
                        : 'bg-[#007FA4] text-white font-bold px-8 py-3 rounded-full'
                    }
                  >
                    Guardar cambios
                  </button>
                  <Link
                    href="/perfil"
                    className="border border-solid border-[#007FA4] text-[#007FA4] font-bold px-8 py-3 rounded-full"
                  >
                    Cancelar
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24 self-start">
            <SidebarRight myProfile={myProfile} isLoading={isLoading} previewAvatar={avatarSrc} previewCover={coverSrc} />
          </div>

        </div>
        <Auth openAuth={openAuth} setOpenAuth={setOpenAuth} />
      </div>
    </div>
  );
}
