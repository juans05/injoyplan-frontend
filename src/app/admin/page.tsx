'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '../zustand/auth';
import useDebounce from '../hooks/useDebounce';
import ubigeoData from '@/data/ubigeo.json';

// --- Components ---

const SidebarItem = ({ icon, label, active, onClick }: { icon: string, label: string, active?: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3 border-r-[4px] transition-all duration-200 group ${active
            ? 'border-[#277FA4] text-[#277FA4] font-bold bg-[#E0F2F7]/50'
            : 'border-transparent text-slate-400 hover:text-[#277FA4] font-medium'
            }`}
    >
        <Icon icon={icon} width={24} className={`${active ? 'text-[#277FA4]' : 'text-slate-400 group-hover:text-[#277FA4]'}`} />
        <span>{label}</span>
    </button>
);

const StatCard = ({ icon, title, value, subtitle, trend }: { icon: string, title: string, value: string | number, subtitle: string, trend?: 'up' | 'down' }) => (
    <div className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm border border-slate-100">
        <div className="w-14 h-14 rounded-full bg-[#E0F2F7] flex items-center justify-center text-[#277FA4]">
            <Icon icon={icon} width={32} />
        </div>
        <div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <h3 className="text-slate-800 text-2xl font-bold">{value}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1">
                {trend === 'up' && <span className="text-[#05CD99] font-bold flex items-center"><Icon icon="solar:arrow-up-linear" /> +2.4%</span>}
                <span className="font-medium">{subtitle}</span>
            </p>
        </div>
    </div>
);

const BarChartMock = () => (
    <div className="flex items-end justify-between h-[200px] w-full gap-2 mt-4 px-2">
        {[40, 70, 30, 85, 50, 90, 60].map((h, i) => (
            <div key={i} className="w-full bg-[#E0F2F7] rounded-t-lg relative group h-full flex items-end">
                <div
                    className="w-full bg-[#277FA4] rounded-t-lg transition-all duration-500 hover:bg-[#1a5c7a]"
                    style={{ height: `${h}%` }}
                ></div>
            </div>
        ))}
    </div>
);

// --- Modal Component ---

const BannerModal = ({ isOpen, onClose, onSave, initialData }: any) => {
    const [formData, setFormData] = useState({
        title: '', imageUrl: '', link: '', categoria: '', direccion: '', urlFuente: '', idRow: '', fecha: '', horaInicio: '', horaFin: '', isActive: true
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                imageUrl: initialData.imageUrl || '',
                link: initialData.link || '',
                categoria: initialData.categoria || '',
                direccion: initialData.direccion || '',
                urlFuente: initialData.urlFuente || '',
                idRow: initialData.idRow || '',
                fecha: initialData.fecha ? initialData.fecha.split('T')[0] : '',
                horaInicio: initialData.horaInicio || '',
                horaFin: initialData.horaFin || '',
                isActive: initialData.isActive ?? true
            });
            setPreviewUrl(initialData.imageUrl || null);
        } else {
            setFormData({ title: '', imageUrl: '', link: '', categoria: '', direccion: '', urlFuente: '', idRow: '', fecha: '', horaInicio: '', horaFin: '', isActive: true });
            setPreviewUrl(null);
        }
        setSelectedFile(null);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        onSave(formData, selectedFile);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[20px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-slate-800 text-xl font-bold">{initialData ? 'Editar Banner' : 'Nuevo Banner'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800">
                        <Icon icon="solar:close-circle-bold" width={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex justify-center mb-4">
                        <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center group hover:border-[#4318FF] transition-colors">
                            {previewUrl ? (
                                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <Icon icon="solar:camera-add-bold" width={40} className="mx-auto mb-2" />
                                    <p>Subir Imagen</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-1">Título</label>
                            <input required name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800" placeholder="Título del banner" />
                        </div>
                        {/* Image URL legacy input hidden or removed, using file upload now */}

                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-1">Enlace (Opcional)</label>
                            <input name="link" value={formData.link} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800" placeholder="/evento/..." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-1">Categoría</label>
                            <input name="categoria" value={formData.categoria} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800" placeholder="Ej: Concierto" />
                        </div>

                        {/* New Fields */}
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-1">Fecha</label>
                            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-1">Dirección</label>
                            <input name="direccion" value={formData.direccion} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800" placeholder="Lugar del evento" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-1">Hora Inicio</label>
                            <input type="time" name="horaInicio" value={formData.horaInicio} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-1">Hora Fin</label>
                            <input type="time" name="horaFin" value={formData.horaFin} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-1">URL Fuente (Origen)</label>
                            <input name="urlFuente" value={formData.urlFuente} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800" placeholder="https://ticketera.com..." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-1">ID Row (Ref Ext)</label>
                            <input name="idRow" value={formData.idRow} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800" placeholder="ID Externo" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="activeCheck" className="w-5 h-5 text-[#277FA4] rounded focus:ring-0" />
                        <label htmlFor="activeCheck" className="text-slate-800 font-bold">Banner Activo</label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
                        <button type="submit" className="px-8 py-3 rounded-xl bg-[#277FA4] text-white font-bold hover:bg-[#206a8a] transition-colors shadow-lg">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Event Modal Component ---

type DateEntry = { date: string; startTime: string; endTime: string; price: string; id?: string };

const EventModal = ({ isOpen, onClose, onSave, categories, initialData }: any) => {
    const [formData, setFormData] = useState<{
        title: string; description: string; category: string; imageUrl: string; websiteUrl: string; isFeatured: boolean; isBanner: boolean;
        locationName: string; department: string; province: string; district: string; address: string; latitude: string; longitude: string;
    }>({
        title: '', description: '', category: '', imageUrl: '', websiteUrl: '', isFeatured: false, isBanner: false,
        locationName: '', department: 'Lima', province: 'Lima', district: '', address: '', latitude: '', longitude: ''
    });
    const [ticketUrls, setTicketUrls] = useState<{ name: string; url: string }[]>([{ name: '', url: '' }]);
    const [dates, setDates] = useState<DateEntry[]>([{ date: '', startTime: '', endTime: '', price: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Editing mode - populate with existing data
                setFormData({
                    title: initialData.title || '',
                    description: initialData.description || '',
                    category: initialData.category || categories?.[0] || '',
                    imageUrl: initialData.imageUrl || '',
                    websiteUrl: initialData.websiteUrl || initialData.bannerUrl || '',
                    isFeatured: initialData.isFeatured || false,
                    isBanner: initialData.isBanner || false,
                    locationName: initialData.location?.name || '',
                    department: initialData.location?.department || 'Lima',
                    province: initialData.location?.province || 'Lima',
                    district: initialData.location?.district || '',
                    address: initialData.location?.address || '',
                    latitude: initialData.location?.latitude || '',
                    longitude: initialData.location?.longitude || ''
                });
                // Ticket URLs
                if (initialData.ticketUrls && Array.isArray(initialData.ticketUrls) && initialData.ticketUrls.length > 0) {
                    setTicketUrls(initialData.ticketUrls);
                } else {
                    setTicketUrls([{ name: '', url: '' }]);
                }

                // Populate dates
                if (initialData.dates && initialData.dates.length > 0) {
                    setDates(initialData.dates.map((d: any) => ({
                        id: d.id,
                        date: d.date ? d.date.split('T')[0] : '',
                        startTime: d.startTime || '',
                        endTime: d.endTime || '',
                        price: d.price?.toString() || ''
                    })));
                } else {
                    setDates([{ date: '', startTime: '', endTime: '', price: '' }]);
                }
            } else {
                // Creating mode - reset
                setFormData({
                    title: '', description: '', category: categories?.[0] || '', imageUrl: '', websiteUrl: '', isFeatured: false, isBanner: false,
                    locationName: '', department: 'Lima', province: 'Lima', district: '', address: '', latitude: '', longitude: ''
                });
                setTicketUrls([{ name: '', url: '' }]);
                setDates([{ date: '', startTime: '', endTime: '', price: '' }]);
            }
        }
    }, [isOpen, initialData, categories]);

    if (!isOpen) return null;

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleDateChange = (index: number, field: string, value: string) => {
        setDates(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));
    };

    const addDate = () => {
        setDates(prev => [...prev, { date: '', startTime: '', endTime: '', price: '' }]);
    };

    const removeDate = (index: number) => {
        if (dates.length > 1) {
            setDates(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = {
            ...formData,
            ticketUrls: ticketUrls.filter(t => t.url.trim()).map(t => ({ name: t.name.trim() || 'Entradas', url: t.url.trim() })),
            dates: dates.filter(d => d.date),
            isEdit: !!initialData,
            eventId: initialData?.id,
            // Ensure lat/lng are numbers or undefined
            latitude: formData.latitude ? Number(formData.latitude) : undefined,
            longitude: formData.longitude ? Number(formData.longitude) : undefined
        };
        await onSave(payload);
        setIsSubmitting(false);
    };

    const isEditing = !!initialData;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[20px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-slate-800 text-xl font-bold">{isEditing ? 'Editar Evento' : 'Nuevo Evento'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800">
                        <Icon icon="solar:close-circle-bold" width={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div>
                        <h3 className="text-slate-800 font-bold mb-3">Información Básica</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-800 mb-1">Título *</label>
                                <input required name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800" placeholder="Título del evento" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Categoría *</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800">
                                    {(categories || []).map((c: string) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} id="featuredCheck" className="w-5 h-5 text-[#277FA4] rounded" />
                                <label htmlFor="featuredCheck" className="text-slate-800 font-bold">Destacado</label>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" name="isBanner" checked={formData.isBanner} onChange={handleChange} id="bannerCheck" className="w-5 h-5 text-[#277FA4] rounded" />
                                <label htmlFor="bannerCheck" className="text-slate-800 font-bold">Banner Principal</label>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-800 mb-1">Descripción *</label>
                                <textarea required name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800 min-h-[80px]" placeholder="Descripción del evento" />
                            </div>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-slate-800 font-bold mb-3">Imágenes y Enlaces</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Imagen principal (URL)</label>
                                <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800" placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">URL Fuente Principal</label>
                                <input name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800" placeholder="https://..." />
                            </div>
                            {/* Multiple Ticket URLs */}
                            <div className="md:col-span-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-slate-800 mb-1">Links de entradas / fuentes</label>
                                    <button
                                        type="button"
                                        onClick={() => setTicketUrls(prev => [...prev, { name: '', url: '' }])}
                                        className="text-[#277FA4] font-bold text-sm hover:underline"
                                    >
                                        + Agregar link
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {ticketUrls.map((link, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            {(() => {
                                                const knownPlatforms = ['Joinnus', 'Teleticket', 'Ticketmaster', 'Instagram', 'TikTok', 'Facebook', 'WhatsApp', 'Web'];
                                                const isCustom = link.name && !knownPlatforms.includes(link.name);

                                                if (isCustom) {
                                                    return (
                                                        <div className="w-1/3 flex gap-1">
                                                            <input
                                                                value={link.name === 'Otro' ? '' : link.name}
                                                                onChange={(e) => setTicketUrls(prev => prev.map((l, i) => i === idx ? { ...l, name: e.target.value } : l))}
                                                                className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800"
                                                                placeholder="Plataforma..."
                                                                autoFocus
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setTicketUrls(prev => prev.map((l, i) => i === idx ? { ...l, name: 'Web' } : l))}
                                                                className="text-slate-400 hover:text-slate-600 px-1"
                                                            >
                                                                <Icon icon="solar:list-bold" width={20} />
                                                            </button>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <select
                                                        value={link.name}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            // If 'Otro' selected, we want to clear name to allow typing, but keep placeholder
                                                            // We set it to 'Otro' initially to trigger isCustom logic?
                                                            // Actually, 'Otro' is not in knownPlatforms, so it becomes custom.
                                                            setTicketUrls(prev => prev.map((l, i) => i === idx ? { ...l, name: val } : l));
                                                        }}
                                                        className="w-1/3 px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800"
                                                    >
                                                        <option value="" disabled>Plataforma</option>
                                                        {knownPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                                                        <option value="Otro">Otro / Escribir...</option>
                                                    </select>
                                                );
                                            })()}
                                            <input
                                                value={link.url}
                                                onChange={(e) => setTicketUrls(prev => prev.map((l, i) => i === idx ? { ...l, url: e.target.value } : l))}
                                                className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800"
                                                placeholder="https://..."
                                            />
                                            {ticketUrls.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setTicketUrls(prev => prev.filter((_, i) => i !== idx))}
                                                    className="text-[#E31A1A] font-bold text-sm"
                                                >
                                                    <Icon icon="solar:trash-bin-trash-bold" width={20} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dates - Multiple */}
                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-slate-800 font-bold">Fechas ({dates.length})</h3>
                            <button type="button" onClick={addDate} className="text-[#277FA4] font-bold text-sm hover:underline">+ Agregar fecha</button>
                        </div>
                        <div className="space-y-3 max-h-[200px] overflow-y-auto">
                            {dates.map((d, idx) => (
                                <div key={idx} className="bg-slate-50 p-3 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-800 text-xs font-bold">Fecha #{idx + 1}</span>
                                        {dates.length > 1 && <button type="button" onClick={() => removeDate(idx)} className="text-[#E31A1A] text-xs font-bold">Quitar</button>}
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        <input type="date" value={d.date} onChange={(e) => handleDateChange(idx, 'date', e.target.value)} className="px-3 py-2 rounded-lg bg-white border-none outline-none text-slate-800 text-sm" />
                                        <input type="time" value={d.startTime} onChange={(e) => handleDateChange(idx, 'startTime', e.target.value)} className="px-3 py-2 rounded-lg bg-white border-none outline-none text-slate-800 text-sm" placeholder="Inicio" />
                                        <input type="time" value={d.endTime} onChange={(e) => handleDateChange(idx, 'endTime', e.target.value)} className="px-3 py-2 rounded-lg bg-white border-none outline-none text-slate-800 text-sm" placeholder="Fin" />
                                        <input type="number" value={d.price} onChange={(e) => handleDateChange(idx, 'price', e.target.value)} className="px-3 py-2 rounded-lg bg-white border-none outline-none text-slate-800 text-sm" placeholder="S/" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-slate-800 font-bold mb-3">Ubicación</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-800 mb-1">Nombre del lugar</label>
                                <input name="locationName" value={formData.locationName} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800" placeholder="Ej: Teatro Municipal" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Departamento</label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, department: e.target.value, province: '', district: '' }));
                                    }}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800"
                                >
                                    <option value="">Selecciona</option>
                                    {Object.keys(ubigeoData).map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Provincia</label>
                                <select
                                    name="province"
                                    value={formData.province}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, province: e.target.value, district: '' }));
                                    }}
                                    disabled={!formData.department}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800 disabled:opacity-50"
                                >
                                    <option value="">Selecciona</option>
                                    {formData.department && (ubigeoData as any)[formData.department] && Object.keys((ubigeoData as any)[formData.department]).map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Distrito</label>
                                <select
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    disabled={!formData.province}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800 disabled:opacity-50"
                                >
                                    <option value="">Selecciona</option>
                                    {formData.department && formData.province && (ubigeoData as any)[formData.department]?.[formData.province] && (ubigeoData as any)[formData.department][formData.province].map((d: string) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Dirección</label>
                                <input name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800" placeholder="Av. ..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Latitud</label>
                                <input name="latitude" value={formData.latitude} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800" placeholder="-12.1234" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Longitud</label>
                                <input name="longitude" value={formData.longitude} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border-none outline-none text-slate-800" placeholder="-77.1234" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-colors ${isSubmitting ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#277FA4] hover:bg-[#206a8a]'}`}>
                            {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Evento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[20px] w-full max-w-md shadow-2xl p-6 text-center">
                <div className="w-16 h-16 bg-[#FFEAEA] text-[#E31A1A] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon icon="solar:trash-bin-trash-bold" width={32} />
                </div>
                <h3 className="text-slate-800 text-xl font-bold mb-2">{title}</h3>
                <p className="text-slate-400 mb-6">{message}</p>
                <div className="flex justify-center gap-3">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl text-slate-400 font-bold hover:bg-gray-100 transition-colors">Cancelar</button>
                    <button onClick={onConfirm} className="px-8 py-3 rounded-xl bg-[#E31A1A] text-white font-bold hover:bg-[#CC1010] shadow-lg transition-colors">Sí, Eliminar</button>
                </div>
            </div>
        </div>
    );
};


