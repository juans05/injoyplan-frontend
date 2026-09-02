import React, { useEffect, useState } from 'react';
import useOutsideClick from '../../hooks/useOutsideClick';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

interface FilterState {
    timeRange: string; // "all", "morning", "afternoon", "night"
    esGratis: boolean;
    enCurso: boolean;
}

interface Props {
    onApply: (data: { horaInicio?: string; horaFin?: string; esGratis: boolean; enCurso: boolean }) => void;
}

const MoreFilters = ({ onApply }: Props) => {
    const [isOpen, setIsOpen, ref] = useOutsideClick(false);

    // Internal state
    const [startTime, setStartTime] = useState<string>("");
    const [esGratis, setEsGratis] = useState<boolean>(false);
    const [enCurso, setEnCurso] = useState<boolean>(false);

    // Generate hours: 00:00 to 23:00
    const hours = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return { value: `${hour}:00`, label: `${hour}:00` };
    });

    const triggerApply = (newStartTime: string, newEsGratis: boolean, newEnCurso: boolean) => {
        onApply({
            horaInicio: newStartTime || undefined,
            horaFin: undefined, // "Desde" implies onwards, backend handles open-ended range if fin is missing
            esGratis: newEsGratis,
            enCurso: newEnCurso
        });
    };

    const handleStartTimeChange = (value: string) => {
        setStartTime(value);
        triggerApply(value, esGratis, enCurso);
    };

    const handleAnyTimeClick = () => {
        const newValue = "";
        setStartTime(newValue);
        triggerApply(newValue, esGratis, enCurso);
    };

    const handleEsGratisChange = () => {
        const newValue = !esGratis;
        setEsGratis(newValue);
        triggerApply(startTime, newValue, enCurso);
    };

    // const handleEnCursoChange = () => {
    //     const newValue = !enCurso;
    //     setEnCurso(newValue);
    //     triggerApply(startTime, esGratis, newValue);
    // };

    return (
        <div ref={ref} className="relative z-20">
            <div
                className="cursor-pointer text-[#007FA4] font-bold flex items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                Mas filtros...
            </div>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    // @ts-ignore
                    className="absolute top-10 left-0 bg-white shadow-xl rounded-xl p-4 w-[300px] max-w-[calc(100vw-2rem)] border border-gray-100"
                >
                    {/* Time Filter */}
                    <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                        <div
                            className="flex justify-between items-center mb-2 cursor-pointer p-2 rounded transition-colors hover:bg-gray-100"
                            onClick={handleAnyTimeClick}
                        >
                            <span className="text-gray-700 font-medium text-sm">Cualquier hora</span>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${!startTime ? 'bg-[#007FA4] border-[#007FA4]' : 'bg-white border-gray-300'}`}>
                                {!startTime && <Icon icon="ei:check" className="text-white" width={18} />}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 px-2">
                            <span className="text-sm text-gray-600">Desde</span>
                            <div className="relative">
                                <select
                                    className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-full py-1 px-3 pr-8 leading-tight focus:outline-none focus:border-[#007FA4]"
                                    value={startTime}
                                    onChange={(e) => handleStartTimeChange(e.target.value)}
                                >
                                    <option value="" disabled>--:--</option>
                                    {hours.map(h => (
                                        <option key={h.value} value={h.value}>{h.label}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <Icon icon="ei:chevron-down" width={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3 mb-2">
                        {/* <div
                            className="bg-gray-100 p-3 rounded-lg flex justify-between items-center cursor-pointer"
                            onClick={() => setEnCurso(!enCurso)}
                        >
                            <span className="text-gray-700 font-medium text-sm">En curso</span>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${enCurso ? 'bg-[#007FA4] border-[#007FA4]' : 'bg-white border-gray-300'}`}>
                                {enCurso && <Icon icon="ei:check" className="text-white" width={18} />}
                            </div>
                        </div> */}

                        <div
                            className="bg-gray-100 p-3 rounded-lg flex justify-between items-center cursor-pointer"
                            onClick={handleEsGratisChange}
                        >
                            <span className="text-gray-700 font-medium text-sm">Gratis</span>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${esGratis ? 'bg-[#007FA4] border-[#007FA4]' : 'bg-white border-gray-300'}`}>
                                {esGratis && <Icon icon="ei:check" className="text-white" width={18} />}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default MoreFilters;
