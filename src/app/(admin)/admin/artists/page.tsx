import { ArtistsManager } from "@/components/admin/ArtistsManager";
import { getAdminArtists } from "@/lib/dal/artists";

export const dynamic = "force-dynamic";

export default async function AdminArtistsPage() {
  const artists = await getAdminArtists();
  return <ArtistsManager initialArtists={artists} />;
}
