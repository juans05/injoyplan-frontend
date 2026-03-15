"use client"
import { ICategoriesState, useCategoriesState } from "@/app/zustand/categories";
import { IEventsState, useEventStore } from "@/app/zustand/events";
import moment from "moment";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import ticket from '../../../../public/svg/tickets_gray.svg'
import { Icon } from "@iconify/react/dist/iconify.js";
import { motion } from "framer-motion";
import SelectPro from "@/app/components/SelectPro";
import { DateTime } from "@/app/components/Date";
import comp from './../../../../public/svg/share.svg'
import corp from './../../../../public/svg/heart.svg'
import filter from './../../../../public/svg/filter.svg'
import flc from './../../../../public/svg/angle_right.svg'
import Link from "next/link";
import Image from "next/image";
import { quicksand, sans } from "../../../../public/fonts";
import Card from "@/app/components/Card";
import { IFavoriteState, useFavoriteStore } from "@/app/zustand/favorites";
import useOutsideClick from "@/app/hooks/useOutsideClick";
import ReactModal from "react-modal";
import { IAuthState, useAuthStore } from "@/app/zustand/auth";
import Auth from "@/app/ui/Auth";
import useAlertStore from "@/app/zustand/alert";
import useDebounce from "@/app/hooks/useDebounce";
import MoreFilters from "@/app/ui/MoreFilters";
import CardSkeleton from '@/app/components/CardSkeleton';


