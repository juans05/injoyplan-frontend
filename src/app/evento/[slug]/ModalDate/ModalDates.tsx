import ReactModal from "react-modal";
import { motion } from "framer-motion";
import styles from './modaldates.module.css'
import { Dispatch } from "react";
import dayjs from '@/app/utils/date';
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";

interface IProps {
    showModal: boolean
    setShowModal: Dispatch<boolean>
    dataFechaOrdenada: any
}

const ModalDates = ({ showModal, setShowModal, dataFechaOrdenada }: IProps) => {

    const onCloseModal = () => {
        document.body.classList.remove('ReactModal__Body--open');
        setShowModal(false)
    }


    // Check if we're on mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    const customStyles = {
        content: {
            // Use relative positioning within flex container
            position: isMobile ? 'absolute' : 'relative',
            inset: isMobile ? '0' : 'auto', // Reset inset for desktop to avoid conflicts

            // Reset centering hacks
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto',
            marginRight: '0',
            transform: 'none',

            border: "none",
            width: isMobile ? '100%' : 'min(90vw, 600px)',
            height: isMobile ? '100%' : 'auto',
            maxHeight: isMobile ? '100%' : '85vh',
            overflow: "auto",
            padding: isMobile ? "20px 15px 20px 15px" : "20px 15px 0px 15px",
            background: "#fff",
            borderRadius: isMobile ? '0' : '10px',
            margin: '0',
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',            // Enable Flexbox
            justifyContent: 'center',   // Center horizontally
            alignItems: 'center'        // Center vertically
        }
    };

    const variants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 }
    };

    console.log(dataFechaOrdenada)

    return (
        <ReactModal ariaHideApp={false} isOpen={showModal} style={customStyles as any}>
            {
                dataFechaOrdenada.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}       // Estado inicial: completamente visible
                        animate={{ opacity: 1 }}       // Mantener visible durante la carga
                        exit={{ opacity: 1 }}          // Animación de salida: desvanecerse
                        transition={{ duration: 0.5 }}
                        style={{ background: "#fff" }}
                        variants={variants}
                    >
                        <div className={styles.date}>
                            <div className={styles.close} onClick={onCloseModal}>
                                <Icon icon="line-md:close" fontSize={25} />
                            </div>
                            <div className={styles.date__wrapper}>
                                <div>
                                    <h2>Calendario del evento</h2>
                                </div>
                                <div className={styles.date__table}>
                                    {/* Desktop Table */}
                                    <table className="hidden sm:table w-full">
                                        <thead>
                                            <tr>
                                                <td>
                                                    Fecha y hora
                                                </td>
                                                <td>
                                                    Precio desde
                                                </td>
                                                <td>

                                                </td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                dataFechaOrdenada?.map((item: any, index: number) => (
                                                    <tr key={index} className="items-center">
                                                        <td><p className="mt-4">{dayjs(item.FechaInicio).utc().format('dddd D MMMM')}</p>
                                                            <div>{item.HoraInicio} {item.HoraFinal ? `- ${item.HoraFinal}` : ''}</div>
                                                        </td>
                                                        <td>{Number(item.Monto) === 0 ? '¡Gratis!' : `S/ ${Number(item.Monto).toFixed(2)}`}</td>
                                                        <td>
                                                            <Link className="text-[#9A2A2B] uppercase font-semibold text-sm" href={`?fecha=${item?.idfecha}`} replace scroll={false}>Ver evento</Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>

                                    {/* Mobile Cards */}
                                    <div className="sm:hidden space-y-4 mt-4">
                                        {
                                            dataFechaOrdenada?.map((item: any, index: number) => (
                                                <div key={index} className="border-b border-[#EDEFF5] pb-4">
                                                    <div className="flex justify-between items-start gap-3">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-[#212121] capitalize">
                                                                {dayjs(item.FechaInicio).utc().format('dddd D MMMM')}
                                                            </p>
                                                            <p className="text-sm text-[#666]">{item.HoraInicio} {item.HoraFinal ? `- ${item.HoraFinal}` : ''}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-[#212121]">
                                                                {Number(item.Monto) === 0 ? '¡Gratis!' : `S/ ${Number(item.Monto).toFixed(2)}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        className="inline-block mt-2 text-[#9A2A2B] uppercase font-semibold text-xs"
                                                        href={`?fecha=${item?.idfecha}`} replace scroll={false}
                                                    >
                                                        Ver evento →
                                                    </Link>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                                <div className={styles.button__close} onClick={onCloseModal}>
                                    <button className={styles.closeModal}>cerrar</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )
            }
        </ReactModal>
    )
}

export default ModalDates;
