import styles from './card.module.css'
import { Dispatch } from 'react'
import { IEventsState, useEventStore } from '../../zustand/events'
import { IAuthState, useAuthStore } from '../../zustand/auth'
import { IFavoriteState, useFavoriteStore } from '../../zustand/favorites'
import Card from '@/app/components/Card'
import CardSkeleton from '@/app/components/CardSkeleton'
import { Event } from '@/app/interfaces/event'


interface IProps {
    setOpenAuth: Dispatch<boolean>
}

const EventsFeatured = ({ setOpenAuth }: IProps) => {

    // const { events }: IEventsState = useEventStore();
    const { auth }: IAuthState = useAuthStore();
    const { addFavorite, deleteFavorite }: IFavoriteState = useFavoriteStore();
    const { eventsDestacades, isLoading } = useEventStore();

    const addFavoritesByUser = (item: any) => {
        if (item.favorito || item.esfavorito === 1) {
            deleteFavorite(item)
        } else {
            addFavorite(item)
        }
    }

    console.log(eventsDestacades)

    // Show skeleton while loading OR if no events yet (initial state)
    const showContent = !isLoading && eventsDestacades?.length > 0;
    const showSkeleton = isLoading;

    // If not loading and no events, don't show the section at all
    if (!isLoading && eventsDestacades?.length === 0) return null;

    return (
        <>
            {showSkeleton && (
                <div className='bg-[#FAFBFF] pb-[80px]'>
                    <div className="2xl:max-w-screen-2xl xl:max-w-screen-xl max-w-[980px] mx-auto md:mt-16 mt-8 xl:px-10 px-5">
                        <div className="md:px-0">
                            <div className='md:pt-12 pt-10'>
                                <div className="h-8 bg-gray-300 rounded w-64 mb-8 animate-pulse"></div>
                            </div>
                            <div className="grid auto-cols-min grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <CardSkeleton key={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showContent && (
                <div className='bg-[#FAFBFF] pb-[80px]'>
                    <div className="2xl:max-w-screen-2xl xl:max-w-screen-xl max-w-[980px] mx-auto md:mt-16 mt-8 xl:px-10 px-5">
                        <div className="md:px-0">
                            <div className='md:pt-12 pt-10'>
                                <h2 className='text-3xl mb-8 font-bold text-[#444444] md:text-[#212121]'>Eventos destacados</h2>
                            </div>
                            <div className="grid auto-cols-min grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                                {
                                    eventsDestacades.map((item: any, index: number) => {
                                        return (
                                            <Card item={item} key={index} addFavoritesByUser={addFavoritesByUser} />
                                        )
                                    })
                                }
                            </div>
                            <div className={styles.button__moreEvents}>
                                {/* <button onClick={() => setPage((page: any) => page + 12)} type="submit">VER MÁS EVENTOS</button> */}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default EventsFeatured