const BusquedaEvento = () => {
    const params = useParams();

    moment.updateLocale('es', {
        months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
        monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
        weekdays: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
        weekdaysShort: 'Dom._Lun._Mar._Mié._Jue._Vie._Sáb.'.split('_'),
        weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sá'.split('_')
    });

    const { getEventSearchByFilters, eventSearchByFilters, total, valueSearch, isLoading }: IEventsState = useEventStore();

    // If navigating via category ID (params.value is a number), reset search text to empty
    // If navigating via search term (params.value is text like "moto"), use it as initial search value
    // Otherwise, use the stored valueSearch from header search
    const paramValue = Array.isArray(params?.value) ? params.value[0] : params?.value;
    const paramAsNumber = Number(paramValue);
    const isNumericCategory = !isNaN(paramAsNumber) && paramAsNumber !== 0;
    const isSearchTerm = paramValue && isNaN(paramAsNumber);

    const isAllCategories = paramAsNumber === 0;

    // Decode URI component for search terms (e.g., "rock%20latino" -> "rock latino")
    const decodedSearchTerm = isSearchTerm ? decodeURIComponent(paramValue) : '';

    const [search, setSearch] = useState<any>(
        isSearchTerm ? decodedSearchTerm : ((isNumericCategory || isAllCategories) ? '' : valueSearch)
    );

    const { countsCategories, getCategoriesCount, categoryInfo }: ICategoriesState = useCategoriesState();
    const { addFavorite, deleteFavorite, favorites }: IFavoriteState = useFavoriteStore();

    // Initialize category from URL params if available (only if numeric), otherwise fallback to store or 0.
    // IF isAllCategories (param is 0), FORCE category to 0.
    // IF isSearchTerm (text search like "rock"), RESET category to 0 to show all categories
    const initialCategory = isNumericCategory ? paramAsNumber : (isAllCategories || isSearchTerm ? 0 : (categoryInfo !== null ? categoryInfo?.idCategorias : 0));
    const [category, setCategory] = useState<number | string>(isNumericCategory ? paramAsNumber : 0);
    const { auth }: IAuthState = useAuthStore();
    const [openAuth, setOpenAuth] = useState<boolean>(false);

    // Generate hours for filter
    const hours = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return { value: `${hour}:00`, label: `${hour}:00` };
    });

    useEffect(() => {
        // If it's a numeric category or all categories OR A SEARCH TERM context, don't override from store
        // We only want to sync from store if we are NOT in a specific route mode
        if (!isNumericCategory && !isAllCategories && !isSearchTerm && categoryInfo) {
            setCategory(categoryInfo.idCategorias);
        } else if (isSearchTerm) {
            // Force reset to 0 if it is a search term, to ensure we don't keep previous category
            setCategory(0);
        }
    }, [categoryInfo, isNumericCategory, isAllCategories, isSearchTerm]);

    const distritos = [
        { "id": 0, "value": "Todos los distritos" },
        { "id": 1, "value": "Ancón" },
        { "id": 2, "value": "Ate" },
        { "id": 3, "value": "Barranco" },
        { "id": 4, "value": "Breña" },
        { "id": 5, "value": "Carabayllo" },
        { "id": 6, "value": "Cercado de Lima" },
        { "id": 7, "value": "Chaclacayo" },
        { "id": 8, "value": "Chorrillos" },
        { "id": 9, "value": "Cieneguilla" },
        { "id": 10, "value": "Comas" },
        { "id": 11, "value": "El Agustino" },
        { "id": 12, "value": "Independencia" },
        { "id": 13, "value": "Jesús María" },
        { "id": 14, "value": "La Molina" },
        { "id": 15, "value": "La Victoria" },
        { "id": 16, "value": "Lince" },
        { "id": 17, "value": "Los Olivos" },
        { "id": 18, "value": "Lurigancho" },
        { "id": 19, "value": "Lurín" },
        { "id": 20, "value": "Magdalena del Mar" },
        { "id": 21, "value": "Miraflores" },
        { "id": 22, "value": "Pachacámac" },
        { "id": 23, "value": "Pucusana" },
        { "id": 24, "value": "Pueblo Libre" },
        { "id": 25, "value": "Puente Piedra" },
        { "id": 26, "value": "Punta Hermosa" },
        { "id": 27, "value": "Punta Negra" },
        { "id": 28, "value": "Rímac" },
        { "id": 29, "value": "San Bartolo" },
        { "id": 30, "value": "San Borja" },
        { "id": 31, "value": "San Isidro" },
        { "id": 32, "value": "San Juan de Lurigancho" },
        { "id": 33, "value": "San Juan de Miraflores" },
        { "id": 34, "value": "San Luis" },
        { "id": 35, "value": "San Martín de Porres" },
        { "id": 36, "value": "San Miguel" },
        { "id": 37, "value": "Santa Anita" },
        { "id": 38, "value": "Santa María del Mar" },
        { "id": 39, "value": "Santa Rosa" },
        { "id": 40, "value": "Santiago de Surco" },
        { "id": 41, "value": "Surquillo" },
        { "id": 42, "value": "Villa El Salvador" },
        { "id": 43, "value": "Villa María del Triunfo" }
    ]

    const searchParams = useSearchParams();
    const router = useRouter();

    const [date, setDate] = useState(searchParams.get('fechaInicio') ? moment(searchParams.get('fechaInicio'), 'YYYY-MM-DD').format('DD-MM-YYYY') : '');
    const [limit, setLimit] = useState(Number(searchParams.get('limit')) || 12);
    const [distrito, setDistrito] = useState<string | undefined>(searchParams.get('distrito') || undefined);

    const [filtersMore, setFiltersMore] = useState({
        esGratis: searchParams.get('esGratis') === 'true',
        enCurso: searchParams.get('enCurso') === 'true',
        horaInicio: searchParams.get('horaInicio') || "",
        horaFin: searchParams.get('horaFin') || ""
    });

    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isOpenFilter, setIsOpenFilter, ref] = useOutsideClick(false);

    const handleDate = (value: string, _name: string) => {
        setDate(moment(value, 'DD/MM/YYYY').format('DD-MM-YYYY'));
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    const searchDebounce = useDebounce(search, 1000)

    console.log(date)

    const buildSearchData = () => {
        const categoryName = countsCategories?.find((c: any) => Number(c.idCategorias) === Number(category))?.nombreCategoria || '';
        const formattedDate = date
            ? moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD')
            : moment().format('YYYY-MM-DD'); // Default to today logic handled by Default? Or just send undefined? 
        // Original code: : moment().format('YYYY-MM-DD'); 
        // Wait, if I explicitly clear date, I want undefined? 
        // But existing logic forced today. strict adherence.

        return {
            "categoria": Number(category) !== 0 ? categoryName : undefined,
            "distrito": distrito,
            "fechaInicio": formattedDate,
            "busqueda": searchDebounce,
            "limit": limit,
            "page": 1,
            "esGratis": filtersMore.esGratis ? true : undefined,
            "enCurso": filtersMore.enCurso ? true : undefined,
            "horaInicio": filtersMore.horaInicio || undefined,
            "horaFin": filtersMore.horaFin || undefined,

        };
    }

    // Effect: execution of search AND update of URL params
    useEffect(() => {
        const categorySelected = Number(category) !== 0;
        const categoriesLoaded = countsCategories && countsCategories.length > 0;

        if (paramAsNumber === 0 && Number(category) === 0) {
            // Proceed
        } else if (categorySelected && !categoriesLoaded) {
            return;
        }

        const data = buildSearchData();

        // Execute Search
        getEventSearchByFilters(data);

        // Update URL Params to persist state
        const params = new URLSearchParams();
        if (date) params.set('fechaInicio', moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD'));
        if (distrito) params.set('distrito', distrito);
        if (filtersMore.esGratis) params.set('esGratis', 'true');
        if (filtersMore.enCurso) params.set('enCurso', 'true');
        if (filtersMore.horaInicio) params.set('horaInicio', filtersMore.horaInicio);
        if (filtersMore.horaFin) params.set('horaFin', filtersMore.horaFin);
        if (limit !== 12) params.set('limit', limit.toString());
        // We don't necessarily need to persist page=1 unless we want deep linking to page n
        // params.set('page', '1'); 

        // Important: Preserve the dynamic route part (/busqueda/[value])
        // router.replace does not change the [value] part, only query
        // But we need to construct the full path. 
        // Note: pathname includes /busqueda/X. 
        // We just append ?params

        // Only push if params exist or if we want to clear them? 
        // router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
        // Use window.history to avoid re-rendering loop if not careful? 
        // Next.js router.replace is safer.
        router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });

    }, [searchDebounce, category, limit, date, countsCategories, filtersMore, distrito])

    const searchDataFilter = () => {
        const data = buildSearchData();
        setIsOpenFilter(false);
        document.body.classList.remove('ReactModal__Body--open');
        getEventSearchByFilters(data);
    }

    console.log(countsCategories)

    const handleSelectCategory = (_id: number) => {
        // setSearch("");
        setCategory(_id)
    }

    const handleSelectDistrict = (_id: number, value: string) => {
        // SelectPro passes (id, value, name, ...) to onChange
        // selectPro converts id to string, so we must cast or check loosely
        if (Number(_id) === 0) {
            setDistrito(undefined);
        } else {
            setDistrito(value);
        }
    }

    const navigateEvent = (item: any) => {
        router.push(`/evento/${item?.ideventos}/${item?.idfecha}`)
    }

    useEffect(() => {
        getCategoriesCount();
    }, [])

    console.log(eventSearchByFilters)
    const addFavoritesByUser = (item: any) => {
        console.log(item)
        if (item.esfavorito === 1 || item.favorito) { // added item.favorito check for consistency
            deleteFavorite(item)
        } else {
            addFavorite(item)
        }
    }



    const closeModal = () => {
        setIsOpenFilter(false);
        document.body.classList.remove('ReactModal__Body--open');
    }



    console.log(eventSearchByFilters)

    // Effect to reset pagination when filters change
    useEffect(() => {
        setPage(1);
        setHasMore(true);
    }, [searchDebounce, category, date, filtersMore, distrito]);

    // Update hasMore based on total results
    useEffect(() => {
        if (eventSearchByFilters && total) {
            setHasMore(eventSearchByFilters.length < total);
        }
    }, [eventSearchByFilters, total]);

    const loadMoreEvents = () => {
        if (isLoadingMore || !hasMore) return;

        const nextPage = page + 1;
        setIsLoadingMore(true);

        const data = buildSearchData();

        // Add artificial delay for better UX (spinner visibility)
        setTimeout(() => {
            getEventSearchByFilters(data, { page: nextPage, isLoadMore: true, limit: 12 })
                .finally(() => {
                    setIsLoadingMore(false);
                    setPage(nextPage);
                });
        }, 1500);
    };

    const handleViewAll = () => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);

        const data = buildSearchData();
        const nextPage = page + 1;

        // Load the next page of 12 events
        setTimeout(() => {
            getEventSearchByFilters(data, { page: nextPage, isLoadMore: true, limit: 12 })
                .finally(() => {
                    setIsLoadingMore(false);
                    setPage(nextPage);
                    // hasMore will be updated by the useEffect that checks total vs current count
                });
        }, 500);
    };

    // Infinite Scroll Listener
    useEffect(() => {
        const handleScroll = () => {
            if (page >= 3 || !hasMore || isLoadingMore) return;

            const scrollTop = window.innerHeight + document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;

            if (scrollTop + 1 >= scrollHeight - 500) {
                loadMoreEvents();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [page, hasMore, isLoadingMore]);

    return (
        <div>
            <>
                <Auth openAuth={openAuth} setOpenAuth={setOpenAuth} />
                <div className="bg-[#007FA4]">
                    <div className="py-14 2xl:max-w-screen-2xl xl:max-w-screen-xl mx-auto lg:max-w-screen-lg z-0 relative max-x-screen-md px-3 lg:px-4 xl:px-32">
                        <div className="">
                            <div className="flex items-center px-5 md:px-0">
                                <div className="w-full max-w-[400px] border-b border-solid border-[#fff] z-0 relative top-2">
                                    <input value={search} placeholder="Busca por palabra" className="placeholder:text-[#fff] w-full bg-transparent outline-none capitalize text-[#fff]" onChange={handleChange} type="text" name='search' />
                                    {search.length === 0 && <Icon icon="ei:search" className="absolute right-2 top-[-8px]" width={30} color="#fff" onClick={() => setSearch("")} />}
                                    <div className="absolute top-[-10px] right-2 cursor-pointer">
                                        {search.length > 0 && <Icon icon="ei:close" width={30} color="#fff" onClick={() => setSearch("")} />}
                                    </div>
                                    <div className="absolute top-[-10px] right-2 cursor-pointer">
                                        {search.length > 0 && <Icon icon="ei:close" width={30} color="#fff" onClick={() => setSearch("")} />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="hidden md:grid md:grid-cols-4 xl:gap-x-32 lg:gap-x-64 gap-5 mt-10 2xl:max-w-screen-2xl xl:max-w-screen-xl mx-auto lg:max-w-screen-lg relative max-x-screen-md px-3 lg:px-4 xl:px-32">
                        <div className="md:col-auto sm:col-start-1 sm:col-end-5">
                            <SelectPro isIconLeft={true} options={distritos} placeholder={`Explora en Lima, Peru`} name='distrito' onChange={handleSelectDistrict} />
                        </div>
                        <div className="md:col-auto col-start-1 col-end-5 z-20">
                            <DateTime onChange={handleDate} name="dateStart" placeholder="desde hoy" />
                        </div>
                        <div className="md:col-auto col-start-1 col-end-5 z-20">
                            <SelectPro isIconLeft={false} options={[{ id: 0, value: "Todas las categorías" }, ...(countsCategories?.map((item: any) => ({
                                id: item?.idCategorias,
                                value: item?.nombreCategoria
                            })) || [])]} defaultValue={Number(category) === 0 ? undefined : (countsCategories?.find((c: any) => Number(c.idCategorias) === Number(category))?.nombreCategoria || undefined)} placeholder={`Todas las categorías`} name='categoria' onChange={handleSelectCategory} />
                        </div>
                        <div className="md:col-auto col-start-1 col-end-5 flex items-center">
                            <MoreFilters onApply={(data: any) => setFiltersMore({ ...filtersMore, ...data })} />
                        </div>

                    </div>

                    {/* Mobile Header: Results Count & Filter Button MOVED HERE */}
                    <div className="md:hidden px-8 mt-10 mb-5 flex items-center justify-between">
                        <p>{eventSearchByFilters?.length} resultados</p>
                        <div className="flex cursor-pointer" onClick={() => setIsOpenFilter(true)}>
                            <p className="text-[#007FA4] uppercase font-bold mr-2">Filtros </p>
                            <Image src={filter} width={20} height={20} alt="filtro" />
                        </div>
                    </div>

                    {
                        isLoading ? (
                            <div className="2xl:max-w-screen-2xl xl:max-w-screen-xl mx-auto lg:max-w-screen-lg px-3 lg:px-4 xl:px-32 mt-10">
                                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {[...Array(6)].map((_, i) => (
                                        <CardSkeleton key={i} />
                                    ))}
                                </div>
                                <div className="md:hidden px-8">
                                    {[...Array(3)].map((_, i) => (
                                        <CardSkeleton key={i} />
                                    ))}
                                </div>
                            </div>
                        ) : (eventSearchByFilters === undefined || eventSearchByFilters?.length === 0) ? (
                            <div className="text-center mt-32 mb-32">
                                <Image className="mx-auto grayscale" width={100} height={100} alt="No encontrados" src={ticket} />
                                <label htmlFor="" className={quicksand.className + ' font-bold text-[#4a4a4a] mb-5'}>No encontramos eventos</label>
                                <p className={sans.className + ' font-normal text-[#4a4a4a] text-[14px] mt-3'} >Intenta cambiando los filtros de búsqueda </p>
                            </div>
                        ) : ""
                    }


                    {
                        isOpenFilter && (
                            <ReactModal className={"p-0"} onRequestClose={() => setIsOpenFilter(false)} ariaHideApp={false} isOpen={isOpenFilter}>
                                <div ref={ref} className="absolute top-0 w-full bg-[#fff] h-[100vh] z-50 p-10 overflow-hidden">
                                    <h5 className="font-bold text-2xl border-b border-solid border-[#ddd] pb-5">Filtros de búsqueda</h5>
                                    <div className="absolute top-3 right-3">
                                        <Icon width={30} icon="ei:close" onClick={closeModal} />
                                    </div>
                                    <div className="md:grid md:grid-cols-4 md:overflow-hidden xl:gap-x-32 lg:gap-x-64 gap-5 mt-10 2xl:max-w-screen-2xl xl:max-w-screen-xl mx-auto lg:max-w-screen-lg relative max-x-screen-md lg:px-4 xl:px-32">
                                        <div className="md:col-auto sm:col-start-1 sm:col-end-5 w-full">
                                            <SelectPro isIconLeft={true} options={distritos} placeholder={`Explora en Lima, Peru`} name='distrito' onChange={() => { }} />
                                        </div>
                                        <div className="md:col-auto col-start-1 col-end-5 mt-5 w-full">
                                            <DateTime onChange={handleDate} name="dateStart" placeholder="desde hoy" />
                                        </div>
                                        <div className="md:col-auto col-start-1 col-end-5 mt-5 pb-5 w-full">
                                            <SelectPro
                                                isIconLeft={false}
                                                options={[{ id: 0, value: "Todas las categorias" }, ...countsCategories?.map((item: any) => ({
                                                    id: item?.idCategorias,
                                                    value: item?.nombreCategoria
                                                }))]}
                                                placeholder={`Todas las categorias`}
                                                name='categoria'
                                                onChange={handleSelectCategory}
                                                defaultValue={category === 0 ? "Todas las categorias" : (countsCategories?.find((c: any) => Number(c.idCategorias) === Number(category))?.nombreCategoria || "Todas las categorias")}
                                            />
                                        </div>

                                        {/* Mobile Filters Extensions */}
                                        <div className="md:hidden col-span-4 space-y-5 px-1">
                                            {/* Time Filter */}
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="flex justify-between items-center mb-2" onClick={() => setFiltersMore({ ...filtersMore, horaInicio: "" })}>
                                                    <span className={`text-sm font-medium ${!filtersMore.horaInicio ? 'text-[#007FA4] font-bold' : 'text-gray-700 cursor-pointer'}`}>
                                                        Cualquier hora
                                                    </span>
                                                    {!filtersMore.horaInicio && <Icon icon="ei:check" className="text-[#007FA4]" width={20} />}
                                                </div>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-sm text-gray-600">Desde</span>
                                                    <div className="relative">
                                                        <select
                                                            className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-full py-1 px-3 pr-8 leading-tight focus:outline-none focus:border-[#007FA4]"
                                                            value={filtersMore.horaInicio}
                                                            onChange={(e) => setFiltersMore({ ...filtersMore, horaInicio: e.target.value })}
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
                                            <div className="space-y-3 mb-6">
                                                {/* <div
                                                    className="bg-gray-100 p-3 rounded-lg flex justify-between items-center cursor-pointer"
                                                    onClick={() => setFiltersMore({ ...filtersMore, enCurso: !filtersMore.enCurso })}
                                                >
                                                    <span className="text-gray-700 font-medium text-sm">En curso</span>
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${filtersMore.enCurso ? 'bg-[#007FA4] border-[#007FA4]' : 'bg-white border-gray-300'}`}>
                                                        {filtersMore.enCurso && <Icon icon="ei:check" className="text-white" width={18} />}
                                                    </div>
                                                </div> */}
                                                <div
                                                    className="bg-gray-100 p-3 rounded-lg flex justify-between items-center cursor-pointer"
                                                    onClick={() => setFiltersMore({ ...filtersMore, esGratis: !filtersMore.esGratis })}
                                                >
                                                    <span className="text-gray-700 font-medium text-sm">Gratis</span>
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${filtersMore.esGratis ? 'bg-[#007FA4] border-[#007FA4]' : 'bg-white border-gray-300'}`}>
                                                        {filtersMore.esGratis && <Icon icon="ei:check" className="text-white" width={18} />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-solid border-[#ddd]"></div>
                                        <div className="flex w-full">
                                            <button onClick={searchDataFilter} className="bg-[#007FA4] uppercase mt-5 text-center w-full py-3 text-[#fff] rounded-full font-bold">Aplicar</button>
                                        </div>
                                    </div>
                                </div>
                            </ReactModal>
                        )
                    }
                    {
                        !isLoading && (
                            <div className="2xl:max-w-screen-2xl xl:max-w-screen-xl lg:max-w-screen-lg lg:px-4 h-18 py-5 mx-auto p-0 mt-3 xl:px-32">
                                <div className="hidden md:block">
                                    {
                                        eventSearchByFilters?.map((item: any, index: number) => (
                                            <div className="relative" key={`${item?.idEventos ?? item?.ideventos}-${item?.idfecha ?? item?.FechaInicio}-${index}`}>
                                                <Link href={`/evento/${item?.idEventos ?? item?.ideventos}/${item?.idfecha}`} target="_blank" rel="noopener noreferrer">
                                                    <motion.div {...({ className: "max-h-[200px] grid rounded-2xl items-center grid-cols-12 shadow-custom-2 mb-16 relative" }) as any}
                                                        style={{ cursor: "pointer" }}
                                                        layout
                                                        initial={{ opacity: 0, y: 50 }}  // Animación inicial (fuera de la vista)
                                                        animate={{ opacity: 1, y: 0 }}  // Animación al entrar (desplazamiento hacia arriba)
                                                        exit={{ opacity: 0, y: -50 }}  // Animación al salir (desplazamiento hacia abajo)
                                                        transition={{ duration: 0.5, ease: "easeInOut" }}  // Transición suave
                                                    >
                                                        <div className="col-start-1 col-end-2 text-center">
                                                            <strong className={`${quicksand.className} block font-[900] text-5xl text-[#444]`}>{moment(item?.FechaInicio).utcOffset(-5).format('DD')}</strong>
                                                            <span className={`${quicksand.className}font-sans font-[700] text-2xl text-[#444]`}>{moment(item?.FechaInicio).utcOffset(-5).format('MMM').toUpperCase()}</span>
                                                        </div>
                                                        <div className="col-start-2 col-end-6 max-h-[200px]">
                                                            <div className="max-h-[200px] w-full">
                                                                {item?.url ? (
                                                                    <Image width={250} height={200} className="h-[revert-layer] w-full object-fill" src={item.url} alt="imagenes1" />
                                                                ) : (
                                                                    <div className="h-[200px] w-full bg-[#f2f2f2]" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-start-6 col-end-11">
                                                            <h3 className={`${sans.className} ml-10 font-bold font-sans text-2xl text-[#444]`}>{item?.titulo}</h3>
                                                            <h6 className={`${sans.className} ml-10 mt-4 font-[300] text-[14px] font-sans`}>{moment(item?.FechaInicio).utcOffset(-5).format('ddd')} {item?.HoraInicio} - {item?.HoraFinal}</h6>
                                                            <h5 className={`${sans.className} ml-10 mt-1 font-[300] text-[14px] font-sans`}>{(item?.descripcion || item?.NombreLocal)?.replace(/\s*(S\/N|s\/n|\d+)$/i, '').trim()}</h5>
                                                        </div>
                                                        <div className="col-start-11 col-end-13 justify-end flex">
                                                            <div className="mr-8">
                                                                <span className="text-sm flex justify-end">Desde</span>
                                                                <p className="mt-5 text-[#007FA4] text-2xl font-bold">{item?.Monto > 0 ? `S/ ${Number(item.Monto).toFixed(2)}` : "¡Gratis!"}</p>
                                                                {/* <h6>Visto 21 veces</h6> */}
                                                                <div className="flex justify-end items-center">
                                                                    <div onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();

                                                                        const shareUrl = `${window.location.origin}/evento/${item?.idEventos || item.ideventos}/${item?.idfecha}`;
                                                                        const shareData = {
                                                                            title: item?.titulo || 'Evento en InjoyPlan',
                                                                            text: `¡Mira este evento! ${item?.titulo || ''}`,
                                                                            url: shareUrl
                                                                        };

                                                                        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                                                                            navigator.share(shareData).catch((err) => {
                                                                                if (err.name !== 'AbortError') console.error('Error al compartir', err);
                                                                            });
                                                                        } else {
                                                                            navigator.clipboard.writeText(shareUrl).then(() => {
                                                                                useAlertStore.getState().alert("Se ha copiado la url, compártelo con tus amigos :)", "notification");
                                                                            }).catch(err => console.error('Error al copiar', err));
                                                                        }
                                                                    }}>
                                                                        <Image src={comp} width={26} height={26} alt="compartir" className="mr-2 top-1 relative" />
                                                                    </div>

                                                                    <div onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation(); // Evitar que el clic en el ícono de favorito navegue a la página del evento
                                                                        addFavoritesByUser(item);
                                                                    }}>
                                                                        {item?.favorito ? <div className='relative top-4'>
                                                                            <Icon color='#037BA1' width={28} icon="mdi:heart" /><span className='text-[#037BA1] ml-3 font-bold text-md'></span>
                                                                        </div> :
                                                                            <div className='relative top-4'>
                                                                                <Image src={corp} alt="fav" width={24} /><span className='text-[#037BA1] ml-3 font-bold text-md'></span>
                                                                            </div>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </motion.div>
                                                </Link>

                                                <Link className="font-[900] absolute bottom-[-30px] left-[110px] text-[#A3ABCC] text-xs flex items-center" target="_blank" href={item?.urlFuente?.startsWith('http') ? item.urlFuente : (item?.urlFuente ? `https://${item.urlFuente}` : '#')}>VER FUENTE <Image className="ml-2" src={flc} alt="flc" width={15} height={15} /></Link>
                                            </div>
                                        ))
                                    }
                                </div>

                                <div className="block md:hidden px-8">
                                    {
                                        eventSearchByFilters?.map((item: any, index: number) => (
                                            <Card item={item} height={450} key={`${item?.idEventos ?? item?.ideventos}-${item?.idfecha ?? item?.FechaInicio}-${index}`} addFavoritesByUser={addFavoritesByUser} />
                                        ))
                                    }
                                </div>

                                {/* View All Button - Only show after initial scrolling pages are exhausted */}
                                {hasMore && page >= 3 && !isLoadingMore && (
                                    <div className="flex justify-center mt-12 mb-20 text-center w-full">
                                        <button
                                            onClick={handleViewAll}
                                            className="bg-[#007FA4] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#006b8a] transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
                                        >
                                            <span>Ver más planes</span>
                                            <Icon icon="ei:plus" width={24} className="font-bold" />
                                        </button>
                                    </div>
                                )}

                                {/* Professional Loading Spinner */}
                                {isLoadingMore && (
                                    <div className="flex flex-col items-center justify-center mt-12 mb-20 w-full">
                                        <Icon icon="svg-spinners:ring-resize" width={40} height={40} className="text-[#007FA4]" />
                                        <p className="text-gray-400 text-sm mt-3 font-medium animate-pulse">Cargando planes...</p>
                                    </div>
                                )}
                            </div>
                        )
                    }
                </div>
            </>
        </div>
    )
}

export default BusquedaEvento;