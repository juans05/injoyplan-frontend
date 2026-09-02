"use client";
import styles from './header.module.css'
import logo from '../../../../public/svg/injoyplan.svg'
import lupa from '../../../../public/svg/search.svg'
import lupaMobile from '../../../../public/svg/searchmobile.svg'
import fb from '../../../../public/svg/fb.svg'
import ig from '../../../../public/svg/ig.svg'
import cora from '../../../../public/svg/favorite.svg'
import heartWhite from '../../../../public/svg/favoritepick.svg'
import Link from 'next/link'
import calendar from '../../../../public/svg/calendar.svg'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { IAuthState, useAuthStore } from '../../zustand/auth'
import { IEventsState, useEventStore } from '../../zustand/events'
import { IFavoriteState, useFavoriteStore } from '../../zustand/favorites'
import { Icon } from '@iconify/react/dist/iconify.js'
import moment from 'moment'
import Image from 'next/image';
import Auth from '../Auth';
import useOutsideClick from '@/app/hooks/useOutsideClick';
import useIsMobile from '@/app/hooks/useIsMobile';
import { usePathname } from 'next/navigation'
import { quicksand, sans } from '../../../../public/fonts';
import 'moment/locale/es'; // Importa el idioma español
import ReactModal from 'react-modal';
import useDebounce from '@/app/hooks/useDebounce';
import { getProfileAssets } from '@/app/utils/profileAssets';


moment.locale('es');

