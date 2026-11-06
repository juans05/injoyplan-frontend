import { useEffect, useMemo, useState } from 'react';
import { get } from '../utils/fetch';
import { mapEventFromBackend } from '../zustand/events';
import { useFavoriteStore } from '../zustand/favorites';
import { Event, EventSearchResponse } from '../interfaces/event';

// Fetches a list from the public search endpoint for home sections that keep
// their own data (weekend, near you). `query` null = don't fetch yet.
export default function useEventList(query: Record<string, string> | null) {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(Boolean(query));
    const key = query ? new URLSearchParams(query).toString() : '';

    useEffect(() => {
        if (!query) return;
        let cancelled = false;
        setLoading(true);
        get<EventSearchResponse>(`events/public/search?${key}`)
            .then((resp) => { if (!cancelled) setEvents((resp?.eventos || []).map((e) => mapEventFromBackend(e))); })
            .catch(() => { if (!cancelled) setEvents([]); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [key]);

    // Reflect favorites saved anywhere in the app (the global store owns them)
    const { favorites } = useFavoriteStore();
    const withFavorites = useMemo(() => {
        const byEvent = new Map((favorites || []).map((f) => [String(f.ideventos), f.idfavoritos]));
        return events.map((e) => {
            const favId = byEvent.get(String(e.idEventos));
            return favId ? { ...e, esfavorito: 1, favorito: favId } : { ...e, esfavorito: 0, favorito: null };
        });
    }, [events, favorites]);

    return { events: withFavorites, loading };
}
