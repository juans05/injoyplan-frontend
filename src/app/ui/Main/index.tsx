"use client";
import flecha from '../../../../public/svg/right.svg'
import flechazul from '../../../../public/svg/blueright.svg'
import Slide from './Slider'
import { ICategoriesState, useCategoriesState } from '../../zustand/categories'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image';

import CategorySkeleton from '@/app/components/Skeletons/category'

const Main = () => {

    const { countsCategories, getValueCategory, isLoading }: ICategoriesState = useCategoriesState();

    console.log(countsCategories)

    const navigate = useRouter();

    const navigateByCategory = (item: any) => {
        getValueCategory(item)
        console.log(item)
        navigate.push(`/busqueda/${item?.idCategorias}`)
    }

    // Show category skeletons while loading or if no categories yet
    const showCategorySkeleton = isLoading || (!isLoading && (!countsCategories || countsCategories.length === 0));

    return (
        <div className="">
            <div className="2xl:max-w-screen-2xl xl:max-w-screen-xl max-w-[998px] px-0 mx-auto grid grid-cols-12 gap-4 xl:gap-10 xl:px-10">
                <div className="xl:col-start-1 xl:col-end-9 md:col-start-1 md:col-end-13 xl:mt-12 md:mt-6 col-start-1 col-end-13">
                    <div className='slider-banner'>
                        <Slide />
                    </div>
                </div>
                <div className="xl:col-start-9 xl:col-end-13 md:col-start-1 md:col-end-13 xl:mt-12 md:mt-0 w-full col-start-1 col-end-13 md:px-0 px-5">
                    <div className='flex gap-3 overflow-x-auto no-scrollbar md:grid xl:grid-cols-2 md:gap-x-11 md:gap-y-3 md:grid-cols-4 md:gap-3 w-full'>
                        {
                            isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => <CategorySkeleton key={i} />)
                            ) : (
                                (() => {
                                    // CLONE and SWAP logic for Home Page view
                                    const displayedCategories = [...(countsCategories || [])];
                                    const culturaIndex = displayedCategories.findIndex(c => c.nombreCategoria === 'Cultura');
                                    const musicaIndex = displayedCategories.findIndex(c => c.nombreCategoria === 'Música');

                                    if (culturaIndex !== -1 && musicaIndex !== -1) {
                                        // Swap elements
                                        [displayedCategories[culturaIndex], displayedCategories[musicaIndex]] = [displayedCategories[musicaIndex], displayedCategories[culturaIndex]];
                                    }

                                    return displayedCategories.slice(0, 4).map((item: any, index: number) => (
                                        <div className='relative cursor-pointer z-0 shrink-0 w-36 md:w-auto' key={index} onClick={() => navigateByCategory(item)}>
                                            <div className='flex justify-center bg-[#861f21] p-5 py-6 rounded w-10/12 mx-auto relative z-50'>
                                                <Image width={50} height={50} className='z-0' src={item.iconos} alt="logomusica" />
                                            </div>
                                            <div className='bg-[#F6F6F6] pt-7 p-4 relative -top-5 z-0 rounded'>
                                                <h3 className='text-[18px] text-[#444] font-bold'>{item?.nombreCategoria}</h3>
                                                <span className='flex items-center text-sm font-[300] text-[#861F21]'>{item?.cantidad} eventos <Image className='ml-2' src={flecha} alt={item?.nombreCategoria} /></span>
                                            </div>
                                        </div>
                                    ));
                                })()
                            )
                        }
                    </div>
                    <div className='flex justify-end w-full mt-3'>
                        <Link href="/busqueda/0" className='flex items-center'>
                            <h4 className='md:text-[14px] text-[#007FA4] font-bold text-[12px]'>TODAS LAS CATEGORÍAS </h4>
                            <Image className='ml-2 relative' src={flechazul} alt="flecha-azul" /></Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Main