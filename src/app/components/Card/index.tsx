import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import heartOutline from '../../../../public/svg/favorite.svg'
import heart from '../../../../public/svg/shape.svg'
import Angle from '../../../../public/svg/angle_right.svg'
import moment from "moment";
import { Event } from "@/app/interfaces/event";

import { useRef, useEffect } from "react";

interface IProps {
    item: Event
    height?: number
    addFavoritesByUser: (event: Event) => void
    heartDisabled?: boolean
    isDragging?: boolean
}

const Card = ({ item, addFavoritesByUser, height, heartDisabled, isDragging }: IProps) => {

    const wasDraggingRef = useRef(false);

    useEffect(() => {
        if (isDragging) {
            wasDraggingRef.current = true;
        } else if (wasDraggingRef.current) {
            // Small delay to prevent navigation immediately after drag
            const timer = setTimeout(() => {
                wasDraggingRef.current = false;
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isDragging]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            {...({ className: `flex flex-col h-[28rem] md:h-[28rem] justify-between w-full mb-10 md:mb-5` }) as any}
        >
            <Link
                prefetch={true}
                onClick={(e) => {
                    if (isDragging || wasDraggingRef.current) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }

                }}
                href={`/evento/${item?.idEventos || item.ideventos}/${item?.idfecha}`}
                target="_blank"
                rel="noopener noreferrer"
                className='h-full w-full relative'>
                <div className={heartDisabled ? "bg-[#fff] h-full w-full rounded-t-2xl rounded-b-2xl border border-solid] shadow-custom-2 pb-5" : "bg-[#fff] h-full w-full rounded-t-2xl rounded-b-2xl border border-solid] shadow-custom-2 group pb-5"}>

                    <div className='w-full h-56 relative rounded-t-2xl'>
                        {
                            item?.Destacado === 1 && (
                                <div className="uppercase absolute p-1 px-4 left-3 bottom-[-12px] bg-[#007FA4] rounded-full text-sm text-[#fff] font-bold">
                                    <p>Destacado</p>
                                </div>
                            )
                        }
                        {item?.url ? (
                            <Image
                                src={item.url.trim()}
                                alt={item.titulo || "Evento"}
                                width={400}
                                height={400}
                                className='h-full w-full object-fill rounded-t-2xl'
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        ) : (
                            <div className='h-full w-full bg-[#f2f2f2] rounded-t-2xl' />
                        )}
                        <div onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addFavoritesByUser(item);
                        }}
                        >

                            <Image
                                width={30}
                                height={30}
                                className={`absolute right-3 bg-[rgba(255,255,255,0.8)] rounded-full top-3 p-1 
               opacity-100 md:opacity-0 ${(item?.favorito || item?.esfavorito === 1) ? "md:opacity-100" : "md:opacity-0 md:group-hover:opacity-100"}  
               transition-opacity duration-300 cursor-pointer`}
                                src={(item?.favorito || item?.esfavorito === 1) ? heart : heartOutline} alt="" />
                        </div>

                    </div>
                    <div className='p-4 bg-[#fff] rounded-bl-2xl rounded-br-2xl'>
                        <div>
                            <span className='text-xs font-bold text-[#4a4a4a]'>{moment(item?.FechaInicio).utcOffset(-5).format('D MMM').toUpperCase()} - {item?.HoraInicio} {item?.HoraFinal === "" ? "" : `-${item?.HoraFinal}`}</span>
                            <h3 className='font-black text-xl line-clamp-2 text-[#212121]'>{item?.titulo}</h3>
                            <h5 className='text-sm font-normal mb-3 text-[#212121] mt-2'>{item?.NombreLocal?.replace(/\s*(S\/N|s\/n|\d+)$/i, '').trim()}</h5>
                        </div>
                        <div className="absolute bottom-[20px] z-100">
                            <strong className='text-[10px] font-bold uppercase text-[#212121]'>Desde</strong>
                            <h4 className='font-bold text-xl text-[#212121]'>{Number(item?.Monto) > 0 ? `S/ ${item?.Monto.toFixed(2)}` : "¡Gratis!"}</h4>
                        </div>
                    </div>
                </div>
            </Link>
            <Link className='flex w-fit text-[11px] mt-1 text-[#A3ABCC] font-bold relative -top-0 md:-top-0 left-4'
                href={item?.urlFuente?.startsWith('http') ? item.urlFuente : (item?.urlFuente ? `https://${item.urlFuente}` : '#')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => !item?.urlFuente && e.preventDefault()}
            >
                VER FUENTE
                <Image className='ml-1' src={Angle} height={10} width={10} alt='Angulo' />
            </Link>
        </motion.div >
    )
}

export default Card;