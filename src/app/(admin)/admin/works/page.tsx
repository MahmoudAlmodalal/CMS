import { ArtistWorksManager } from "@/components/admin/ArtistWorksManager";
import { getAdminArtistWorks } from "@/lib/dal/admin-artist-works";
import { getAdminArtists } from "@/lib/dal/artists";

export const dynamic = "force-dynamic";

export default async function AdminWorksPage() {
  const [works, artists] = await Promise.all([getAdminArtistWorks(), getAdminArtists()]);
  return <ArtistWorksManager initialWorks={works} artists={artists} />;
}
