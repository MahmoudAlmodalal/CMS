import { SubscribersTable } from "@/components/admin/SubscribersTable";
import { getAdminNewsletterSubscribers } from "@/lib/dal/bookings";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const subscribers = await getAdminNewsletterSubscribers();
  return <SubscribersTable initialSubscribers={subscribers} />;
}
