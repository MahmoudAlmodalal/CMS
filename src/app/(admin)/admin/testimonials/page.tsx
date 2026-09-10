import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { getAdminTestimonials } from "@/lib/dal/admin-testimonials";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await getAdminTestimonials();
  return <TestimonialsManager initialTestimonials={testimonials} />;
}
