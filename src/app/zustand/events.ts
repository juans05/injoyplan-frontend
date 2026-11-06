import { create } from 'zustand';
import { get } from '../utils/fetch';
import { Event, Id, BackendEvent, BackendEventList, EventDetail, EventSearchResponse } from '../interfaces/event';
import useAlertStore from './alert';

export interface IEventsState {
    getEvents: (page?: number) => void;
    isLoading: boolean;
    eventsEntreteiment: Event[],
    eventsCulture: Event[],
    eventsTeatro: Event[],
    eventsMusic: Event[],
    eventsDestacades: Event[],
    bannerEvents: Event[],
    getBannerEvents: () => void,
    getEventsDestacades: () => void,
    resetEventBySearch: () => void
    resetEvent: () => void
    events: Event[];
    eventSearch: Event[] | null
    total: number
    eventSearchByFilters: Event[]
    valueSearch: string
    dataEvent: EventDetail[] | null,
    getEventBySearch: (data: string) => Promise<void>
    setEventsAsFavorite: (idEvento: Id, favoriteId: Id) => void
    setEventDataFavorite: (idEvento: Id, favoriteId: Id) => void
    setEventFiltersFavorite: (idEvento: Id, favoriteId: Id) => void
    setEventsDeleteFavorite: (idFavorito: Id) => void
    setEventDataDeleteDFavorite: (idFavorito: Id) => void
    setEventDeleteFiltersFavorite: (idFavorito: Id) => void
    setEventsDeleteFavoriteByEventId: (eventId: Id) => void;
    setEventDeleteFiltersFavoriteByEventId: (eventId: Id) => void;
    setEventDataDeleteFavoriteByEventId: (eventId: Id) => void;
    getEventDetail: (event: Id) => Promise<void>
    getEventSearchByFilters: (params: Record<string, any>, options?: { page?: number, isLoadMore?: boolean, limit?: number }) => Promise<void>
    setFeaturedEventsAsFavorite: (idEvento: Id, favoriteId: Id) => void
    setFeaturedEventsDeleteFavorite: (idFavorito: Id) => void
    setFeaturedEventsDeleteFavoriteByEventId: (eventId: Id) => void
    updateEventsWithFavorites: (favorites: { ideventos?: Id; idEventos?: Id; idfavoritos?: Id }[]) => void
    getValueSearch: (value: string) => void
}

// Función para mapear eventos del nuevo backend al formato del frontend antiguo
// Función para mapear eventos del nuevo backend al formato del frontend antiguo
// Bumped on every new search so late responses from older filters are dropped
let searchSeq = 0;

const toEventArray = (resp: BackendEventList | null | undefined): BackendEvent[] =>
    Array.isArray(resp) ? resp : (resp?.data || resp?.events || []);

