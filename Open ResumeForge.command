#!/bin/zsh
# ResumeForge (operator) — Vite dev server + browser.
# Double-click this file (or Desktop “ResumeForge.command”).
# Leave Terminal open while editing your resume profile.
# Phone on same Wi‑Fi: open the LAN URL printed below (not just localhost).

set -e
PORT=5181
ROOT="/Users/kenzi/Desktop/ChantzMediaProjects/ResumeForge"
DESKTOP_SHORTCUT="/Users/kenzi/Desktop/ResumeForge.command"
VERSION="0.3.1"

cd "$ROOT" || {
  echo "ERROR: App folder not found: $ROOT"
  exit 1
}

sync_desktop_shortcut() {
  cat > "$DESKTOP_SHORTCUT" <<EOF
#!/bin/zsh
# Desktop → ResumeForge ${VERSION}
# Auto-refreshed by Open ResumeForge.command — do not hand-edit.
# SSOT: ${ROOT}/Open ResumeForge.command
exec "${ROOT}/Open ResumeForge.command"
EOF
  chmod +x "$DESKTOP_SHORTCUT"
}

sync_desktop_shortcut

kill_port_server() {
  local pids
  pids=$(lsof -nP -iTCP:${PORT} -sTCP:LISTEN -t 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    echo "Stopping previous ResumeForge on port ${PORT}…"
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
    sleep 0.4
    pids=$(lsof -nP -iTCP:${PORT} -sTCP:LISTEN -t 2>/dev/null || true)
    if [[ -n "$pids" ]]; then
      # shellcheck disable=SC2086
      kill -9 $pids 2>/dev/null || true
      sleep 0.2
    fi
  fi
}

# Best-effort LAN IP for phone access
LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)
if [[ -z "$LAN_IP" ]]; then
  LAN_IP=$(ifconfig 2>/dev/null | awk '/inet / && $2 != "127.0.0.1" { print $2; exit }')
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  RESUMEFORGE  ${VERSION}  (mobile-ready)"
echo "║  leave this window OPEN                                     ║"
echo "║  Mac:   http://127.0.0.1:${PORT}/                            ║"
if [[ -n "$LAN_IP" ]]; then
echo "║  Phone: http://${LAN_IP}:${PORT}/$(printf '%*s' $((25 - ${#LAN_IP})) '')║"
else
echo "║  Phone: (find your Mac LAN IP) :${PORT}/                      ║"
fi
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Tip: same Wi‑Fi as your Mac. For install-to-home-screen / work use without Mac, host a build (HTTPS)."
echo ""

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies…"
  npm install
fi

kill_port_server

npm run dev -- --host --port "${PORT}" &
DEV_PID=$!

cleanup() {
  kill "$DEV_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

for i in {1..40}; do
  if curl -sf "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

open "http://127.0.0.1:${PORT}/" 2>/dev/null || true

echo "Server running (pid ${DEV_PID}). Ctrl+C to stop."
wait "$DEV_PID"
