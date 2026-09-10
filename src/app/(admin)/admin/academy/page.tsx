import { AcademyManager } from "@/components/admin/AcademyManager";
import { getAdminCourses } from "@/lib/dal/admin-academy";
import { getPublishedArtists } from "@/lib/dal/artists";

export const dynamic = "force-dynamic";

export default async function AdminAcademyPage() {
  const [courses, artists] = await Promise.all([getAdminCourses(), getPublishedArtists()]);
  return <AcademyManager initialCourses={courses} instructors={artists} />;
}
