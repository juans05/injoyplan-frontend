import Slider from "react-slick";
import { useEffect } from "react";
import { IEventsState, useEventStore } from "../../../zustand/events";
import { useRouter } from "next/navigation";
import moment from "moment";
import Image from "next/image";
import Angle from '../../../../../public/svg/angle_right.svg';
import Link from "next/link";
import BannerSkeleton from "@/app/components/Skeletons/banner";
moment.locale('es');

const Slide = () => {
    const { getBannerEvents, bannerEvents, isLoading }: IEventsState = useEventStore();
    const router = useRouter(); // For navigation

    const settings = {
        dots: true,
        infinite: true,
        fade: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true, // Enable autoplay for banners
        autoplaySpeed: 5000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false,
                }
            }
        ]
    };

    useEffect(() => {
        getBannerEvents();
    }, []);

    console.log("Banners (Events):", bannerEvents)

    if (isLoading && (!bannerEvents || bannerEvents.length === 0)) return <BannerSkeleton />

    return (
        <Slider className="slide" {...settings}>
            {bannerEvents?.length > 0 ? (
                bannerEvents.map((item: any, index: number) => {
                    // Item is now an Event object (mapped)
                    // Fields: titulo, url, FechaInicio, HoraInicio, NombreLocal, etc.

                    const date = item.FechaInicio ? moment.utc(item.FechaInicio) : null;
                    const dayName = date ? date.format('ddd').toUpperCase().replace('.', '') : '';
                    const dayNumber = date ? date.format('D') : '';
                    const monthName = date ? date.format('MMM').toUpperCase().replace('.', '') : '';

                    const eventLink = `/evento/${item?.idEventos ?? item?.ideventos}/${item?.idfecha}`;

                    return (
                        <div key={index} className="h-full">
                            <div className="h-full relative">
                                <Image src={item.url || '/img/placeholder.png'} alt="banner" width={2000} height={1000} className="w-full h-full object-fill rounded-xl" />
                                <div className="absolute md:top-36 top-24 left-5 md:left-10 max-w-[80%] md:max-w-[60%]">
                                    <div>
                                        <h4 className="bg-customText text-[#fff] rounded rounded-bl-none rounded-tl-none text-2xl md:text-3xl p-2 w-fit font-bold line-clamp-2">
                                            {item.titulo}
                                        </h4>

                                        {(item.FechaInicio || item.HoraInicio || item.NombreLocal) && (
                                            <div className="flex items-center w-fit bg-customText text-[#fff] rounded rounded-bl-none rounded-tl-none text-md p-2 mt-1">
                                                {date && (
                                                    <p className="ml-2 leading-tight">
                                                        {dayName} <strong className="font-normal block text-xl">{dayNumber} {monthName}</strong>
                                                    </p>
                                                )}
                                                {(item.HoraInicio || item.NombreLocal) && (
                                                    <div className={`border-l border-solid border-[#fff] ml-4 pl-3 flex flex-col justify-center ${!date ? 'border-none ml-0 pl-2' : ''}`}>
                                                        {item.HoraInicio && (
                                                            <p className="">{item.HoraInicio} {item.HoraFinal ? `- ${item.HoraFinal}` : ''}</p>
                                                        )}
                                                        {item.NombreLocal && (
                                                            <p className="font-bold opacity-90 text-sm">{item.NombreLocal.replace(/\s*(S\/N|s\/n|\d+)$/i, '').trim()}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <Link href={eventLink} className="bg-customText transition-colors p-3 px-6 text-md relative top-4 rounded uppercase text-[#fff] font-bold inline-block">
                                            Conoce más
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            {/* Source link if available - usually ticket link */}
                            {item.urlFuente && (
                                <Link
                                    className="absolute md:bottom-2 bottom-1 z-50 flex justify-center text-[11px] md:text-left xl:text-left md:justify-start mt-2 text-[#A3ABCC] font-bold w-full text-center"
                                    href={item.urlFuente.startsWith('http') ? item.urlFuente : `https://${item.urlFuente}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    VER FUENTE
                                    <Image className="ml-1 relative top-0.5" src={Angle} height={10} width={10} alt="Angulo" />
                                </Link>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="md:h-[450px] h-[300px] bg-gradient-to-r from-[#861f21] to-[#b04b4d] rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10 text-center px-6">
                        <h3 className="text-white md:text-4xl text-2xl font-bold mb-4 drop-shadow-lg">
                            ¿Tienes un evento increíble?
                        </h3>
                        <p className="text-white md:text-xl text-lg mb-8 opacity-90">
                            ¡Haz que todos lo vean aquí!
                        </p>
                        <Link
                            href="/contacto"
                            className="bg-white text-[#861f21] hover:bg-gray-100 transition-all transform hover:scale-105 px-8 py-3 rounded-full font-bold md:text-lg text-sm shadow-xl inline-block"
                        >
                            ¡DESTACA TU EVENTO AHORA!
                        </Link>
                    </div>
                </div>
            )}
        </Slider>
    );
};

export default Slide;