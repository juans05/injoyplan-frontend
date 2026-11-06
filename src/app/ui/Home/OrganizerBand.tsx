"use client";
import { Icon } from '@iconify/react';
import usePublishEvent from '@/app/hooks/usePublishEvent';
import { useAuthStore } from '@/app/zustand/auth';

const STEPS = [
    { icon: 'solar:user-plus-linear', text: 'Crea tu cuenta en Injoyplan' },
    { icon: 'solar:buildings-2-linear', text: 'Regístrate como empresa organizadora' },
    { icon: 'solar:calendar-add-linear', text: 'Publica tus fechas, precios y enlaces de venta' },
];

// The one place the granate logo color fills a whole band
const OrganizerBand = () => {
    const publish = usePublishEvent();
    const { auth } = useAuthStore();
    const cta = auth?.userType === 'COMPANY' ? 'Publicar un evento' : 'Publica tu evento';

    return (
        <section className="section" aria-labelledby="org-title">
            <div className="container-page">
                <div className="grid gap-8 rounded-panel bg-brand-wine px-6 py-10 text-white md:grid-cols-2 md:items-center md:px-12 md:py-14">
                    <div>
                        <h2 id="org-title" className="text-h2 text-white">¿Organizas eventos? Haz que más personas descubran tus experiencias</h2>
                        <p className="mt-4 max-w-md text-lead text-white/85">Publica en Injoyplan y llega a quienes buscan qué hacer cerca de ellos.</p>
                        <button type="button" onClick={publish} className="btn btn-lg mt-8 bg-white text-brand-wine hover:bg-brand-mist">{cta}</button>
                    </div>
                    {/* A real three-step sequence, so the order matters */}
                    <ol className="space-y-3">
                        {STEPS.map((s, i) => (
                            <li key={s.text} className="flex items-center gap-4 rounded-card bg-white/10 p-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-label font-bold text-brand-wine">{i + 1}</span>
                                <span className="text-body font-semibold">{s.text}</span>
                                <Icon icon={s.icon} width={24} className="ml-auto shrink-0 text-white/70" aria-hidden />
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
};

export default OrganizerBand;
