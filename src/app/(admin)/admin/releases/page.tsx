import { ReleasesManager } from "@/components/admin/ReleasesManager";
import { getAdminReleases } from "@/lib/dal/admin-releases";
import { getPublishedArtists } from "@/lib/dal/artists";

export const dynamic = "force-dynamic";

export default async function AdminReleasesPage() {
  const [releases, artists] = await Promise.all([getAdminReleases(), getPublishedArtists()]);
  return <ReleasesManager initialReleases={releases} artists={artists} />;
}
