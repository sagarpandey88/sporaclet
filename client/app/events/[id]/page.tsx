import { mockEvents } from '@/lib/mock-data';
import EventDetailContent from './event-detail-content';

// Generate static params for all mock events
export function generateStaticParams() {
  return mockEvents.map((event) => ({
    id: event.id,
  }));
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  return <EventDetailContent params={params} />;
}