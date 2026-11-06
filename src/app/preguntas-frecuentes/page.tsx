"use client";
import React, { useState, useMemo } from 'react';
import styles from './quest.module.css'
import question from './../../../public/svg/question.svg'
import lupa from './../../../public/svg/search.svg'
import plus from '../../../public/svg/plus.svg'
import minus from '../../../public/svg/minus.svg' // Assuming we might want a minus icon, otherwise reuse plus with rotation
import Image from 'next/image'
import { jakarta } from '../../../public/fonts';
import { Icon } from '@iconify/react/dist/iconify.js'; // Using Iconify as seen in other files for consistency if minus svg missing

const faqs = [
    {
        id: 1,
        question: "¿Usar Injoyplan tiene algún costo?",
        answer: "No. El uso de Injoyplan es completamente gratuito para los usuarios. Puedes explorar, buscar y compartir eventos sin pagar ningún costo.",
        category: "Servicios"
    },
    {
        id: 2,
        question: "¿Injoyplan organiza los eventos que se están en su plataforma?",
        answer: "No. Injoyplan no organiza ni produce los eventos publicados en la plataforma. Nuestro objetivo es recopilar y difundir información sobre distintos planes y actividades para que puedas encontrar opciones acordes a tus intereses.",
        category: "Servicios"
    },
    {
        id: 3,
        question: "¿Cuáles son las condiciones generales del servicio y uso de la web?",
        answer: "Las condiciones generales que regulan el uso de Injoyplan se encuentran detalladas en nuestras secciones de “Términos y Condiciones” y “Política de Privacidad”, disponibles en el pie de página del sitio web.",
        category: "Servicios"
    },
    {
        id: 4,
        question: "¿En dónde encuentro la información de los eventos?",
        answer: "Puedes encontrar la información de los eventos tanto en la página principal como utilizando el buscador. Al seleccionar un evento, podrás ver su detalle, como fecha, hora, lugar, descripción y otros datos relevantes.",
        category: "Servicios"
    },
    {
        id: 5,
        question: "¿En qué ciudades de Perú puedo buscar eventos?",
        answer: "Actualmente, Injoyplan opera en la ciudad de Lima. En el futuro, tenemos previsto ampliar la cobertura y crecer a otras ciudades del Perú.",
        category: "Servicios"
    },
    {
        id: 6,
        question: "¿En dónde adquiero las entradas de los eventos?",
        answer: "En el detalle de cada evento te indicaremos, cuando corresponda, los canales que encontramos donde puedes adquirir las entradas o la forma de participar. Injoyplan no vende ni gestiona directamente la venta de entradas.",
        category: "Compras"
    },
    {
        id: 7,
        question: "¿Puedo crearme una cuenta personal para el uso del sitio web?",
        answer: "Por el momento, Injoyplan no cuenta con la opción de crear cuentas. Actualmente, el uso de la plataforma es únicamente informativo; sin embargo, estamos trabajando en nuevas funcionalidades para ofrecerte una mejor experiencia en el futuro.",
        category: "Registros"
    },
    {
        id: 8,
        question: "¿Puedo guardar los eventos que encuentre?",
        answer: "Actualmente, no está disponible la opción de guardar eventos, pero siempre podrás compartir los enlaces de los eventos.",
        category: "Registros"
    },
    {
        id: 9,
        question: "¿Cómo puedo registrar y compartir algún evento en Injoyplan?",
        answer: "Si deseas que tu evento o actividad aparezca en Injoyplan, puedes contactarnos a través de nuestro correo electrónico o redes sociales. La publicación de eventos no tiene costo.",
        category: "Registros"
    },
    {
        id: 10,
        question: "¿Puedo compartir los eventos?",
        answer: "Sí. Puedes compartir libremente los eventos que encuentres en Injoyplan. Al hacerlo, se copiará el enlace del evento para que puedas enviarlo por redes sociales o compartirlo con otras personas y así ayudar a que más personas descubran nuevas actividades.",
        category: "Compartir"
    },
    {
        id: 11,
        question: "¿Qué pasa si algún evento se modifica o cancela?",
        answer: "Dado que Injoyplan no es el organizador de los eventos, no podemos evitar modificaciones o cancelaciones. No obstante, cuando tengamos conocimiento de algún cambio, intentaremos informar a los usuarios en la medida de lo posible.",
        category: "Servicios"
    },
    {
        id: 12,
        question: "¿En dónde puedo contactarlos?",
        answer: "Puedes contactarnos a través de nuestro correo electrónico contacto@injoyplan.com o mediante nuestras redes sociales en Facebook https://www.facebook.com/injoyplan e Instagram https://www.instagram.com/injoyplan. ¡También puedes seguirnos para enterarte de nuevos planes y actividades!",
        category: "Contáctanos"
    }
];

const categories = ["Todas", "Compras", "Servicios", "Compartir", "Registros", "Contáctanos"];

