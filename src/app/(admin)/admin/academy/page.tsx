import { AcademyManager } from "@/components/admin/AcademyManager";
import { getAdminCourses } from "@/lib/dal/admin-academy";
import { getAdminArtists } from "@/lib/dal/artists";

export const dynamic = "force-dynamic";

export default async function AdminAcademyPage() {
  const [courses, artists] = await Promise.all([getAdminCourses(), getAdminArtists()]);
  return <AcademyManager initialCourses={courses} instructors={artists} />;
}
