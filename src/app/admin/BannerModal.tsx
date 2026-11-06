'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

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

export { BannerModal };
