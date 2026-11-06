
"use client"
import biglogo from './../../../public/svg/logo.svg'
import searchimg from './../../../public/svg/work.svg'
import searchimg2 from './../../../public/svg/us.svg'
import Image from 'next/image'
import { jakarta } from '../../../public/fonts';

const Better = () => {

    return (
        <div className="bg-[#f2f5f7]">
            <div className="max-w-[1200px] px-10 pb-20 mx-auto md:pt-32 pt-16 grid md:grid-cols-2">
                <div className='md:order-1 order-2'>
                    <h2 className='text-[#9B292B] font-bold text-4xl mb-6 md:text-left text-center mt-10 md:mt-0'>Acerca de nosotros</h2>
                    <p className={`${jakarta.className} md:text-left text-center md:text-[18px] text-[16px]`}><strong>Injoyplan</strong> es una plataforma web que nace con el propósito de agrupar e informar sobre eventos y actividades organizados por otras personas que se realicen de manera presencial y/o virtual, buscando promoverlos a la vez que fomentamos los intereses y pasatiempos de las personas al participar en ellos. <br />
                        <br />
                        De esta manera, buscamos que más personas disfruten de buenos momentos, de poder conocer más personas con los mismos intereses y hacer nuevas cosas que les pueda llegar a gusta y alegrar</p>
                </div>
                <div className='flex md:justify-end justify-center md:order-2 order-1 w-full mx-auto '>
                    <Image src={biglogo} alt="biglogo" className='w-6/12' />
                </div>
            </div>
            <div className="bg-[#fff] pb-[90px] pt-20">
                <div className="max-w-[860px] mx-auto text-center px-5">
                    <div className='mb-20'>
                        <h2 className='text-4xl text-[#9B292B] font-bold mb-10'>¿Cómo funciona?</h2>
                        <p className={`${jakarta.className} md:text-[18px] text-[16px]`}><strong>Injoyplan </strong>cuenta con una plataforma amigable para su uso. Se mostrarán los diferentes tipos de eventos registrados, los cuales estarán ordenados por categorías para una rápida visualización. Asimismo, brindará la opción de búsqueda con los diferentes filtros disponibles para realizar una consulta especifica.</p>
                    </div>
                    <div className='grid md:grid-cols-2 md:gap-10 gap-5'>
                        <div className='rounded-[3px] px-14 py-14 text-center border-solid border border-[#ececec]'>
                            <Image className='mx-auto mb-8' src={searchimg} alt="searchimg" />
                            <span className='md:text-[18px] text-[16px]'>Buscamos en diferentes medios de información las actividades que se llevan a cabo.</span>
                        </div>
                        <div className='rounded-[3px] px-14 py-14  text-center border-solid border border-[#ececec]'>
                            <Image className='mx-auto mb-8' src={searchimg2} alt="searchimg2" />
                            <span className='md:text-[18px] text-[16px]'>Te enlazamos directamente con los organizadores o personas para que pueedas adquirir tus entradas o invitaciones.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Better