#!/usr/bin/env bash
# Restart the production preview the visual loop captures from.
# Kills by listening socket rather than by name: a pkill pattern like "next start"
# also matches the shell running it, which takes the caller down with the server.
set -u
LOG="${PREVIEW_LOG:-/tmp/next-preview.log}"
PORT="${PORT:-3000}"
pid=$(ss -lptn "sport = :$PORT" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1)
[ -n "${pid:-}" ] && kill "$pid" 2>/dev/null && sleep 2
nohup npx next start -p "$PORT" > "$LOG" 2>&1 &
until curl -s -o /dev/null -m 3 "http://localhost:$PORT/"; do sleep 1; done
echo "preview ready on :$PORT"
