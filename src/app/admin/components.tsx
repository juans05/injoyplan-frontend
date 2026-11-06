'use client';

import { Icon } from '@iconify/react';

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

export { SidebarItem, StatCard, BarChartMock, ConfirmModal };
