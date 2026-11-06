"use client";

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';

import Auth from '@/app/ui/Auth';
import useAlertStore from '@/app/zustand/alert';
import { useAuthStore } from '@/app/zustand/auth';
import { useCategoriesState } from '@/app/zustand/categories';
import { useEventCreateStore } from '@/app/zustand/eventCreate';
import { get } from '@/app/utils/fetch';
import ubigeoData from '@/data/ubigeo.json';
import { eventPath } from '@/app/utils/urls';

type DateForm = {
  date: string;
  startTime: string;
  endTime: string;
  price: string;
  capacity: string;
};

export default function CrearEventoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#666]">Cargando...</div>}>
      <CrearEventoContent />
    </Suspense>
  );
}

function CrearEventoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const { auth, me } = useAuthStore();
  const { countsCategories, getCategoriesCount } = useCategoriesState();
  const { createEvent, updateEvent, isSubmitting, error, reset } = useEventCreateStore();

  const [openAuth, setOpenAuth] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const isCompany = auth?.userType === 'COMPANY';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const [imageUrl, setImageUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [ticketUrls, setTicketUrls] = useState<{ name: string; url: string }[]>([{ name: '', url: '' }]);
  const [isFeatured, setIsFeatured] = useState(false);

  const [locationName, setLocationName] = useState('');
  const [department, setDepartment] = useState('Lima');
  const [province, setProvince] = useState('Lima');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [dates, setDates] = useState<DateForm[]>([
    { date: '', startTime: '', endTime: '', price: '', capacity: '' },
  ]);

  const categoryOptions = useMemo(() => {
    const list = Array.isArray(countsCategories) ? countsCategories : [];
    return list
      .map((c: any) => String(c?.nombreCategoria || c?.name || ''))
      .filter(Boolean);
  }, [countsCategories]);

  useEffect(() => {
    me();
    getCategoriesCount();
    return () => reset();
  }, []);

  // Load data for edit
  useEffect(() => {
    if (editId) {
      loadEventData(editId);
    }
  }, [editId]);

  const loadEventData = async (id: string) => {
    try {
      setIsLoadingData(true);
      const data: any = await get(`events/${id}`);
      if (data) {
        setTitle(data.title || '');
        setDescription(data.description || '');
        setCategory(data.category || '');
        setImageUrl(data.imageUrl || '');
        setWebsiteUrl(data.websiteUrl || data.bannerUrl || '');
        // Ticket URLs
        if (data.ticketUrls && Array.isArray(data.ticketUrls) && data.ticketUrls.length > 0) {
          setTicketUrls(data.ticketUrls);
        } else {
          setTicketUrls([{ name: '', url: '' }]);
        }
        setIsFeatured(data.isFeatured || false);

        // Dates
        if (data.dates && Array.isArray(data.dates)) {
          setDates(data.dates.map((d: any) => ({
            date: d.date ? d.date.split('T')[0] : '',
            startTime: d.startTime || '',
            endTime: d.endTime || '',
            price: d.price || '',
            capacity: d.capacity || ''
          })));
        }

        // Location
        if (data.location) {
          setLocationName(data.location.name || '');
          setDepartment(data.location.department || '');
          setProvince(data.location.province || '');
          setDistrict(data.location.district || '');
          setAddress(data.location.address || '');
          setLatitude(data.location.latitude || '');
          setLongitude(data.location.longitude || '');
        }
      }
    } catch (e) {
      console.error(e);
      useAlertStore.getState().alert('Error al cargar datos del evento', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Default category
  useEffect(() => {
    if (!category && categoryOptions.length > 0 && !editId) {
      setCategory(categoryOptions[0]);
    }
  }, [categoryOptions]);

  if (!auth) {
    return (
      <div className="bg-[#F9FAFC] min-h-[70vh] flex items-center justify-center px-5">
        <div className="w-full max-w-md bg-white border border-[#EDEFF5] rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#E0F2F7] rounded-full flex items-center justify-center text-[#007FA4] mx-auto mb-4">
            <Icon icon="solar:calendar-add-bold" width={30} />
          </div>
          <h1 className="text-2xl font-black text-[#212121]">Crear evento</h1>
          <p className="text-[#666] mt-2">Inicia sesión con una cuenta empresa para publicar eventos.</p>
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

  if (!isCompany) {
    return (
      <div className="bg-[#F9FAFC] min-h-[70vh] flex items-center justify-center px-5">
        <div className="w-full max-w-lg bg-white border border-[#EDEFF5] rounded-2xl p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#FAFBFF] border border-[#EDEFF5] rounded-2xl flex items-center justify-center text-[#007FA4] flex-shrink-0">
              <Icon icon="solar:shield-warning-bold" width={26} />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#212121]">Solo cuentas empresa</h1>
              <p className="text-[#666] mt-2">
                Para crear eventos debes iniciar sesión con una cuenta tipo <strong>Empresa</strong>.
              </p>
              <div className="mt-5 flex gap-3">
                <Link
                  href="/perfil"
                  className="border border-solid border-[#007FA4] text-[#007FA4] font-bold px-6 py-2.5 rounded-full"
                >
                  Volver
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const t = title.trim();
    const d = description.trim();
    if (!t) return 'Título requerido';
    if (!category) return 'Categoría requerida';
    if (!d) return 'Descripción requerida';

    const validDates = dates.filter((x) => x.date.trim());
    if (validDates.length === 0) return 'Agrega al menos una fecha';

    if (!latitude || !longitude) return 'La ubicación (latitud y longitud) es obligatoria';

    return null;
  };

  return (
    <div className="bg-[#F9FAFC] min-h-screen py-8">
      <div className="max-w-[998px] mx-auto px-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#212121]">{editId ? 'Editar evento' : 'Crear evento'}</h1>
            <p className="text-[#666] mt-1">{editId ? 'Modifica los datos del evento.' : 'Publica un evento completo para que se vea igual al detalle.'}</p>
          </div>
          <Link href="/perfil" className="text-[#007FA4] font-bold">Volver</Link>
        </div>

        {error && (
          <div className="bg-white border border-solid border-[#EDEFF5] rounded-2xl p-4 mb-6">
            <p className="text-[#861F21] font-bold">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white border border-solid border-[#EDEFF5] rounded-2xl p-6 shadow-sm">
          {/* Basic */}
          <h2 className="font-black text-[#212121] text-lg mb-4">Información</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[12px] font-bold text-[#666]">Título</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl"
                placeholder="Ej: Concierto en vivo en Barranco"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#666]">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl"
              >
                {categoryOptions.length > 0 ? categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                )) : (
                  <option value="">Cargando...</option>
                )}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="featured"
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="featured" className="text-sm font-bold text-[#212121]">Destacado</label>
            </div>

            <div className="md:col-span-2">
              <label className="text-[12px] font-bold text-[#666]">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl min-h-[140px]"
                placeholder="Describe el evento (puedes usar saltos de línea)."
              />
            </div>
          </div>

          {/* Media */}
          <div className="mt-8 pt-8 border-t border-[#EDEFF5]">
            <h2 className="font-black text-[#212121] text-lg mb-4">Imágenes y links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-bold text-[#666]">Imagen principal (URL)</label>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#666]">URL Fuente Principal</label>
                <input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl"
                  placeholder="https://..."
                />
              </div>
              {/* Multiple Ticket URLs */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12px] font-bold text-[#666]">Links de entradas / fuentes</label>
                  <button
                    type="button"
                    onClick={() => setTicketUrls(prev => [...prev, { name: '', url: '' }])}
                    className="text-[#007FA4] font-bold text-sm hover:underline"
                  >
                    + Agregar link
                  </button>
                </div>
                <div className="space-y-3">
                  {ticketUrls.map((link, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select
                        value={link.name}
                        onChange={(e) => setTicketUrls(prev => prev.map((l, i) => i === idx ? { ...l, name: e.target.value } : l))}
                        className="w-1/3 bg-[#F7F7F7] outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl"
                      >
                        <option value="" disabled>Plataforma</option>
                        <option value="Joinnus">Joinnus</option>
                        <option value="Teleticket">Teleticket</option>
                        <option value="Ticketmaster">Ticketmaster</option>
                        <option value="Instagram">Instagram</option>
                        <option value="TikTok">TikTok</option>
                        <option value="Facebook">Facebook</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Web">Web</option>
                        <option value="Otro">Otro</option>
                      </select>
                      <input
                        value={link.url}
                        onChange={(e) => setTicketUrls(prev => prev.map((l, i) => i === idx ? { ...l, url: e.target.value } : l))}
                        className="flex-1 bg-[#F7F7F7] outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl"
                        placeholder="https://..."
                      />
                      {ticketUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setTicketUrls(prev => prev.filter((_, i) => i !== idx))}
                          className="text-[#861F21] font-bold text-sm"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="mt-8 pt-8 border-t border-[#EDEFF5]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black text-[#212121] text-lg">Fechas y precios</h2>
              <button
                type="button"
                onClick={() => setDates((prev) => [...prev, { date: '', startTime: '', endTime: '', price: '', capacity: '' }])}
                className="text-[#007FA4] font-bold text-sm hover:underline"
              >
                + Agregar fecha
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {dates.map((d, idx) => (
                <div key={idx} className="bg-[#FAFBFF] border border-[#EDEFF5] rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <p className="font-bold text-[#212121]">Fecha #{idx + 1}</p>
                    {dates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setDates((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-[#861F21] font-bold text-sm"
                      >
                        Quitar
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="md:col-span-2">
                      <label className="text-[12px] font-bold text-[#666]">Fecha</label>
                      <input
                        type="date"
                        value={d.date}
                        onChange={(e) => setDates((prev) => prev.map((x, i) => i === idx ? { ...x, date: e.target.value } : x))}
                        className="w-full mt-2 bg-white outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-[#666]">Inicio</label>
                      <input
                        type="time"
                        value={d.startTime}
                        onChange={(e) => setDates((prev) => prev.map((x, i) => i === idx ? { ...x, startTime: e.target.value } : x))}
                        className="w-full mt-2 bg-white outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-[#666]">Fin</label>
                      <input
                        type="time"
                        value={d.endTime}
                        onChange={(e) => setDates((prev) => prev.map((x, i) => i === idx ? { ...x, endTime: e.target.value } : x))}
                        className="w-full mt-2 bg-white outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-[#666]">Precio</label>
                      <input
                        type="number"
                        value={d.price}
                        onChange={(e) => setDates((prev) => prev.map((x, i) => i === idx ? { ...x, price: e.target.value } : x))}
                        className="w-full mt-2 bg-white outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl"
                        placeholder="0"
                      />
                    </div>
                    {/* <div>
                      <label className="text-[12px] font-bold text-[#666]">Capacidad</label>
                      <input
                        type="number"
                        value={d.capacity}
                        onChange={(e) => setDates((prev) => prev.map((x, i) => i === idx ? { ...x, capacity: e.target.value } : x))}
                        className="w-full mt-2 bg-white outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl"
                        placeholder="100"
                      />
                    </div> */}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="mt-8 pt-8 border-t border-[#EDEFF5]">
            <h2 className="font-black text-[#212121] text-lg mb-4">Ubicación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[12px] font-bold text-[#666]">Nombre del lugar</label>
                <input
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl"
                  placeholder="Ej: Teatro Municipal"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#666]">Departamento</label>
                <select
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    setProvince('');
                    setDistrict('');
                  }}
                  className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl"
                >
                  <option value="">Selecciona</option>
                  {Object.keys(ubigeoData).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#666]">Provincia</label>
                <select
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setDistrict('');
                  }}
                  disabled={!department}
                  className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl disabled:opacity-50"
                >
                  <option value="">Selecciona</option>
                  {department && (ubigeoData as any)[department] && Object.keys((ubigeoData as any)[department]).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#666]">Distrito</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!province}
                  className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl disabled:opacity-50"
                >
                  <option value="">Selecciona</option>
                  {department && province && (ubigeoData as any)[department]?.[province] && (ubigeoData as any)[department][province].map((d: string) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#666]">Dirección</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl"
                  placeholder="Av. ..."
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#666]">Latitud (obligatorio)</label>
                <input
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl"
                  placeholder="-12.1234"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#666]">Longitud (obligatorio)</label>
                <input
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full mt-2 bg-[#F7F7F7] outline-none border border-solid border-[#EDEFF5] p-3 rounded-xl"
                  placeholder="-77.1234"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-8 border-t border-[#EDEFF5] flex items-center justify-between gap-3">
            <Link
              href="/perfil"
              className="border border-solid border-[#007FA4] text-[#007FA4] font-bold px-8 py-3 rounded-full"
            >
              Cancelar
            </Link>
            <button
              disabled={isSubmitting || isLoadingData}
              onClick={async () => {
                const errorMsg = validate();
                if (errorMsg) {
                  useAlertStore.getState().alert(errorMsg, 'error');
                  return;
                }

                const validDates = dates.filter((x) => x.date.trim());

                const payload: any = {
                  title: title.trim(),
                  description: description.trim(),
                  category,
                  imageUrl: imageUrl.trim() || undefined,
                  websiteUrl: websiteUrl.trim() || undefined,
                  ticketUrls: ticketUrls.filter(t => t.url.trim()).map(t => ({ name: t.name.trim() || 'Entradas', url: t.url.trim() })),
                  isFeatured,
                  dates: validDates.map((x) => ({
                    date: x.date,
                    startTime: x.startTime || undefined,
                    endTime: x.endTime || undefined,
                    price: x.price !== '' ? Number(x.price) : undefined,
                    capacity: x.capacity !== '' ? Number(x.capacity) : undefined,
                  })),
                  locationName: locationName.trim() || undefined,
                  department: department.trim() || undefined,
                  province: province.trim() || undefined,
                  district: district.trim() || undefined,
                  address: address.trim() || undefined,
                  latitude: latitude !== '' ? Number(latitude) : undefined,
                  longitude: longitude !== '' ? Number(longitude) : undefined,
                };

                let resp;
                if (editId) {
                  resp = await updateEvent(editId, payload);
                } else {
                  resp = await createEvent(payload);
                }

                if (resp?.id) {
                  useAlertStore.getState().alert(editId ? 'Evento actualizado correctamente' : 'Evento creado correctamente', 'success');

                  // Navigate to detail page
                  const dateId = resp?.dates?.[0]?.id;
                  if (dateId) {
                    router.push(eventPath(resp.id, resp.title, dateId));
                  } else {
                    router.push('/perfil');
                  }
                }
              }}
              className={
                isSubmitting || isLoadingData
                  ? 'bg-[#007FA4]/60 text-white font-bold px-10 py-3 rounded-full cursor-not-allowed'
                  : 'bg-[#007FA4] text-white font-bold px-10 py-3 rounded-full hover:bg-[#006080] transition-colors'
              }
            >
              {isSubmitting ? (editId ? 'Guardando...' : 'Publicando...') : (editId ? 'Guardar cambios' : 'Publicar evento')}
            </button >
          </div >
        </div >
      </div >
    </div >
  );
}
