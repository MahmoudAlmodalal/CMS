import { BookingsTable } from "@/components/admin/BookingsTable";
import { getAdminBookingRequests } from "@/lib/dal/bookings";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await getAdminBookingRequests();
  return <BookingsTable initialBookings={bookings} />;
}
