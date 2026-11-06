import { create } from 'zustand';
import { del, get, post } from '../utils/fetch';
import { Favorite, IResponse } from '../interfaces/favorite';
import { useEventStore } from './events';

export interface IFavoriteState {
    favorites: Favorite[];
    addFavorite: (data: any) => any
    deleteFavorite: (id: any) => any
    getFavorites: () => any
}

export const useFavoriteStore = create<IFavoriteState>((set, _get) => ({
    favorites: [],
    addFavorite: async (data: any) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        // AUTH Layout
        if (token) {
            try {
                // Ensure we handle both structure types if necessary, though 'data' is now expected to be full event object
                const payload = {
                    idEvento: data.idEventos || data.ideventos || data.idEvento,
                    idFecha: data.idfecha || data.idFecha
                };

                const resp: any = await post(`favorites`, { eventId: payload.idEvento, eventDateId: payload.idFecha });
                console.log(data)
                console.log(resp)
                if (resp && resp.id) {
                    useEventStore.getState().setEventsAsFavorite(payload.idEvento, resp.id);
                    useEventStore.getState().setFeaturedEventsAsFavorite(payload.idEvento, resp.id); // Update Featured
                    useEventStore.getState().setEventDataFavorite(payload.idEvento, resp.id);
                    useEventStore.getState().setEventFiltersFavorite(payload.idEvento, resp.id);
                    // refresh favorites list so UI (Header) picks up changes
                    await _get().getFavorites();
                }
            } catch (error: any) {
                console?.error('Error adding favorite:', error);
            }
        } else {
            // GUEST Layout (LocalStorage)
            try {
                const guestFavId = Date.now(); // Generate a temp ID
                const eventId = data.idEventos || data.ideventos || data.idEvento;
                const dateId = data.idfecha || data.idFecha;

                // Create a mapped favorite object compatible with the store's state
                const newFavorite = {
                    idfavoritos: guestFavId,
                    favorito: guestFavId,
                    esfavorito: 1,

                    ideventos: eventId,
                    idEventos: eventId,
                    idfecha: dateId,

                    titulo: data.titulo,
                    url: data.url || data.imageUrl,
                    Destacado: data.Destacado ? 1 : 0,

                    FechaInicio: data.FechaInicio,
                    HoraInicio: data.HoraInicio,
                    HoraFinal: data.HoraFinal,

                    Monto: data.Monto,
                    EsGratis: data.EsGratis,

                    NombreLocal: data.NombreLocal,
                    Distrito: data.Distrito,
                    direccion: data.direccion,

                    categoria_id: data.categoria_id || 0,
                    urlFuente: data.urlFuente,
                    estado: '1',
                    usuario_id: 0,
                };

                const currentFavorites = JSON.parse(localStorage.getItem('guest_favorites') || '[]');
                // Avoid duplicates
                if (!currentFavorites.some((f: any) => f.ideventos === eventId)) {
                    const updatedFavorites = [...currentFavorites, newFavorite];
                    localStorage.setItem('guest_favorites', JSON.stringify(updatedFavorites));

                    // Update UI Stores
                    useEventStore.getState().setEventsAsFavorite(eventId, guestFavId);
                    useEventStore.getState().setFeaturedEventsAsFavorite(eventId, guestFavId);
                    useEventStore.getState().setEventDataFavorite(eventId, guestFavId);
                    useEventStore.getState().setEventFiltersFavorite(eventId, guestFavId);

                    await _get().getFavorites();
                }
            } catch (error) {
                console.error('Error adding local favorite:', error);
            }
        }
    },
    deleteFavorite: async (event: any) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        console.log(event)

        const favoriteId = event?.idfavoritos ?? event?.favorito;
        const eventId = event?.idEvento ?? event?.idEventos ?? event?.ideventos;

        if (!favoriteId && !eventId) {
            console.error('No favoriteId or eventId provided for deletion');
            return;
        }

        if (token) {
            // AUTH Layout
            try {
                // Prefer deleting by favoriteId (legacy behavior). Fallback to deleting by eventId.
                const endpoint = favoriteId
                    ? `favorites/${favoriteId}`
                    : `favorites/event/${eventId}`;

                const resp: any = await del(endpoint);
                console.log(resp)

                // On errors, backend returns { statusCode, message, error }
                if (resp && resp.message && !resp.statusCode) {
                    // Update specific event by EventID (Most reliable for detail view)
                    if (eventId) {
                        useEventStore.getState().setEventsDeleteFavoriteByEventId(eventId);
                        useEventStore.getState().setFeaturedEventsDeleteFavoriteByEventId(eventId); // Update Featured by Event ID
                        useEventStore.getState().setEventDataDeleteFavoriteByEventId(eventId);
                        useEventStore.getState().setEventDeleteFiltersFavoriteByEventId(eventId);
                    }

                    const favIdForState = favoriteId ?? event?.favorito;
                    if (favIdForState) {
                        useEventStore.getState().setEventsDeleteFavorite(favIdForState);
                        useEventStore.getState().setFeaturedEventsDeleteFavorite(favIdForState); // Update Featured by Fav ID
                        useEventStore.getState().setEventDataDeleteDFavorite(favIdForState);
                        useEventStore.getState().setEventDeleteFiltersFavorite(favIdForState);
                    }
                    // refresh favorites list after deletion
                    await _get().getFavorites();
                }
            } catch (error) {
                console.error('Error deleting favorite:', error);
            }
        } else {
            // GUEST Layout
            try {
                const currentFavorites = JSON.parse(localStorage.getItem('guest_favorites') || '[]');
                // Filter out the favorite
                // Try to match by ideventos since favoriteId might be random/generated
                const updatedFavorites = currentFavorites.filter((f: any) => {
                    if (eventId) return f.ideventos !== eventId && f.idEventos !== eventId;
                    if (favoriteId) return f.idfavoritos !== favoriteId;
                    return true;
                });

                localStorage.setItem('guest_favorites', JSON.stringify(updatedFavorites));

                // Update Stores
                if (eventId) {
                    useEventStore.getState().setEventsDeleteFavoriteByEventId(eventId);
                    useEventStore.getState().setFeaturedEventsDeleteFavoriteByEventId(eventId);
                    useEventStore.getState().setEventDataDeleteFavoriteByEventId(eventId);
                    useEventStore.getState().setEventDeleteFiltersFavoriteByEventId(eventId);
                }
                const favIdForState = favoriteId ?? event?.favorito;
                if (favIdForState) {
                    useEventStore.getState().setEventsDeleteFavorite(favIdForState);
                    useEventStore.getState().setFeaturedEventsDeleteFavorite(favIdForState);
                    useEventStore.getState().setEventDataDeleteDFavorite(favIdForState);
                    useEventStore.getState().setEventDeleteFiltersFavorite(favIdForState);
                }

                await _get().getFavorites();

            } catch (error) {
                console.error('Error deleting local favorite:', error);
            }
        }
    },
    getFavorites: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (token) {
            // AUTH Layout
            try {
                const resp: any = await get(`favorites`);
                console.log(resp)
                // Backend returns { data: favorites[], total, page, totalPages }
                if (resp?.data && Array.isArray(resp.data)) {
                    // Map each favorite to legacy format
                    const mappedFavorites = resp.data.map((fav: any) => {
                        const event = fav.event;
                        const firstDate = event?.dates?.[0];
                        const location = event?.location;

                        return {
                            idfavoritos: fav.id, // Favorite ID for deletion
                            favorito: fav.id,
                            esfavorito: 1,

                            // Event IDs
                            ideventos: event?.id,
                            idEventos: event?.id,
                            idfecha: firstDate?.id || event?.id,

                            // Event data
                            titulo: event?.title,
                            url: event?.imageUrl,
                            Destacado: event?.isFeatured ? 1 : 0,

                            // Date/time
                            FechaInicio: firstDate?.date || event?.createdAt,
                            HoraInicio: firstDate?.startTime || '',
                            HoraFinal: firstDate?.endTime || '',

                            // Price
                            Monto: firstDate?.price || 0,
                            EsGratis: (firstDate?.price === 0 || !firstDate?.price) ? 1 : 0,

                            // Location
                            NombreLocal: location?.name || (location?.district && location?.province ? `${location.district}, ${location.province}` : '') || '',
                            Distrito: location?.district || '',
                            direccion: location?.address || '',

                            // Other
                            categoria_id: 0,
                            urlFuente: event?.websiteUrl || event?.link || '',
                            estado: event?.isActive ? '1' : '0',
                            usuario_id: 0,
                        };
                    });

                    // Sort chronologically by event date (upcoming first)
                    mappedFavorites.sort((a: any, b: any) => {
                        const dateA = new Date(a.FechaInicio).getTime();
                        const dateB = new Date(b.FechaInicio).getTime();
                        return dateA - dateB;
                    });

                    set({ favorites: mappedFavorites });

                    // Sync with Event Store lists
                    useEventStore.getState().updateEventsWithFavorites(mappedFavorites);
                } else {
                    set({ favorites: [] })
                }
            } catch (error) {
                console.error('Error loading favorites:', error);
                set({ favorites: [] })
            }
        } else {
            // GUEST Layout
            try {
                const guestFavorites = JSON.parse(localStorage.getItem('guest_favorites') || '[]');
                // Sort chronologically by event date (upcoming first)
                guestFavorites.sort((a: any, b: any) => {
                    const dateA = new Date(a.FechaInicio).getTime();
                    const dateB = new Date(b.FechaInicio).getTime();
                    return dateA - dateB;
                });
                set({ favorites: guestFavorites });
                // Sync with Event Store lists
                useEventStore.getState().updateEventsWithFavorites(guestFavorites);
            } catch (error) {
                console.error('Error loading local favorites:', error);
                set({ favorites: [] });
            }
        }
    },
}));



// Shared heart-button behavior for every event list
export const toggleFavorite = (item: any) => {
    const { addFavorite, deleteFavorite } = useFavoriteStore.getState();
    return item?.favorito || item?.esfavorito === 1 ? deleteFavorite(item) : addFavorite(item);
};
