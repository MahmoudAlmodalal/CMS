#!/usr/bin/env bash
# Build, then restart the production preview that the visual loop captures from.
#
# Build and restart are one step, and the old server must be confirmed dead first.
# Otherwise `next start` loses the port bind and exits with EADDRINUSE while the
# OLD process keeps serving a build that has since been replaced: its HTML asks for
# chunk files that no longer exist, the browser throws ChunkLoadError, and Chromium
# renders "This page couldn't load" — a page styled and complete enough to be
# captured as though it were the site.
#
# Processes are found by name, not by listening socket: `ss` is not installed here,
# and a port lookup that silently finds nothing looks exactly like a free port.
#
# The optimizer's image cache is dropped on every build. It is keyed by request
# URL, so a file in public/ that is replaced in place — as the reference crops in
# public/assets are — keeps serving its previous bytes indefinitely, and the
# capture scores an asset that is no longer in the tree.
#
# Pass --no-build to skip the build when nothing has changed.
set -uo pipefail
PORT="${PORT:-3000}"
LOG="${PREVIEW_LOG:-/tmp/next-preview.log}"

servers() { ps -eo pid,args | awk '/next-server|npm exec next start|[n]ext start -p/ && !/awk/ {print $1}'; }

if [ "${1:-}" != "--no-build" ]; then
  rm -rf .next/cache/images
  npm run build >/tmp/next-build.log 2>&1 || { echo "build failed:"; tail -30 /tmp/next-build.log; exit 1; }
fi

for pid in $(servers); do kill "$pid" 2>/dev/null; done
for _ in $(seq 1 20); do [ -z "$(servers)" ] && break; sleep 0.5; done
for pid in $(servers); do kill -9 "$pid" 2>/dev/null; done
sleep 1

if curl -fs -o /dev/null --max-time 2 "http://localhost:$PORT/"; then
  echo "something is still serving :$PORT after the kill" >&2; exit 1
fi

nohup npx next start -p "$PORT" > "$LOG" 2>&1 &
for _ in $(seq 1 90); do
  curl -fs -o /dev/null --max-time 2 "http://localhost:$PORT/" && break
  sleep 1
done
if ! curl -fs -o /dev/null --max-time 2 "http://localhost:$PORT/"; then
  echo "preview failed to start:" >&2; tail -20 "$LOG" >&2; exit 1
fi
if grep -q EADDRINUSE "$LOG" 2>/dev/null; then
  echo "preview lost the port race; an orphan is serving a stale build" >&2; exit 1
fi
echo "preview ready on :$PORT"
