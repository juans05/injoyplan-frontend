"use client"
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import dayjs from '@/app/utils/date';
import { DISTRITOS_LIMA } from "@/app/data/distritos";
import { TIME_SLOTS as SLOT_HOURS, type Horario } from "@/app/utils/urls";

export type FilterState = {
    category: string; // category name, '' = all
    distrito: string;
    date: string;     // YYYY-MM-DD, inclusive
    dateEnd: string;  // YYYY-MM-DD, inclusive
    horario: Horario | '';
    esGratis: boolean;
};

export const EMPTY_FILTERS: FilterState = { category: '', distrito: '', date: '', dateEnd: '', horario: '', esGratis: false };

const F = 'YYYY-MM-DD';
const short = (d: dayjs.Dayjs) => d.format('ddd D MMM').replace('.', '').toLowerCase();
const range = (a: dayjs.Dayjs, b: dayjs.Dayjs) => a.isSame(b, 'day')
    ? short(a)
    : a.isSame(b, 'month') ? `${a.format('D')} – ${b.format('D MMM').toLowerCase()}` : `${a.format('D MMM')} – ${b.format('D MMM')}`.toLowerCase();

// Quick date ranges, computed from today's local date
function datePresets() {
    const t = dayjs().startOf('day');
    const d = t.day(); // 0 = domingo
    const weekendStart = d === 0 || d === 6 ? t : t.day(6);
    const weekendEnd = d === 0 ? t : weekendStart.add(1, 'day');
    const weekEnd = d === 0 ? t : t.day(7);
    return [
        { key: 'hoy', label: 'Hoy', icon: 'solar:sun-2-linear', from: t, to: t },
        { key: 'manana', label: 'Mañana', icon: 'solar:sunrise-linear', from: t.add(1, 'day'), to: t.add(1, 'day') },
        { key: 'finde', label: 'Este finde', icon: 'solar:confetti-linear', from: weekendStart, to: weekendEnd },
        { key: 'semana', label: 'Esta semana', icon: 'solar:calendar-linear', from: t, to: weekEnd },
    ];
}

// Start-time slots (hours live in utils/urls); the backend accepts a range that wraps past midnight
const TIME_SLOTS: { key: Horario; hint: string; icon: string }[] = [
    { key: 'manana', hint: '5:00 – 12:00', icon: 'solar:sunrise-linear' },
    { key: 'tarde', hint: '12:00 – 18:00', icon: 'solar:sun-2-linear' },
    { key: 'noche', hint: 'Desde las 18:00', icon: 'solar:moon-stars-linear' },
];

type Key = 'when' | 'what' | 'where' | 'time';

type Props = {
    value: FilterState;
    onChange: (patch: Partial<FilterState>) => void;
    categories: any[];
    onPickCategory: (name: string) => void;
    onPickDistrict: (d: string) => void;
};

