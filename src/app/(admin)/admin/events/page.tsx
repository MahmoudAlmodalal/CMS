import { EventsTable } from "@/components/admin/events/EventsTable";
import { getAdminEvents } from "@/lib/dal/admin-events";
import { getAdminArtists } from "@/lib/dal/artists";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const [events, artists] = await Promise.all([getAdminEvents(), getAdminArtists()]);
  return <EventsTable events={events} artists={artists} />;
}