const Header = () => {


    const { auth, me, logout }: IAuthState = useAuthStore();
    const { getEventBySearch, eventSearch, resetEventBySearch, events, getValueSearch }: IEventsState = useEventStore();
    const { getFavorites, deleteFavorite, favorites }: IFavoriteState = useFavoriteStore();
    const [isOpenEvent, setIsOpenEvent, refEvent] = useOutsideClick(false);
    const [isOpenFavorite, setIsOpenFavorite, refFavorite] = useOutsideClick(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen, refUserDropdown] = useOutsideClick(false);
    const [openAuth, setOpenAuth] = useState<boolean>(false);
    const [authRegisterMode, setAuthRegisterMode] = useState<boolean>(false);
    const navigation = useRouter()
    const path = usePathname();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        getFavorites();
    }, [])

    // Landed here from a friend-invite link (email/WhatsApp) -> open registration directly
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (new URLSearchParams(window.location.search).get('invite') === '1' && !auth) {
            setAuthRegisterMode(true);
            setOpenAuth(true);
        }
    }, [auth])

    const [search, setSearch] = useState<string>("");
    const [hoveredFavoriteId, setHoveredFavoriteId] = useState<number | null>(null);
    const [isFindResult, setFindResults] = useState<boolean>(false);
    const favoritesRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const debounceSearch = useDebounce(search, 1000)

    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const t = localStorage.getItem("token");
            setToken(t);
        }
    }, []);



    useEffect(() => {
        if (debounceSearch.length <= 3) {
            const savedSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
            setRecentSearches(savedSearches);
        }
    }, [debounceSearch]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (debounceSearch?.length > 3 && eventSearch?.length === 0 && !isOpenEvent) {
            setFindResults(true);
        }
    }, [debounceSearch, eventSearch, isOpenEvent]);

    useEffect(() => {
        if (debounceSearch?.length > 3) {
            setIsOpenEvent(true)
            setFindResults(true);
            getEventBySearch(debounceSearch);
        } else {
            setFindResults(false);
            resetEventBySearch();
        }
    }, [debounceSearch])

    useEffect(() => {
        resetEventBySearch();
        setIsOpenEvent(false)
    }, [])

    const saveSearch = (term: string) => {
        getValueSearch(term);
        // Obtener búsquedas recientes desde localStorage
        const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");

        // Evitar duplicados y limitar el historial a las últimas 10 búsquedas
        const updatedSearches = [term, ...recentSearches.filter((item: string) => item !== term)].slice(0, 10);

        // Guardar búsquedas recientes en localStorage
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

        // Actualizar el estado
        setRecentSearches(updatedSearches);

        setIsOpenEvent(false)
        setSearch("");
    };

    const deleteFavorites = (e: any, item: any) => {
        e.stopPropagation();
        deleteFavorite(item)
    }

    const eventsOnlyFavorites = favorites ?? [];

    const navigateEvent = (item: any) => {
        setIsOpenFavorite(false); // Close modal before navigating
        navigation.push(`/evento/${item?.ideventos}/${item.idfecha}`)
    }

    const isMobile = useIsMobile(767); // aligned with Tailwind's md: breakpoint used alongside it below

    function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
        if (!highlight) {
            return <span>{text}</span>;
        }

        // Crear una expresión regular para buscar el texto que coincide, ignorando mayúsculas/minúsculas
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text?.split(regex);

        return (
            <span>
                {parts?.map((part, index) =>
                    regex.test(part) ? (
                        <b key={index} className="font-black text-black">
                            {part}
                        </b>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    }

    const closeModal = () => {
        document.body.classList.remove('ReactModal__Body--open');
        setIsOpenFavorite(false);
    }

    useEffect(() => {
        return () => {
            document.body.classList.remove('ReactModal__Body--open');
        };
    }, [isOpenFavorite, isOpenEvent]);

    const logoutUser = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
        }
        logout();
        // Clear favorites on logout
        useFavoriteStore.setState({ favorites: [] });
        setIsUserDropdownOpen(false);
        navigation.push('/');
    };

    useEffect(() => {
        me();
    }, [])

    // Hide Header on Admin routes
    if (path?.startsWith('/admin')) return null;

    return (
        <div className="border-b border-solid border-[#EDEFF5] bg-[#F9FAFC]">
            <Auth openAuth={openAuth} setOpenAuth={setOpenAuth} isRegister={authRegisterMode} setIsRegister={setAuthRegisterMode} />
            <div className="2xl:max-w-screen-2xl xl:max-w-screen-xl xl:px-10 max-w-[998px] h-18 py-3 px-3 mx-auto items-center grid grid-cols-12">
                <Link prefetch={true} className='w-32 md:w-48 col-span-4 md:col-span-3' href="/"><Image src={logo} alt="logo" className='w-full' height={400} width={300} /></Link>
                {
                    !path.startsWith("/busqueda") && (
                        <div className={
                            isMobile ?
                                "relative w-full" : "hidden relative border col-start-4 col-end-9 w-full col-span-5 md:flex items-center border-1 border-solid border-[#e8e8e8] rounded-[50px] bg-white"}>
                            <div className="flex justify-center pr-2 pl-4">
                                <Image src={lupa} width={28} onClick={() => setIsOpenEvent(true)} alt="lupa" className="hidden md:block" />
                            </div>
                            <div className="relative w-full rounded-2xl" ref={searchRef}>
                                {
                                    !isMobile &&
                                    <input
                                        onClick={() => setIsOpenEvent(true)}
                                        onChange={(e: any) => setSearch(e.target.value)}
                                        type="text" placeholder="Evento o lugar"
                                        value={search}
                                        className="w-full  placeholder:text-[#bababa] bg-transparent border-none rounded-3xl relative outline-none font-[Quicksand] py-3 text-md text-[#5C6570] font-bold"
                                    />
                                }
                                {
                                    isOpenEvent && (
                                        <div ref={refEvent} className={"hidden md:block md:max-h-[400px] px-5 md:px-0 md:p-0 md:h-auto overflow-y-auto absolute bg-[#fff] w-full left-0 rounded-xl shadow-custom-2 md:top-16 h-[100vh] top-0 z-50"}>
                                            {
                                                isMobile && <div className="flex border mt-5 border-solid border-[#ddd] p-3 rounded-full">
                                                    <Image src={lupa} alt="lupa" className="" />
                                                    <input className='w-full outline-none pl-3' onChange={(e: any) => setSearch(e.target.value)} type="text" placeholder="Evento o lugar" />
                                                    <Icon width={30} icon="openmoji:close" color='#8B2B2C' onClick={() => setIsOpenEvent(false)} />
                                                </div>
                                            }
                                            <div>
                                                <div>
                                                    {
                                                        eventSearch?.length > 0 ? <>
                                                            <div>
                                                                <h3 className='pt-5 pb-5 md:p-5 md:pb-4 sticky top-0 font-bold bg-[#fff] z-50 text-[20px] border-b border-solid border-[#ddd]'>Eventos</h3>
                                                                {eventSearch?.length > 0 && eventSearch?.slice(0, 10)?.map((item: any, index: number) => (
                                                                    <Link onClick={() => {
                                                                        saveSearch(item.titulo)

                                                                    }} className={sans.className} href={`/evento/${item?.ideventos}/${item.idfecha}`} key={index}>

                                                                        <div className='flex justify-between md:p-5 pb-3 pt-2 md:pt-5'>
                                                                            <div className='flex items-center'>
                                                                                <div className="w-[40px] h-[40px] mr-4">
                                                                                    <Image className='w-full h-full object-fill' objectFit='contain' width={100} height={100} src={item.url || item.imageUrl} alt="" />
                                                                                </div>
                                                                                <div>
                                                                                    <h3 className='font-normal text-md text-black text-ellipsis w-[320px] overflow-hidden whitespace-nowrap'> <HighlightedText text={item.titulo} highlight={search} /></h3>
                                                                                    <span className='opacity-[0.5] text-[13px]'>{item.NombreLocal}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className='text-right'>
                                                                                <p className={quicksand.className + ' font-bold opacity-50'}> {moment(item.FechaInicio).utcOffset(-5).format('ddd, D MMM').toLowerCase().replace('.', "")}</p>
                                                                                <p className={quicksand.className + ' text-right text-[#848484] text-[14px]'}>{item.HoraInicio}</p>
                                                                            </div>
                                                                        </div>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                            <div>
                                                                {
                                                                    eventSearch?.length > 0 && (
                                                                        <div onClick={() => {
                                                                            saveSearch(search)

                                                                        }} className='pt-4 md:p-4 border-t border-solid border-[#ddd]'>
                                                                            <Link className='text-md text-[#1087AA]' href={`/busqueda/${search}`}><p>Ver todos los resultados para <strong>{search}</strong></p></Link>
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                        </>
                                                            :


                                                            <div>
                                                                {
                                                                    isFindResult ? <>
                                                                        <div>
                                                                            <p className='p-4 py-5 text-[#222]'>Ver todos los resultados para <strong>{search}</strong></p>
                                                                        </div>
                                                                    </> :
                                                                        <>
                                                                            {recentSearches?.length > 0 &&
                                                                                // <p className={styles.noResults}>Ver todos los resultado para <strong>{search || "Por buscar ..."}</strong></p>
                                                                                <div>
                                                                                    <h3 className='p-5 font-bold text-[16px] border-b border-solid border-[#ddd]'>Recientes</h3>
                                                                                    <ul>
                                                                                        {recentSearches.length > 0 ? (
                                                                                            recentSearches.map((term, index) => (
                                                                                                <li key={index} onClick={() => setSearch(term)} className="px-5 py-2 cursor-pointer hover:bg-gray-100">
                                                                                                    {term}
                                                                                                </li>
                                                                                            ))
                                                                                        ) : (
                                                                                            <p className="p-2 text-gray-500">No tienes búsquedas recientes</p>
                                                                                        )}
                                                                                    </ul>
                                                                                </div>
                                                                            }
                                                                        </>
                                                                }
                                                            </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

                                {
                                    isMobile && isOpenEvent && (
                                        <ReactModal
                                            isOpen
                                            ariaHideApp={false}
                                            className={"p-0 m-0 bg-[#fff] overflow-y-auto overflow-x-hidden h-screen w-screen"}
                                            style={{
                                                content: {
                                                    position: 'fixed',
                                                    inset: 0,
                                                    padding: 0,
                                                    margin: 0,
                                                    border: 'none',
                                                    borderRadius: 0,
                                                    width: '100vw',
                                                    height: '100vh',
                                                    maxWidth: '100vw',
                                                    maxHeight: '100vh',
                                                    overflow: 'hidden',
                                                },
                                                overlay: {
                                                    position: 'fixed',
                                                    inset: 0,
                                                    backgroundColor: '#ffffff',
                                                    zIndex: 9999,
                                                    margin: 0,
                                                    padding: 0,
                                                }
                                            }}
                                        >
                                            <div ref={refEvent} className={"w-screen h-screen overflow-y-auto overflow-x-hidden bg-[#fff] px-5"}>
                                                {
                                                    isMobile && <div className="flex border mt-5 border-solid border-[#ddd] p-3 rounded-full icon">
                                                        <Image src={lupa} alt="lupa" className="" />
                                                        <input className='w-full outline-none pl-3' value={search} onChange={(e: any) => setSearch(e.target.value)} type="text" placeholder="Evento o lugar" />
                                                        <Icon width={33} icon="openmoji:close" onClick={() => {
                                                            setIsOpenEvent(false);
                                                            setSearch(""); // Reset input on close
                                                        }} />
                                                    </div>
                                                }
                                                <div>
                                                    <div>
                                                        {
                                                            eventSearch?.length > 0 ? <>
                                                                <div>
                                                                    <h3 className='pt-5 pb-5 md:p-5 md:pb-4 sticky top-0 font-bold bg-[#fff] z-50 text-[20px] border-b border-solid border-[#ddd]'>Eventos</h3>
                                                                    {eventSearch?.length > 0 && eventSearch?.slice(0, 10)?.map((item: any, index: number) => (
                                                                        <Link onClick={() => {
                                                                            saveSearch(item.titulo)

                                                                        }} className={sans.className} href={`/evento/${item?.ideventos}/${item.idfecha}`} key={index}>

                                                                            <div className='flex justify-between md:p-5 pb-3 pt-2 md:pt-5'>
                                                                                <div className='flex items-center'>
                                                                                    <div className="w-[40px] h-[40px] mr-4">
                                                                                        <Image className='w-full h-full object-fill' objectFit='contain' width={100} height={100} src={item.url || item.imageUrl} alt="" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <h3 className='font-normal text-md text-[#444] text-ellipsis md:w-[320px] max-w-[50vw] overflow-hidden whitespace-nowrap'> <HighlightedText text={item.titulo} highlight={search} /></h3>
                                                                                        <span className='opacity-[0.5] text-[13px]'>{item.NombreLocal}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className='text-right'>
                                                                                    <p className={quicksand.className + ' font-bold opacity-50'}> {moment(item.FechaInicio).utc().format('ddd, D MMM').toLowerCase().replace('.', "")}</p>
                                                                                    <p className={quicksand.className + ' text-right text-[#848484] text-[14px]'}>{item.HoraInicio}</p>
                                                                                </div>
                                                                            </div>
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                                <div>
                                                                    {
                                                                        eventSearch?.length > 0 && (
                                                                            <div onClick={() => {
                                                                                saveSearch(search)

                                                                            }} className='pt-4 md:p-4 border-t border-solid border-[#ddd]'>
                                                                                <Link className='text-md text-[#1087AA]' href={`/busqueda/${search}`}><p>Ver todos los resultados para <strong>{search}</strong></p></Link>
                                                                            </div>
                                                                        )
                                                                    }
                                                                </div>
                                                            </>
                                                                :


                                                                <div>
                                                                    {
                                                                        isFindResult ? <>
                                                                            <div>
                                                                                <p className='p-4 py-5 text-[#862020]'>Ver todos los resultados para <strong>{search}</strong></p>
                                                                            </div>
                                                                        </> :
                                                                            <>
                                                                                {recentSearches?.length > 0 &&
                                                                                    // <p className={styles.noResults}>Ver todos los resultado para <strong>{search || "Por buscar ..."}</strong></p>
                                                                                    <div>
                                                                                        <h3 className='p-5 font-bold text-[16px] border-b border-solid border-[#ddd] mb-3'>Recientes</h3>
                                                                                        <ul>
                                                                                            {recentSearches.length > 0 ? (
                                                                                                recentSearches.map((term, index) => (
                                                                                                    <li key={index} onClick={() => setSearch(term)} className="px-5 py-2 cursor-pointer hover:bg-gray-100">
                                                                                                        {term}
                                                                                                    </li>
                                                                                                ))
                                                                                            ) : (
                                                                                                <p className="p-2 text-gray-500">No tienes búsquedas recientes</p>
                                                                                            )}
                                                                                        </ul>
                                                                                    </div>
                                                                                }
                                                                            </>
                                                                    }
                                                                </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </ReactModal>


                                    )
                                }
                            </div>
                        </div>
                    )
                }



                <div className={`col-start-9 col-end-13 flex justify-end md:relative items-center gap-2 ${(path === "/nosotros" || path === "/preguntas-frecuentes" || path === "/terminos-y-condiciones" || path === "/contactanos") && (auth as any)?.userType !== 'COMPANY' ? 'hidden md:flex' : ''}`} ref={favoritesRef}>
                    {/* User Section - Avatar Dropdown (Desktop & Mobile) */}
                    {auth !== null && (
                        <div className="relative" ref={refUserDropdown}>
                            <button
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                {/* Avatar */}
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#007FA4] to-[#00DFD1] flex items-center justify-center text-white font-bold text-xs md:text-sm overflow-hidden border-2 border-white shadow-md">
                                    {(() => {
                                        const a: any = auth;
                                        const profile = a?.profile;
                                        // Using centralized asset logic
                                        const { avatar } = getProfileAssets(profile);

                                        return <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />;
                                    })()}
                                </div>
                                {/* User Name */}
                                {/* <span className="font-bold text-[#212121] text-sm hidden lg:block max-w-[150px] truncate">
                                            {(() => {
                                                const a: any = auth;
                                                const fullName = [a?.profile?.firstName, a?.profile?.lastName]
                                                    .filter(Boolean)
                                                    .join(' ')
                                                    .trim();
                                                const legacy = `${a?.nombre ?? ''} ${a?.Apellido ?? ''}`.trim();
                                                return fullName || legacy || 'Usuario';
                                            })()}
                                        </span> */}
                                {/* <Icon icon="solar:alt-arrow-down-linear" className={`text-[#666] transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} width={16} /> */}
                            </button>

                            {/* Dropdown Menu */}
                            {isUserDropdownOpen && (
                                <div className="absolute right-0 md:right-[-90px] top-14 w-56 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
                                    {/* <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="font-bold text-[#212121] text-sm truncate">
                                                    {(() => {
                                                        const a: any = auth;
                                                        return a?.email || 'usuario@email.com';
                                                    })()}
                                                </p>
                                            </div> */}
                                    <Link onClick={() => setIsUserDropdownOpen(false)} href={`/usuario/${(auth as any)?.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                                        <Icon icon="solar:user-bold" className="text-[#007FA4]" width={20} />
                                        <span className="text-[#212121] text-sm">Ver perfil</span>
                                    </Link>
                                    <Link onClick={() => setIsUserDropdownOpen(false)} href="/explorar" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                                        <Icon icon="solar:compass-bold" className="text-[#007FA4]" width={20} />
                                        <span className="text-[#212121] text-sm">Explorar</span>
                                    </Link>
                                    <Link onClick={() => setIsUserDropdownOpen(false)} href="/amigos" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                                        <Icon icon="solar:users-group-rounded-bold" className="text-[#007FA4]" width={20} />
                                        <span className="text-[#212121] text-sm">Amigos</span>
                                    </Link>

                                    {/* My Events - Only for COMPANY type */}
                                    {(() => {
                                        const a: any = auth;
                                        if (a?.userType === 'COMPANY') {
                                            return (
                                                <Link onClick={() => setIsUserDropdownOpen(false)} href="/mis-eventos" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                                                    <Icon icon="solar:calendar-bold" className="text-[#007FA4]" width={20} />
                                                    <span className="text-[#212121] text-sm">Mis Eventos</span>
                                                </Link>
                                            );
                                        }
                                        return null;
                                    })()}

                                    <Link onClick={() => setIsUserDropdownOpen(false)} href="/mensajes" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                                        <Icon icon="solar:chat-round-dots-bold" className="text-[#007FA4]" width={20} />
                                        <span className="text-[#212121] text-sm">Mis Mensajes</span>
                                    </Link>

                                    <Link onClick={() => setIsUserDropdownOpen(false)} href="/perfil/editar" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                                        <Icon icon="solar:settings-bold" className="text-[#007FA4]" width={20} />
                                        <span className="text-[#212121] text-sm">Configuración</span>
                                    </Link>

                                    {/* Admin Link - Only for ADMIN role */}
                                    {(() => {
                                        const a: any = auth;
                                        if (a?.userType === 'COMPANY') {
                                            return (
                                                <Link onClick={() => setIsUserDropdownOpen(false)} href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors border-t border-gray-100">
                                                    <Icon icon="solar:widget-bold" className="text-purple-600" width={20} />
                                                    <span className="text-purple-600 text-sm font-medium">Ir Administrador</span>
                                                </Link>
                                            );
                                        }
                                        return null;
                                    })()}

                                    <div className="border-t border-gray-100 mt-2 pt-2">
                                        <button
                                            onClick={logoutUser}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left"
                                        >
                                            <Icon icon="solar:logout-2-bold" className="text-red-500" width={20} />
                                            <span className="text-red-500 text-sm font-medium">Cerrar Sesión</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    {
                        (path === "/nosotros" || path === "/preguntas-frecuentes" || path === "/terminos-y-condiciones" || path === "/contactanos") && (auth as any)?.userType !== 'COMPANY' && (
                            <div className='col-start-9 md:col-start-8 xl:col-start-7 col-end-13 md:col-end-10 flex justify-end items-center mr-4'>
                                <a href="https://www.facebook.com/injoyplan" target="_blank" rel="noopener noreferrer" className='border-[#007FA4] border border-solid rounded-full md:px-4 px-4 py-0.5 md:py-[2px] hover:bg-gray-100 transition-colors'>
                                    <Image className='md:w-3 py-2 w-[10px]' src={fb} width={20} height={20} alt='facebook' />
                                </a>
                                <a href="https://www.instagram.com/injoyplan" target="_blank" rel="noopener noreferrer" className='ml-3 border-[#007FA4] border border-solid rounded-full md:px-2.5 px-3 py-3 md:py-[10px] hover:bg-gray-100 transition-colors'>
                                    <Image className='md:w-6 w-[17px]' src={ig} width={20} height={20} alt='ig' />
                                </a>
                            </div>
                        )
                    }


                    {/* Login Button (Not Authenticated) */}
                    {auth === null && !isMobile && path !== "/nosotros" && path !== "/preguntas-frecuentes" && path !== "/terminos-y-condiciones" && path !== "/contactanos" && (
                        <button onClick={() => setOpenAuth(true)}
                            className='text-white bg-[#007FA4] text-[15px] py-[10px] px-[25px] rounded-[20px] font-open-sans cursor-pointer'
                        >Ingresar</button>
                    )}
                    {auth === null && isMobile && path !== "/nosotros" && path !== "/preguntas-frecuentes" && path !== "/terminos-y-condiciones" && path !== "/contactanos" && (
                        <button onClick={() => setOpenAuth(true)}
                            className='text-white bg-[#007FA4] text-[15px] p-2 rounded-[20px] font-open-sans cursor-pointer'
                        ><Icon icon="solar:user-bold" width="10" height="10" /></button>
                    )}

                    {/* Explore Icon (Desktop & Mobile) */}
                    {/* <Link
                        href="/explorar"
                        className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                        title="Explorar"
                    >
                        <Icon icon="solar:compass-bold" className="text-[#007FA4]" width={28} />
                    </Link> */}

                    {/* Mobile Search */}
                    {isMobile && !path.startsWith('/busqueda') && (
                        <Image onClick={() => {
                            setIsOpenEvent(true);
                            setSearch(""); // Clear local input (Correct function is setSearch)
                            resetEventBySearch(); // Clear zustand results
                        }} className='' src={lupaMobile} alt="lupa" width={30} height={30} />
                    )}
                    {
                        path !== "/nosotros" && path !== "/preguntas-frecuentes" && path !== "/terminos-y-condiciones" && path !== "/contactanos" && (
                            isOpenFavorite ? (
                                <Image src={heartWhite} className='md:bg-[#007FA4] cursor-pointer rounded-full p-2' alt="cora" width={43} height={43} onClick={() => setIsOpenFavorite(true)} />
                            ) :
                                (
                                    <Image src={cora} className='md:bg-[#DBEBF1] cursor-pointer rounded-full p-2' alt="cora" width={43} height={43} onClick={() => setIsOpenFavorite(true)} />
                                )

                        )
                    }


                    <div className='md:hidden'>
                        {
                            isOpenFavorite && isMobile && (
                                <ReactModal
                                    isOpen
                                    ariaHideApp={false}
                                    className={"p-0 m-0 bg-[#fff] overflow-y-auto overflow-x-hidden h-screen w-screen"}
                                    style={{
                                        content: {
                                            position: 'fixed',
                                            inset: 0,
                                            padding: 0,
                                            margin: 0,
                                            border: 'none',
                                            borderRadius: 0,
                                            width: '100vw',
                                            height: '100vh',
                                            minHeight: '100vh',
                                            maxHeight: '100vh',
                                            overflow: 'auto',
                                            background: '#ffffff',
                                        },
                                        overlay: {
                                            position: 'fixed',
                                            inset: 0,
                                            backgroundColor: '#ffffff',
                                            zIndex: 9999,
                                            margin: 0,
                                            padding: 0,
                                        }
                                    }}
                                >
                                    <div ref={refFavorite} className='overflow-y-auto min-h-screen bg-white pb-20'>
                                        <div className='pr-6'>
                                            <div className='sticky top-0 bg-[#fff] z-50'>
                                                <h6 className='text-[18px] text-center md:text-left text-[#333] font-bold p-3  px-5 border-b border-solid border-[#e8e8e8]'>Favoritos</h6>
                                                {
                                                    isMobile && <div className={styles.closeFavorites}>
                                                        <Icon className='cursor-pointer absolute right-4 top-4' width={24} icon="ic:baseline-close" onClick={closeModal} />
                                                    </div>
                                                }
                                            </div>
                                            <div className="p-5">
                                                {
                                                    eventsOnlyFavorites.length > 0 ? eventsOnlyFavorites?.map((item: any, index: number) => (
                                                        <div className="flex mt-2 mb-8 last:mb-0 relative w-full cursor-pointer group"
                                                            onClick={() => navigateEvent(item)}
                                                            key={index}
                                                            onMouseEnter={() => setHoveredFavoriteId(item.idfavoritos)}
                                                            onMouseLeave={() => setHoveredFavoriteId(null)}

                                                        >
                                                            <div className='w-[45px] h-[35px] mr-4'>
                                                                <Image className='w-full h-full' width={45} height={45} src={item.url} alt="" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className='text-[13px] font-bold text-[#4a4a4a]'>{moment(item.FechaInicio).utcOffset(-5).format('D MMM').toUpperCase()} - {item.HoraInicio} - {item.HoraFinal}</p>
                                                                <h3 className='group-hover:text-[#037BA1] transition duration-100 font-bold mb-0 text-md text-[#212121] text-ellipsis max-w-[250px] overflow-hidden whitespace-nowrap'>{item.titulo}</h3>
                                                                <p className='font-normal text-[13px]'>{item.NombreLocal}</p>
                                                            </div>

                                                            {/* Mobile delete button - always visible */}
                                                            {isMobile && (
                                                                <button
                                                                    className='absolute right-0 top-0 p-2 z-50'
                                                                    onClick={(e: any) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        deleteFavorites(e, item);
                                                                    }}
                                                                >
                                                                    <Icon icon="ic:baseline-close" width={20} />
                                                                </button>
                                                            )}

                                                            {/* Desktop delete button - show on hover */}
                                                            {!isMobile && (
                                                                <Icon
                                                                    className={`absolute right-0 top-0 transition-opacity duration-200 ${hoveredFavoriteId === item.idfavoritos ? "opacity-100" : "opacity-0"}`}
                                                                    icon="ic:baseline-close"
                                                                    onClick={(e: any) => {
                                                                        e.stopPropagation();
                                                                        deleteFavorites(e, item);
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    )) :

                                                        <div className='p-10 px-16 py-20 relative z-50 text-center mx-auto flex justify-center'>
                                                            <div>
                                                                <Image src={calendar} alt="" className='mb-6 text-center mx-auto' width={60} height={60} />
                                                                <strong className='text-[16px]'>Aún no tienes eventos favoritos</strong>
                                                                <p className='text-[14px] mt-2'>En cuanto los tengas, podrás verlos aquí</p>
                                                            </div>
                                                        </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </ReactModal>
                            )
                        }
                    </div>

                    {
                        isOpenFavorite && (
                            <div
                                ref={refFavorite}
                                className={"hidden md:block md:left-auto left-0 w-full md:w-[430px] overflow-hidden md:overflow-y-auto md:max-h-auto max-h-[400px] overflow-y-scroll md:shadow-custom-2 bg-[#fff] md:rounded-xl md:top-14 absolute md:right-0 z-50 md:after:absolute md:after:top-[-10px] md:after:right-[10px] md:after:mx-auto md:after:w-[1px] md:after:border-b-[11px] md:after:border-b-white md:after:border-l-[11px] md:after:border-l-transparent md:after:border-r-[11px] md:after:border-r-transparent md:after:content-['']"}
                            >
                                <ul>
                                    <div>
                                        <div>
                                            <h6 className='text-[18px] text-center md:text-left text-[#333] font-bold p-3 px-5 border-b border-solid border-[#e8e8e8]'>Favoritos</h6>
                                            {
                                                isMobile && <div>
                                                    <Icon className='cursor-pointer absolute right-4 top-4' width={24} icon="ic:baseline-close" onClick={() => setIsOpenFavorite(false)} />
                                                </div>
                                            }
                                        </div>
                                        <div className="p-5">
                                            {
                                                eventsOnlyFavorites.length > 0 ? eventsOnlyFavorites?.map((item: any, index: number) => (
                                                    <div className="flex mt-2 mb-8 last:mb-0 relative w-full cursor-pointer group"
                                                        onClick={() => navigateEvent(item)}
                                                        key={index}
                                                        onMouseEnter={() => setHoveredFavoriteId(item.idfavoritos)}
                                                        onMouseLeave={() => setHoveredFavoriteId(null)}

                                                    >
                                                        <div className='w-[45px] h-[35px] mr-4'>
                                                            <Image className='w-full h-full' width={45} height={45} src={item.url} alt="" />
                                                        </div>
                                                        <div>
                                                            <p className='text-[13px] font-bold text-[#4a4a4a]'>{moment(item.FechaInicio).utc().format('D MMM').toUpperCase()} - {item.HoraInicio} - {item.HoraFinal}</p>
                                                            <h3 className='group-hover:text-[#037BA1] transition duration-100 font-bold mb-0 text-md text-[#212121] text-ellipsis w-[310px] overflow-hidden whitespace-nowrap'>{item.titulo}</h3>
                                                            <p className='font-normal text-[13px]'>{item.NombreLocal}</p>
                                                        </div>

                                                        {
                                                            isMobile && <Icon className='absolute right-0 top-0' icon="ic:baseline-close" onClick={(e: any) => deleteFavorites(e, item)} />
                                                        }

                                                        <Icon
                                                            className={`absolute right-0 top-0 transition-opacity duration-200 ${hoveredFavoriteId === item.idfavoritos ? "opacity-100" : "opacity-0"
                                                                }`}
                                                            icon="ic:baseline-close"
                                                            onClick={(e: any) => {
                                                                e.stopPropagation(); // Evita que el evento alcance otros handlers
                                                                deleteFavorites(e, item);
                                                            }}
                                                        />
                                                    </div>
                                                )) :

                                                    <div className='p-10 px-16 py-20 relative z-50 text-center mx-auto flex justify-center'>
                                                        <div>
                                                            <Image src={calendar} alt="" className='mb-6 text-center mx-auto' width={60} height={60} />
                                                            <strong className='text-[16px]'>Aún no tienes eventos favoritos</strong>
                                                            <p className='text-[14px] mt-2'>En cuanto los tengas, podrás verlos aquí</p>
                                                        </div>
                                                    </div>
                                            }
                                        </div>
                                    </div>
                                </ul>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Header