export const mapEventFromBackend = (item: BackendEvent, filterDate?: string): Event => {
    // Logic to find the most relevant upcoming date
    let firstDate = item.dates?.[0];

    if (item.dates && item.dates.length > 0) {
        // Sort dates chronologically
        const sortedDates = [...item.dates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // If a specific filter date is provided, try to find a match
        if (filterDate) {
            // filterDate is usually "DD-MM-YYYY" or "YYYY-MM-DD". Let's handle string inputs carefully.
            // Assuming filterDate from store is "DD-MM-YYYY" based on usage in page.tsx: setDate(dayjs(value).format('DD-MM-YYYY'))
            // But verify format. If it comes from `data` in search, it might be in different format.
            // Let's normalize to comparison string YYYY-MM-DD for safety.

            const targetDateStr = typeof filterDate === 'string' && filterDate.includes('-')
                ? (filterDate.split('-')[2]?.length === 4 ? filterDate.split('-').reverse().join('-') : filterDate) // simple check if DD-MM-YYYY -> YYYY-MM-DD
                : null;

            // Better yet, just use moment if available or simple date string matching
            const match = sortedDates.find((d) => {
                const dDate = new Date(d.date).toISOString().split('T')[0]; // YYYY-MM-DD
                // filterDate should already be in YYYY-MM-DD format from buildSearchData()
                return dDate === filterDate;
            });

            if (match) {
                firstDate = match;
            } else {
                // Fallback to upcoming logic if no exact match (though backend likely filtered by it)
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const upcoming = sortedDates.find((d) => new Date(d.date).getTime() >= today.getTime());
                firstDate = upcoming || sortedDates[0];
            }
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const upcoming = sortedDates.find((d) => new Date(d.date).getTime() >= today.getTime());
            firstDate = upcoming || sortedDates[0];
        }
    }

    const location = item.location;

    return {
        // IDs
        idEventos: item.id,
        ideventos: item.id,
        idfecha: firstDate?.id || item.id,

        // Datos principales
        titulo: item.title,
        url: item.imageUrl || '',
        Destacado: item.isFeatured ? 1 : 0,

        // Fecha y hora
        FechaInicio: firstDate?.date || item.createdAt || '',
        HoraInicio: firstDate?.startTime || '',
        HoraFinal: firstDate?.endTime || '',

        // Precio
        Monto: firstDate?.price || 0,
        EsGratis: (firstDate?.price === 0 || !firstDate?.price) ? 1 : 0,

        // Ubicación
        NombreLocal: location?.name || location?.address || `${location?.district}, ${location?.province}` || '',
        Distrito: location?.district || '',
        direccion: location?.address || '',
        latitud_longitud: (location && location.latitude && location.longitude) ? `${location.latitude}, ${location.longitude}` : '',
        descripcionEvento: item.description || '',

        // Otros
        categoria_id: 0, // El nuevo backend usa string para category
        urlFuente: item.websiteUrl || item.link || '', // Mapea websiteUrl (Event) o link (Banner)
        estado: item.isActive ? '1' : '0',
        usuario_id: 0,

        // Favoritos - Backend sends: favorito (ID string if favorited), esfavorito (1 or 0)
        favorito: item.favorito || item.esfavorito || 0,
        esfavorito: item.esfavorito === 1 || (item.favorito && item.favorito !== 0) ? 1 : 0,

        // Entradas externas
        ticketUrls: item.ticketUrls || [],
    };
};

// Shape expected by the event detail page: [{ data: [event], dataFecha, dataPlataformaVenta, owner }]
export const transformEventDetail = (resp: BackendEvent): EventDetail[] => [{
    data: [mapEventFromBackend(resp)],
    dataFecha: (resp.dates || []).map((d) => ({
        idfecha: d.id,
        evento_id: resp.id,
        FechaInicio: d.date,
        HoraInicio: d.startTime,
        HoraFinal: d.endTime,
        Monto: d.price
    })),
    dataPlataformaVenta: [],
    owner: resp.user,
}];

export const useEventStore = create<IEventsState>((set, _get) => ({
    isLoading: false,
    eventsEntreteiment: [],
    eventsDestacades: [],
    bannerEvents: [],
    eventsCulture: [],
    eventsTeatro: [],
    eventsMusic: [],
    valueSearch: "",
    eventSearchByFilters: [],
    total: 0,
    dataEvent: null,
    eventSearch: null,
    getValueSearch: (valueSearch: string) => {
        set({
            valueSearch: valueSearch
        })
    },
    resetEventBySearch: () => {
        set({
            eventSearch: []
        })
    },
    resetEvent: () => {
        set({
            dataEvent: null
        })
    },
    events: [],
    getEvents: async (page: number = 1) => {
        set({ isLoading: true });
        try {
            console.log(`Loading page ${page}`);
            // Use proper page-based pagination
            const resp = await get<EventSearchResponse>(`events/public/search?page=${page}&limit=12&excludeFeatured=true&expandDates=false`);
            console.log(resp);

            if (resp?.eventos && Array.isArray(resp.eventos)) {
                const newEvents = resp.eventos.map((item) => mapEventFromBackend(item));

                set((state) => ({
                    // Append new events if page > 1, otherwise replace
                    events: page === 1 ? newEvents : [...state.events, ...newEvents],
                    isLoading: false
                }));
            } else {
                set({ events: page === 1 ? [] : _get().events, isLoading: false });
            }
        } catch (error) {
            console.error('Error loading events:', error);
            set({ events: page === 1 ? [] : _get().events, isLoading: false });
        }
    },
    getEventsDestacades: async () => {
        try {
            const resp = await get<BackendEventList>(`events/featured`);
            console.log(resp)
            // El backend puede retornar { data: [...] } o un array directo
            const eventsArray = toEventArray(resp);
            if (eventsArray.length > 0) {
                set({
                    eventsDestacades: eventsArray.map((item) => mapEventFromBackend(item))
                });
            } else {
                set({ eventsDestacades: [] })
            }
        } catch (error) {
            console.error('Error loading featured events:', error);
            set({ eventsDestacades: [] })
        }
    },
    getBannerEvents: async () => {
        try {
            // Fetch events marked as isBanner=true
            const resp = await get<BackendEventList>(`events?isBanner=true&limit=10`);
            console.log("Banner events:", resp);
            const eventsArray = toEventArray(resp);

            if (eventsArray.length > 0) {
                set({
                    bannerEvents: eventsArray.map((item) => mapEventFromBackend(item))
                });
            } else {
                set({ bannerEvents: [] })
            }
        } catch (error) {
            console.error('Error loading banner events:', error);
            set({ bannerEvents: [] })
        }
    },
    setEventsAsFavorite: (idEvento, resp) => {
        console.log(idEvento, resp)

        set((state) => {
            console.log(state.events)
            return (
                {
                    events: state?.events?.map((event) =>
                        event.idEventos === idEvento
                            ? { ...event, esfavorito: event.esfavorito === 0 ? 1 : 0, favorito: resp }
                            : event
                    )
                });
        })
    },
    setEventFiltersFavorite: (idEvento, resp) => {
        console.log(idEvento, resp)
        set((state) => ({
            eventSearchByFilters: state?.eventSearchByFilters?.map((event) =>
                (event.ideventos || event.idEventos) === idEvento
                    ? { ...event, esfavorito: event.esfavorito === 0 ? 1 : 0, favorito: resp }
                    : event

            ),
        }));
    },
    setEventDataFavorite: (idEvento, resp) => {
        set((state) => ({
            dataEvent: state?.dataEvent?.map((dataEventItem) => ({
                ...dataEventItem,
                data: dataEventItem?.data?.map((item) =>
                    (item.ideventos || item.idEventos) === idEvento
                        ? { ...item, favorito: resp }
                        : item
                ),
            })),
        }));
    },
    setEventsDeleteFavorite: (favorito) => {
        set((state) => ({
            events: state?.events?.map((item) =>
                item.favorito === favorito
                    ? { ...item, esfavorito: 0, favorito: null }
                    : item
            )
        }));
    },
    setEventDeleteFiltersFavorite: (favorito) => {
        set((state) => ({
            eventSearchByFilters: state?.eventSearchByFilters?.map((item) =>
                item.favorito === favorito
                    ? { ...item, favorito: null, esfavorito: 0 }
                    : item
            )
        }));
    },
    setEventDataDeleteDFavorite: (favorito) => {
        set((state) => ({
            dataEvent: state?.dataEvent?.map((dataEventItem) => ({
                ...dataEventItem,
                data: dataEventItem?.data?.map((item) =>
                    item.favorito === favorito
                        ? { ...item, favorito: null, esfavorito: 0 }
                        : item
                ),
            })),
        }));
    },
    // Nuevas funciones para eliminar favorito por ID de Evento (más seguro)
    setEventsDeleteFavoriteByEventId: (eventId) => {
        set((state) => ({
            events: state?.events?.map((item) =>
                (item.ideventos || item.idEventos) === eventId
                    ? { ...item, esfavorito: 0, favorito: null }
                    : item
            )
        }));
    },
    setEventDeleteFiltersFavoriteByEventId: (eventId) => {
        set((state) => ({
            eventSearchByFilters: state?.eventSearchByFilters?.map((item) =>
                (item.ideventos || item.idEventos) === eventId
                    ? { ...item, favorito: null, esfavorito: 0 }
                    : item
            )
        }));
    },
    setEventDataDeleteFavoriteByEventId: (eventId) => {
        set((state) => ({
            dataEvent: state?.dataEvent?.map((dataEventItem) => ({
                ...dataEventItem,
                data: dataEventItem?.data?.map((item) =>
                    (item.ideventos || item.idEventos) === eventId
                        ? { ...item, favorito: null, esfavorito: 0 }
                        : item
                ),
            })),
        }));
    },
    setFeaturedEventsAsFavorite: (idEvento, resp) => {
        set((state) => ({
            eventsDestacades: state?.eventsDestacades?.map((event) =>
                (event.ideventos || event.idEventos) === idEvento
                    ? { ...event, esfavorito: 1, favorito: resp }
                    : event
            )
        }));
    },
    setFeaturedEventsDeleteFavorite: (favorito) => {
        set((state) => ({
            eventsDestacades: state?.eventsDestacades?.map((item) =>
                item.favorito === favorito
                    ? { ...item, esfavorito: 0, favorito: null }
                    : item
            )
        }));
    },
    setFeaturedEventsDeleteFavoriteByEventId: (eventId) => {
        set((state) => ({
            eventsDestacades: state?.eventsDestacades?.map((item) =>
                (item.ideventos || item.idEventos) === eventId
                    ? { ...item, esfavorito: 0, favorito: null }
                    : item
            )
        }));
    },
    getEventBySearch: async (palabraBusqueda: string) => {
        try {
            const resp = await get<{ data?: BackendEvent[] }>(`events/search?q=${encodeURIComponent(palabraBusqueda)}`);
            console.log(resp)
            if (resp?.data && Array.isArray(resp.data)) {
                // Map backend response to frontend format, expanding by dates
                const allEvents: Event[] = [];
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                resp.data.forEach((item) => {
                    // Filter and sort verified upcoming dates
                    const eventDates = item.dates || [];

                    // Filter future dates
                    const upcomingDates = eventDates.filter((d) => {
                        const dateObj = new Date(d.date);
                        // Optional: clear time component for strict date comparison if needed
                        // dateObj.setHours(0,0,0,0); 
                        // But server returns ISO strings often with time or just date. 
                        // Let's rely on standard comparison.
                        // Ideally we check if date + endTime (if exists) is >= now.
                        // For search results, simple Date check is good.
                        return new Date(d.date).getTime() >= today.getTime();
                    });

                    // If we have upcoming dates, generate an item for EACH date
                    if (upcomingDates.length > 0) {
                        upcomingDates.forEach((dateInfo) => {
                            // Create a base mapped event using the standard mapper 
                            // (which might default to first date logic, but we override it)
                            const baseEvent = mapEventFromBackend(item);

                            // Override with THIS specific date's info
                            const specificEventInstance = {
                                ...baseEvent,
                                idfecha: dateInfo.id,
                                FechaInicio: dateInfo.date,
                                HoraInicio: dateInfo.startTime || '',
                                HoraFinal: dateInfo.endTime || '',
                                Monto: dateInfo.price || 0,
                                EsGratis: (dateInfo.price === 0 || !dateInfo.price) ? 1 : 0
                            };
                            allEvents.push(specificEventInstance);
                        });
                    } else {
                        // Fallback mechanism: if no upcoming dates (or only past),
                        // show the event as "Past" or just use the standard mapping (usually shows last date or first)
                        // This ensures the event is at least visible if it matches search terms.
                        // Or we can choose to HIDE past events from search entirely. 
                        // Current logic: mapEventFromBackend picks *some* date.
                        // Let's keep showing it but mapped once.
                        allEvents.push(mapEventFromBackend(item));
                    }
                });

                // Sort all resulting events by date
                allEvents.sort((a, b) => new Date(a.FechaInicio).getTime() - new Date(b.FechaInicio).getTime());

                set({ eventSearch: allEvents });
            } else {
                set({ eventSearch: null })
            }
        } catch (error) {
            console.error('Error searching events:', error);
            set({ eventSearch: null })
        }
    },
    getEventDetail: async (event) => {
        try {
            const resp = await get<BackendEvent>(`events/detail/${event}`);

            if (resp && resp.id) {
                // Transform backend response to frontend expected structure (Array)
                // Expected: [{ data: [event], dataFecha: [dates], dataPlataformaVenta: [...] }]

                const transformedData = transformEventDetail(resp);
                set({ dataEvent: transformedData });
            } else {
                set({ dataEvent: null })
            }
        } catch (error) {
            console.error('Error loading event detail:', error);
            set({ dataEvent: null })
        }
    },
    // aqui se llama asi por que el api debe ser con params pero metodo get y no post 
    // aqui se llama asi por que el api debe ser con params pero metodo get y no post 
    getEventSearchByFilters: async (data, options?: { page?: number, isLoadMore?: boolean, limit?: number }) => {

        // Remove empty/undefined params
        const filteredParams = Object.entries(data)
            .filter(([_, value]) => value !== undefined && value !== '' && value !== 0)
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

        // Add pagination params
        const page = options?.page || 1;
        const limit = options?.limit || 12;

        // Construct query string
        const queryParams = { ...filteredParams, page: String(page), limit: String(limit) };
        const query = new URLSearchParams(queryParams).toString();

        // A new search outdates every request still in flight; load-more keeps the current one
        const seq = options?.isLoadMore ? searchSeq : ++searchSeq;
        if (!options?.isLoadMore) set({ isLoading: true });
        try {
            // Extract date from params to pass to mapper
            const params = new URLSearchParams(data);
            const dateFilter = params.get('fechaInicio') || undefined;

            const resp = await get<EventSearchResponse>(`events/public/search?${query}`);
            if (seq !== searchSeq) return; // the user already changed the filters
            if (!options?.isLoadMore) set({ isLoading: false });

            if (resp && Array.isArray(resp.eventos)) {
                const mappedEvents = resp.eventos.map((item) => mapEventFromBackend(item, dateFilter))
                    .sort((a, b) => new Date(a.FechaInicio).getTime() - new Date(b.FechaInicio).getTime());

                if (options?.isLoadMore) {
                    set((state) => ({
                        eventSearchByFilters: [...(state.eventSearchByFilters || []), ...mappedEvents],
                        total: resp.total || 0
                    }));
                } else {
                    set({ eventSearchByFilters: mappedEvents, total: resp.total || 0 });
                }
            } else {
                if (!options?.isLoadMore) {
                    set({ eventSearchByFilters: [], total: 0 })
                }
            }
        } catch (error) {
            console.error('Error searching events by filters:', error);
            if (seq !== searchSeq) return;
            if (!options?.isLoadMore) {
                set({ isLoading: false });
                set({ eventSearchByFilters: [], total: 0 })
            }
        }
    },
    updateEventsWithFavorites: (favorites) => {
        // Create a Set of Favorite Event IDs for O(1) lookups
        const favoriteEventIds = new Set(favorites.map((f) => f.ideventos || f.idEventos));
        const favoriteMap = new Map(favorites.map((f) => [f.ideventos || f.idEventos, f.idfavoritos])); // Map EventID -> FavoriteID

        set((state) => {
            const updateList = (list: Event[] | null) => list?.map((event) => {
                const eventId = event.ideventos || event.idEventos;
                if (favoriteEventIds.has(eventId)) {
                    return { ...event, esfavorito: 1, favorito: favoriteMap.get(eventId) ?? null };
                }
                return event;
            }) || [];

            return {
                events: updateList(state.events),
                eventsDestacades: updateList(state.eventsDestacades),
                eventsEntreteiment: updateList(state.eventsEntreteiment),
                eventsCulture: updateList(state.eventsCulture),
                eventsTeatro: updateList(state.eventsTeatro),
                eventsMusic: updateList(state.eventsMusic),
                eventSearch: updateList(state.eventSearch || []),
                eventSearchByFilters: updateList(state.eventSearchByFilters || []),
            };
        });
    }
}));