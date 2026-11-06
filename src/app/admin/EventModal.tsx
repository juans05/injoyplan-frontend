'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import ubigeoData from '@/data/ubigeo.json';

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

export { EventModal };
