import { listMediaAction } from "@/actions/admin-media";
import type { StorageBucket, StorageFile } from "@/lib/types/admin-media";

/**
 * How long to wait for the listing Server Action before giving up.
 *
 * A Server Action whose POST is answered with something other than a flight
 * response leaves its promise pending forever — neither .then, .catch nor
 * .finally runs — which is how the Media Library used to sit on "جارٍ تحميل
 * الملفات…" indefinitely. The middleware no longer redirects action POSTs, but
 * a timeout is the backstop: a hung action must surface as an error the UI can
 * retry, never as a permanent spinner.
 */
const LIST_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("انتهت مهلة تحميل الملفات. تحقّق من الاتصال ثم أعد المحاولة.")),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/**
 * Lists the files under a bucket folder, newest first.
 *
 * One request, not two: this used to also list `<folder>/media-library`
 * separately, but listBucketFiles already descends into every sub-prefix, so
 * the second call re-walked the same tree and doubled the time (and the chance
 * of a Vercel function timeout) for no extra files.
 */
export async function listFolderMedia(
  bucket: StorageBucket,
  folder?: string,
): Promise<{ files: StorageFile[]; error: string | null }> {
  try {
    const res = await withTimeout(listMediaAction(bucket, folder), LIST_TIMEOUT_MS);

    if (!res.success) {
      return { files: res.files ?? [], error: res.error ?? "فشل تحميل الملفات" };
    }

    const files = [...(res.files ?? [])];
    files.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });

    return { files, error: null };
  } catch (err) {
    return {
      files: [],
      error: err instanceof Error ? err.message : "فشل تحميل الملفات",
    };
  }
}