export default function AdminPage() {
    const router = useRouter();
    const { auth, me } = useAuthStore();
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

    // Auth check
    useEffect(() => {
        me();
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            // Basic role check
            if (auth && (auth as any).role !== 'ADMIN') {
                router.push('/');
            }
            if (auth && (auth as any).role === 'ADMIN') {
                setLoading(false);
                fetchData();
            }
        };
        checkAuth();
    }, [auth]);

    // Refetch when filters change
    useEffect(() => {
        if (!loading && auth && (auth as any).role === 'ADMIN') {
            fetchEvents(1);
        }
    }, [filterStatus, filterFeatured, debouncedSearch]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4201';

    const handleDeleteAllEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/events/all`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                // const data = await res.json();
                fetchEvents(1);
                fetchData(); // Reload stats
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            } else {
                console.error('Error deleting events');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openConfirmDeleteAll = () => {
        setConfirmModal({
            isOpen: true,
            title: '¿Estás seguro?',
            message: 'Esta acción ELIMINARÁ TODOS los eventos de la base de datos permanentemente. Se recomienda tener un respaldo.',
            onConfirm: handleDeleteAllEvents
        });
    }

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [statsRes, usersRes, bannersRes, categoriesRes] = await Promise.all([
                fetch(`${API_URL}/admin/stats`, { headers }).then(r => r.json()),
                fetch(`${API_URL}/admin/users?limit=10`, { headers }).then(r => r.json()),
                fetch(`${API_URL}/admin/banners`, { headers }).then(r => r.json()),
                fetch(`${API_URL}/events/stats/by-category`, { headers }).then(r => r.json()).catch(() => [])
            ]);
            setStats(statsRes);
            setUsers(usersRes.users || []);
            setBanners(bannersRes || []);
            const catsArray = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes?.data || categoriesRes?.categories || []);
            const cats = catsArray.map((c: any) => c?.nombreCategoria || c?.name || c?.category || '').filter(Boolean);
            setCategories(cats.length > 0 ? cats : ['Conciertos', 'Teatro', 'Ferias', 'Deportes', 'Gastronomía']);
            // Fetch events separately with pagination
            await fetchEvents(1);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchEvents = async (page: number) => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            // Build URL with filters
            let url = `${API_URL}/events?limit=24&page=${page}&status=${filterStatus}`;
            if (filterFeatured === 'featured') url += `&isFeatured=true`;
            if (filterFeatured === 'standard') url += `&isFeatured=false`;
            if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;

            const eventsRes = await fetch(url, { headers }).then(r => r.json());
            const list = Array.isArray(eventsRes?.data) ? eventsRes.data : Array.isArray(eventsRes?.events) ? eventsRes.events : Array.isArray(eventsRes) ? eventsRes : [];
            setEvents(list);
            setEventsTotal(eventsRes?.total || list.length || 0);
            setEventsPage(page);
            if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            console.error(e);
        }
    };

    const getToken = () => localStorage.getItem('token');

    const toggleUserRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
        await fetch(`${API_URL}/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify({ role: newRole }),
        });
        fetchData();
    };

    const toggleBannerActive = async (bannerId: string, isActive: boolean) => {
        await fetch(`${API_URL}/admin/banners/${bannerId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify({ isActive: !isActive }),
        });
        fetchData();
    };

    const deleteBanner = (bannerId: string) => {
        setConfirmModal({
            isOpen: true,
            title: '¿Eliminar Banner?',
            message: 'Esta acción no se puede deshacer. El banner dejará de ser visible para los usuarios.',
            onConfirm: async () => {
                await fetch(`${API_URL}/admin/banners/${bannerId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                fetchData();
            }
        });
    };

    const handleSaveBanner = async (data: any, file: File | null) => {
        const url = editingBanner
            ? `${API_URL}/admin/banners/${editingBanner.id}`
            : `${API_URL}/admin/banners`;

        const method = editingBanner ? 'PATCH' : 'POST';

        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        if (file) {
            formData.append('file', file);
        }

        try {
            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${getToken()}` }, // No Content-Type, browsers sets it
                body: formData,
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingBanner(null);
                fetchData();
            } else {
                const error = await res.json();
                alert(`Error al guardar banner: ${error.message || 'Desconocido'}`);
            }
        } catch (e) {
            console.error(e);
            alert('Error al guardar banner');
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
    const user = auth as any;

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
                                localStorage.removeItem('token');
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
                            {user?.profile?.avatar ? <img src={user.profile.avatar} className="w-full h-full object-cover" /> : (user?.profile?.firstName?.[0] || 'A')}
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
                                        {banner.imageUrl && <img src={banner.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />}
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
                                            if (!file) return;
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                                const res = await fetch(`${API_URL}/admin/events/import`, {
                                                    method: 'POST',
                                                    headers: { Authorization: `Bearer ${getToken()}` },
                                                    body: formData,
                                                });
                                                if (res.ok) {
                                                    const result = await res.json();
                                                    alert(`Importados ${result.count || 0} eventos`);
                                                    fetchEvents(1);
                                                } else {
                                                    const err = await res.json();
                                                    alert(`Error: ${err.message || 'No se pudo importar'}`);
                                                }
                                            } catch (err) {
                                                alert('Error al subir archivo');
                                            }
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
                                            {event.imageUrl && <img src={event.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />}
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
                                                    onClick={async () => {
                                                        await fetch(`${API_URL}/events/${event.id}/toggle-status`, { method: 'PATCH', headers: { Authorization: `Bearer ${getToken()}` } });
                                                        fetchEvents(eventsPage);
                                                    }}
                                                    className="text-[#277FA4] bg-[#E0F2F7] p-1.5 rounded-lg hover:bg-[#D6D6FF]"
                                                    title={event.isActive ? 'Desactivar' : 'Activar'}
                                                >
                                                    <Icon icon={event.isActive ? "solar:eye-linear" : "solar:eye-closed-linear"} width={14} />
                                                </button>
                                                <button
                                                    onClick={async () => { if (!confirm('¿Eliminar?')) return; await fetch(`${API_URL}/events/${event.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } }); fetchEvents(eventsPage); }}
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
                                                                {event.imageUrl && <img src={event.imageUrl} className="w-full h-full object-cover" />}
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
                                                                onClick={async () => {
                                                                    await fetch(`${API_URL}/events/${event.id}/toggle-status`, { method: 'PATCH', headers: { Authorization: `Bearer ${getToken()}` } });
                                                                    fetchEvents(eventsPage);
                                                                }}
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
                        const url = isEdit ? `${API_URL}/events/${data.eventId}` : `${API_URL}/events`;
                        const method = isEdit ? 'PATCH' : 'POST';

                        const res = await fetch(url, {
                            method,
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${getToken()}`
                            },
                            body: JSON.stringify(payload)
                        });
                        if (res.ok) {
                            setIsEventModalOpen(false);
                            setEditingEvent(null);
                            fetchEvents(eventsPage);
                        } else {
                            const err = await res.json();
                            alert(`Error: ${err.message || 'No se pudo guardar el evento'}`);
                        }
                    } catch (e) {
                        alert('Error al guardar evento');
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
