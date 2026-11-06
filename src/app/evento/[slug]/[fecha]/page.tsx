import { notFound, permanentRedirect } from 'next/navigation';
import { BASE_URL } from '@/app/utils/fetch';
import { eventPath, isUuid } from '@/app/utils/urls';

// Old links: /evento/{eventId}/{dateId} -> /evento/{titulo}-{eventId}?fecha={dateId}
export default async function LegacyEventRedirect({ params }: { params: Promise<{ slug: string; fecha: string }> }) {
  const { slug: id, fecha } = await params;
  if (!isUuid(id)) notFound();
  const res = await fetch(`${BASE_URL}/events/detail/${id}`, { next: { revalidate: 3600 } }).catch(() => null);
  const event = res?.ok ? await res.json() : null;
  if (!event?.id) notFound();
  permanentRedirect(eventPath(event.id, event.title, isUuid(fecha) ? fecha : undefined));
}
