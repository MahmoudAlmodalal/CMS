/**
 * Thin Figma REST client.
 *
 * The token is read from FIGMA_TOKEN and never written to disk. All traffic goes
 * through the session HTTPS proxy, so api.figma.com must be allowed by the
 * environment's network policy — see docs/FIGMA_SYNC.md.
 */
const BASE = "https://api.figma.com";

export function requireToken() {
  const token = process.env.FIGMA_TOKEN;
  if (!token) {
    throw new Error("FIGMA_TOKEN is not set. Export your Figma personal access token before running this script.");
  }
  return token;
}

export function requireFileKey() {
  return process.env.FIGMA_FILE_KEY || "xcKbTxQQhUVOFJerTrkrw2";
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** GET a Figma API path, retrying on 429 and 5xx with exponential backoff. */
export async function figmaGet(path, { token = requireToken(), attempts = 5 } = {}) {
  let delay = 2000;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let response;
    try {
      response = await fetch(`${BASE}${path}`, { headers: { "X-Figma-Token": token } });
    } catch (cause) {
      if (attempt === attempts) throw new Error(`${path} failed: ${cause.message}`, { cause });
      await sleep(delay);
      delay *= 2;
      continue;
    }
    if (response.ok) return response.json();
    if (response.status === 403) {
      throw new Error(
        `${path} returned 403. Either the token lacks access to this file, or api.figma.com is blocked by the environment network policy.`,
      );
    }
    if (response.status !== 429 && response.status < 500) {
      throw new Error(`${path} returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
    }
    if (attempt === attempts) {
      throw new Error(`${path} still returning ${response.status} after ${attempts} attempts`);
    }
    await sleep(delay);
    delay *= 2;
  }
  throw new Error(`${path} exhausted retries`);
}

/** Figma rejects very long id lists; keep requests well under the URL limit. */
export function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export { sleep };
