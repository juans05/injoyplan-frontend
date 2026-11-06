import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { BASE_URL, SITE_URL } from '@/app/utils/fetch';
import { eventIdFromSlug, eventPath, eventSlug } from '@/app/utils/urls';
import type { BackendEvent } from '@/app/interfaces/event';
import { transformEventDetail } from '@/app/zustand/events';
import EventoClient from './EventoClient';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fecha?: string }>;
};

// cache() dedupes the request between generateMetadata and the page render
const getEventDetail = cache(async (id: string): Promise<BackendEvent | null> => {
  try {
    const res = await fetch(`${BASE_URL}/events/detail/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.id ? json : null;
  } catch {
    return null;
  }
});

const plainText = (html = '') => html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const id = eventIdFromSlug(slug);
  const event = id ? await getEventDetail(id) : null;
  if (!event) return { title: 'Evento no encontrado | Injoyplan', robots: { index: false } };

  const title = `${event.title} | Injoyplan`;
  const description = plainText(event.description) || 'Descubre este evento en Injoyplan';
  const images = event.imageUrl ? [{ url: event.imageUrl }] : [];
  return {
    title,
    description,
    // One indexable URL per event; ?fecha= only preselects a date
    alternates: { canonical: eventPath(event.id, event.title) },
    openGraph: { title, description, images, type: 'website', locale: 'es_PE', siteName: 'Injoyplan', url: eventPath(event.id, event.title) },
    twitter: { card: 'summary_large_image', title, description, images: images.map((i) => i.url) },
  };
}

// schema.org Event so search engines can show date, place and price. Only real fields, nothing invented.
function eventJsonLd(event: BackendEvent, dateId?: string) {
  const date = event.dates?.find((d) => d.id === dateId) || event.dates?.[0];
  const loc = event.location;
  const url = `${SITE_URL}${eventPath(event.id, event.title)}`;
  const day = date?.date?.slice(0, 10);
  // Times are Lima local (UTC-5)
  const at = (time?: string) => (day ? (time ? `${day}T${time}:00-05:00` : day) : undefined);
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: plainText(event.description) || undefined,
    image: event.imageUrl ? [event.imageUrl] : undefined,
    startDate: at(date?.startTime),
    endDate: date?.endTime ? at(date.endTime) : undefined,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    url,
    location: loc?.name || loc?.address ? {
      '@type': 'Place',
      name: loc?.name || loc?.address,
      address: {
        '@type': 'PostalAddress',
        streetAddress: loc?.address,
        addressLocality: loc?.district,
        addressRegion: loc?.province,
        addressCountry: 'PE',
      },
      ...(loc?.latitude && loc?.longitude ? { geo: { '@type': 'GeoCoordinates', latitude: loc.latitude, longitude: loc.longitude } } : {}),
    } : undefined,
    offers: date?.price !== undefined && date?.price !== null ? {
      '@type': 'Offer',
      price: Number(date.price),
      priceCurrency: 'PEN',
      url: event.ticketUrls?.find((t) => t.url?.startsWith('http'))?.url || url,
    } : undefined,
  };
}

export default async function EventoPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { fecha } = await searchParams;
  const id = eventIdFromSlug(slug);
  const event = id ? await getEventDetail(id) : null;
  if (!event) notFound();

  // Old or retitled slugs move to the current one
  if (slug !== eventSlug(event.id, event.title)) permanentRedirect(eventPath(event.id, event.title, fecha));

  // "<" escaped so the JSON can't close the script tag
  const jsonLd = JSON.stringify(eventJsonLd(event, fecha)).replace(/</g, '\\u003c');
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <EventoClient initial={transformEventDetail(event)} eventId={event.id} />
    </>
  );
}
