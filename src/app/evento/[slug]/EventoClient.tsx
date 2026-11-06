'use client';
import { useEffect } from 'react';
import { useEventStore } from '@/app/zustand/events';
import EventDate from './event';
import type { EventDetail } from '@/app/interfaces/event';

// `initial` comes from the server (SEO). The client refetch adds per-user data such as favorites.
const EventoClient = ({ initial, eventId }: { initial: EventDetail[]; eventId: string }) => {
  const { getEventDetail, dataEvent, resetEvent } = useEventStore();

  useEffect(() => {
    resetEvent();
    getEventDetail(eventId);
  }, [eventId, getEventDetail, resetEvent]);

  // Ignore store data left over from a previously viewed event
  const fresh = dataEvent?.[0]?.data?.[0]?.idEventos === initial[0]?.data?.[0]?.idEventos;
  const [{ data, dataFecha, dataPlataformaVenta, owner }] = (fresh && dataEvent) || initial;

  return <EventDate data={data} dataFecha={dataFecha} dataPlataformaVenta={dataPlataformaVenta} owner={owner} />;
};

export default EventoClient;