const Quest = () => {
    const [activeCategory, setActiveCategory] = useState("Todas");
    const [openQuestionId, setOpenQuestionId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const toggleQuestion = (id: number) => {
        setOpenQuestionId(openQuestionId === id ? null : id);
    };

    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = activeCategory === "Todas" || faq.category === activeCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Calculate category counts
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        // Initialize with default 0 only for existing classification to avoid NaN issues if categories change
        categories.forEach(cat => {
            if (cat !== 'Todas') counts[cat] = 0;
        });

        faqs.forEach(faq => {
            if (counts[faq.category] !== undefined) {
                counts[faq.category]++;
            }
        });

        return counts;
    }, []);

    // Helper to render text with links
    const renderAnswer = (text: string) => {
        // Regex to split by URLs (http/https) OR email addresses
        // This splits the string but keeps the delimiter (the url/email) in the array
        const parts = text.split(/((?:https?:\/\/[^\s]+)|(?:[\w.-]+@[\w.-]+\.[\w]+))/g);

        return parts.map((part, i) => {
            if (part.match(/^https?:\/\/[^\s]+$/)) {
                return (
                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-[#007FA4] font-bold underline break-all">
                        {part}
                    </a>
                );
            } else if (part.match(/^[\w.-]+@[\w.-]+\.[\w]+$/)) {
                return (
                    <a key={i} href={`mailto:${part}`} className="text-[#007FA4] font-bold underline break-all">
                        {part}
                    </a>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className="">
            <div className='bg-[#F8FAFB]'>
                <div className="pt-10 max-w-screen-md mx-auto md:flex items-center justify-start pb-10 md:px-0 px-10">
                    <div className='flex items-center'>
                        <Image src={question} className='md:w-full w-3/12' alt="dreamimg" />
                        <h3 className={`${jakarta.className} block ml-10 md:hidden text-3xl font-bold text-[#9B292B]`}>¿Preguntas? Busca aquí</h3>
                    </div>
                    <div className='md:ml-28 ml-10 hidden md:block'>
                        <h3 className={`${jakarta.className}  text-3xl font-bold text-[#9B292B]`}>¿Preguntas? Busca aquí</h3>
                        <div className='relative justify-between top-10 border border-solid border-[#E8E8E8] bg-[#fff] flex p-3 rounded-full w-[450px]'>
                            <div>
                                <input
                                    className='outline-none w-[350px]'
                                    type="text"
                                    placeholder="Escribe tu pregunta"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div>
                                <Image src={lupa} alt="lupa" />
                            </div>
                        </div>
                    </div>
                    {/* Mobile Search */}
                    <div className='block md:hidden mb-10 w-full'>
                        <div className='relative justify-between top-10 border border-solid border-[#E8E8E8] bg-[#fff] flex p-3 rounded-full w-full'>
                            <div>
                                <input
                                    className='outline-none w-full'
                                    type="text"
                                    placeholder="Escribe tu pregunta"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div>
                                <Image src={lupa} alt="lupa" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-screen-lg mx-auto grid grid-cols-12 gap-3 md:mt-20 mt-10 mb-16 md:px-0 px-5">
                <div className="col-start-1 col-end-3 hidden md:block">
                    <h3 className='font-bold text-[#212121]'>CATEGORÍAS</h3>
                    <ul className="mt-4">
                        {categories.map((cat, index) => (
                            <li key={index} className='mt-3'>
                                <button
                                    onClick={() => setActiveCategory(cat)}
                                    className={`text-sm text-left transition-colors font-bold ${activeCategory === cat ? 'text-[#007FA4]' : 'text-[#666] hover:text-[#007FA4]'}`}
                                >
                                    {cat === "Todas" ? cat : `${cat} (${categoryCounts[cat] || 0})`}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Mobile Categories (Horizontal Scroll) */}
                <div className="col-span-12 md:hidden mb-5 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                    {categories.map((cat, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveCategory(cat)}
                            className={`mr-4 text-sm font-bold px-3 py-1 rounded-full border ${activeCategory === cat ? 'bg-[#007FA4] text-white border-[#007FA4]' : 'text-[#666] border-[#ddd]'}`}
                        >
                            {cat === "Todas" ? cat : `${cat} (${categoryCounts[cat] || 0})`}
                        </button>
                    ))}
                </div>

                <div className="md:col-start-3 md:col-end-12 col-start-1 col-end-13">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq) => (
                            <div
                                key={faq.id}
                                className="border-[#007fa4] border-solid border rounded-md mb-5 overflow-hidden transition-all duration-300"
                            >
                                <div
                                    className="p-5 cursor-pointer flex justify-between items-center bg-white"
                                    onClick={() => toggleQuestion(faq.id)}
                                >
                                    <h4 className='font-[600] text-[#007FA4] w-[90%]'>{faq.question}</h4>
                                    <div className={`transition-transform duration-300 transform ${openQuestionId === faq.id ? 'rotate-45' : 'rotate-0'}`}>
                                        <Image src={plus} width={20} height={20} alt="expandir" />
                                    </div>
                                </div>

                                <div
                                    className={`transition-all duration-300 ease-in-out overflow-hidden ${openQuestionId === faq.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="p-5 pt-0 text-[#444] text-sm leading-relaxed border-t border-transparent">
                                        {renderAnswer(faq.answer)}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            No se encontraron preguntas que coincidan con tu búsqueda.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Quest