const Filters = ({ value, onChange, categories, onPickCategory, onPickDistrict }: Props) => {
    const [open, setOpen] = useState<Key | null>(null);
    const bar = useRef<HTMLDivElement>(null);

    // Close on outside click and Escape
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => { if (!bar.current?.contains(e.target as Node)) setOpen(null); };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
    }, [open]);

    const presets = datePresets();
    const preset = presets.find((p) => value.date === p.from.format(F) && value.dateEnd === p.to.format(F));
    const whenLabel = preset?.label
        || (value.date && value.dateEnd ? range(dayjs(value.date), dayjs(value.dateEnd))
            : value.date ? `Desde ${short(dayjs(value.date))}`
                : value.dateEnd ? `Hasta ${short(dayjs(value.dateEnd))}` : '');

    const timeLabel = value.horario ? SLOT_HOURS[value.horario].label : '';
    const categoryName = value.category;
    const activeCount = [value.category, value.distrito, whenLabel, timeLabel, value.esGratis].filter(Boolean).length;
    const close = () => setOpen(null);

    return (
        <div ref={bar} className="flex items-center gap-2">
            {/* Mobile: one swipeable row. Desktop: wraps. */}
            <div className="flex flex-1 flex-wrap items-center gap-2 py-1">
                <Pill id="when" icon="solar:calendar-linear" label="Cuándo" value={whenLabel} open={open} setOpen={setOpen}>
                    <Panel title="¿Cuándo?" onDone={close}>
                        <div className="grid grid-cols-2 gap-2">
                            {presets.map((p) => {
                                const on = preset?.key === p.key;
                                return (
                                    <button key={p.key} type="button" aria-pressed={on}
                                        onClick={() => { onChange({ date: p.from.format(F), dateEnd: p.to.format(F) }); close(); }}
                                        className={`flex items-center gap-3 rounded-card border p-3 text-left transition-colors ${on ? 'border-brand bg-brand-mist' : 'border-line hover:border-brand'}`}>
                                        <Icon icon={p.icon} width={22} className={on ? 'text-brand-deep' : 'text-brand'} aria-hidden />
                                        <span>
                                            <span className="block text-label text-ink">{p.label}</span>
                                            <span className="block text-caption text-ink-soft">{range(p.from, p.to)}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="mb-2 mt-5 text-label text-ink">Elegir fechas</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label htmlFor="f-from" className="field-label">Desde</label>
                                <input id="f-from" type="date" min={dayjs().format(F)} value={value.date}
                                    onChange={(e) => onChange({ date: e.target.value, ...(value.dateEnd && e.target.value > value.dateEnd ? { dateEnd: '' } : {}) })} className="field" />
                            </div>
                            <div>
                                <label htmlFor="f-to" className="field-label">Hasta</label>
                                <input id="f-to" type="date" min={value.date || dayjs().format(F)} value={value.dateEnd}
                                    onChange={(e) => onChange(value.date && e.target.value && e.target.value < value.date
                                        ? { date: e.target.value, dateEnd: value.date } // picked backwards: swap
                                        : { dateEnd: e.target.value })} className="field" />
                            </div>
                        </div>
                        <Option on={!whenLabel} onClick={() => { onChange({ date: '', dateEnd: '' }); close(); }} icon="solar:calendar-search-linear">Cualquier día</Option>
                    </Panel>
                </Pill>

                <Pill id="what" icon="solar:widget-4-linear" label="Qué" value={categoryName} open={open} setOpen={setOpen}>
                    <Panel title="¿Qué quieres hacer?" onDone={close}>
                        <Option on={!value.category} onClick={() => { onPickCategory(''); close(); }} icon="solar:widget-4-linear">Todas las categorías</Option>
                        <ul className="mt-1 max-h-[50vh] overflow-y-auto md:max-h-80">
                            {categories.map((c) => {
                                const on = c.nombreCategoria === value.category;
                                return (
                                    <li key={c.idCategorias}>
                                        <button type="button" aria-pressed={on} onClick={() => { onPickCategory(c.nombreCategoria); close(); }}
                                            className={`flex w-full items-center gap-3 rounded-control p-2 text-left transition-colors ${on ? 'bg-brand-mist' : 'hover:bg-canvas'}`}>
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-wine">
                                                {c.iconos
                                                    ? <Image src={c.iconos} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
                                                    : <Icon icon="solar:ticket-linear" width={18} className="text-white" aria-hidden />}
                                            </span>
                                            <span className="flex-1 text-body font-semibold text-ink">{c.nombreCategoria}</span>
                                            <span className="text-caption text-ink-soft">{c.cantidad}</span>
                                            {on && <Icon icon="solar:check-read-linear" width={20} className="text-brand" aria-hidden />}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </Panel>
                </Pill>

                <Pill id="where" icon="solar:map-point-linear" label="Dónde" value={value.distrito} open={open} setOpen={setOpen}>
                    <Panel title="¿Dónde?" onDone={close}>
                        <DistrictPicker value={value.distrito} onPick={(d) => { onPickDistrict(d); close(); }} />
                    </Panel>
                </Pill>

                <Pill id="time" icon="solar:clock-circle-linear" label="Horario" value={timeLabel} open={open} setOpen={setOpen}>
                    <Panel title="¿A qué hora?" onDone={close}>
                        <div className="grid grid-cols-3 gap-2">
                            {TIME_SLOTS.map((s) => {
                                const on = value.horario === s.key;
                                return (
                                    <button key={s.key} type="button" aria-pressed={on}
                                        onClick={() => { onChange({ horario: s.key }); close(); }}
                                        className={`flex flex-col items-center gap-1 rounded-card border p-3 text-center transition-colors ${on ? 'border-brand bg-brand-mist' : 'border-line hover:border-brand'}`}>
                                        <Icon icon={s.icon} width={22} className={on ? 'text-brand-deep' : 'text-brand'} aria-hidden />
                                        <span className="text-label text-ink">{SLOT_HOURS[s.key].label}</span>
                                        <span className="text-caption text-ink-soft">{s.hint}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <Option on={!timeLabel} onClick={() => { onChange({ horario: '' }); close(); }} icon="solar:clock-circle-linear">Cualquier hora</Option>
                    </Panel>
                </Pill>

                <button type="button" aria-pressed={value.esGratis} onClick={() => onChange({ esGratis: !value.esGratis })}
                    className={`${value.esGratis ? 'chip-active' : 'chip'} h-10 shrink-0 px-3 md:h-11 md:px-4`}>
                    <Icon icon={value.esGratis ? 'solar:check-circle-bold' : 'solar:gift-linear'} width={18} aria-hidden /> Gratis
                </button>

                {activeCount > 0 && (
                    <button type="button" onClick={() => { onChange(EMPTY_FILTERS); close(); }} className="btn-ghost btn-sm shrink-0">
                        Limpiar{activeCount > 1 ? ` (${activeCount})` : ''}
                    </button>
                )}
            </div>
        </div>
    );
};

type PillProps = { id: Key; icon: string; label: string; value: string; open: Key | null; setOpen: (k: Key | null) => void; children: ReactNode };

function Pill({ id, icon, label, value, open, setOpen, children }: PillProps) {
    const isOpen = open === id;
    return (
        <div className="shrink-0 md:relative">
            <button type="button" aria-expanded={isOpen} aria-controls={`panel-${id}`} onClick={() => setOpen(isOpen ? null : id)}
                className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-label md:h-11 md:gap-2 md:px-4 transition-colors ${value ? 'border-brand bg-brand-mist text-brand-deep' : 'border-line bg-white text-ink hover:border-brand hover:text-brand'} ${isOpen ? 'ring-2 ring-brand/20' : ''}`}>
                <Icon icon={icon} width={18} aria-hidden />
                <span className="max-w-[9rem] truncate md:max-w-[11rem]">{value || label}</span>
                <Icon icon="solar:alt-arrow-down-linear" width={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            {isOpen && <div id={`panel-${id}`}>{children}</div>}
        </div>
    );
}

// Bottom sheet on mobile, anchored popover from md up
function Panel({ title, onDone, children }: { title: string; onDone: () => void; children: ReactNode }) {
    return (
        <>
            <div className="fixed inset-0 z-40 bg-ink/40 md:hidden" onClick={onDone} aria-hidden />
            <div role="dialog" aria-label={title}
                className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-panel bg-white p-4 pb-6 shadow-float
                    md:absolute md:inset-x-auto md:bottom-auto md:left-0 md:top-full md:mt-2 md:w-[360px] md:rounded-panel md:border md:border-line">
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-h3 text-ink">{title}</p>
                    <button type="button" onClick={onDone} aria-label="Cerrar" className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-canvas">
                        <Icon icon="solar:close-circle-linear" width={22} />
                    </button>
                </div>
                {children}
            </div>
        </>
    );
}

function Option({ on, onClick, icon, children }: { on: boolean; onClick: () => void; icon: string; children: ReactNode }) {
    return (
        <button type="button" aria-pressed={on} onClick={onClick}
            className={`mt-3 flex w-full items-center gap-3 rounded-control border-t border-line px-2 pb-2 pt-4 text-left text-body font-semibold ${on ? 'text-brand' : 'text-ink hover:text-brand'}`}>
            <Icon icon={icon} width={20} aria-hidden />
            <span className="flex-1">{children}</span>
            {on && <Icon icon="solar:check-read-linear" width={20} aria-hidden />}
        </button>
    );
}

function DistrictPicker({ value, onPick }: { value: string; onPick: (d: string) => void }) {
    const [q, setQ] = useState('');
    // Accent-insensitive match so "jesus" finds "Jesús María"
    const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const list = DISTRITOS_LIMA.filter((d) => norm(d).includes(norm(q)));
    return (
        <>
            <div className="relative">
                <label htmlFor="f-dis-q" className="sr-only">Buscar distrito</label>
                <Icon icon="solar:magnifer-linear" width={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" aria-hidden />
                <input id="f-dis-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca un distrito" className="field pl-10" autoFocus />
            </div>
            {!q && <Option on={!value} onClick={() => onPick('')} icon="solar:city-linear">Toda Lima</Option>}
            <ul className="mt-1 max-h-[45vh] overflow-y-auto md:max-h-72">
                {list.map((d) => (
                    <li key={d}>
                        <button type="button" aria-pressed={value === d} onClick={() => onPick(d)}
                            className={`flex w-full items-center justify-between rounded-control px-2 py-2.5 text-left text-body ${value === d ? 'bg-brand-mist font-semibold text-brand-deep' : 'text-ink hover:bg-canvas'}`}>
                            {d}
                            {value === d && <Icon icon="solar:check-read-linear" width={20} aria-hidden />}
                        </button>
                    </li>
                ))}
                {list.length === 0 && <li className="px-2 py-3 text-label font-normal text-ink-soft">No encontramos ese distrito en Lima.</li>}
            </ul>
        </>
    );
}

export default Filters;
