import { TracksManager } from "@/components/admin/TracksManager";
import { getAdminTracks } from "@/lib/dal/admin-tracks";
import { getPublishedArtists } from "@/lib/dal/artists";

export const dynamic = "force-dynamic";

export default async function AdminTracksPage() {
  const [tracks, artists] = await Promise.all([getAdminTracks(), getPublishedArtists()]);
  return <TracksManager initialTracks={tracks} artists={artists} />;
}
