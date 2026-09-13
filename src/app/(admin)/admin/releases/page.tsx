import { ReleasesManager } from "@/components/admin/ReleasesManager";
import { getAdminReleases } from "@/lib/dal/admin-releases";
import { getAdminArtists } from "@/lib/dal/artists";

export const dynamic = "force-dynamic";

export default async function AdminReleasesPage() {
  const [releases, artists] = await Promise.all([getAdminReleases(), getAdminArtists()]);
  return <ReleasesManager initialReleases={releases} artists={artists} />;
}
