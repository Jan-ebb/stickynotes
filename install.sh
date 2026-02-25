#!/bin/bash
set -euo pipefail

REPO="Jan-ebb/stickynotes"
APP_NAME="StickyNotes.app"
INSTALL_DIR="/Applications"
TMP_DMG=""
MOUNT_POINT=""

cleanup() {
  if [ -n "$MOUNT_POINT" ] && [ -d "$MOUNT_POINT" ]; then
    hdiutil detach "$MOUNT_POINT" -quiet 2>/dev/null || true
  fi
  if [ -n "$TMP_DMG" ] && [ -f "$TMP_DMG" ]; then
    rm -f "$TMP_DMG"
  fi
}
trap cleanup EXIT

echo "Fetching latest release..."
# Try the latest release first, then fall back to scanning recent releases
# in case the newest release has no DMG asset yet.
DMG_URL=$(curl -sfL "https://api.github.com/repos/${REPO}/releases/latest" \
  | grep -o '"browser_download_url":\s*"[^"]*\.dmg"' \
  | head -1 \
  | cut -d'"' -f4)

if [ -z "$DMG_URL" ]; then
  DMG_URL=$(curl -sfL "https://api.github.com/repos/${REPO}/releases?per_page=10" \
    | grep -o '"browser_download_url":\s*"[^"]*\.dmg"' \
    | head -1 \
    | cut -d'"' -f4)
fi

if [ -z "$DMG_URL" ]; then
  echo "Error: could not find a DMG in any recent release." >&2
  echo "Check https://github.com/${REPO}/releases" >&2
  exit 1
fi

TMP_DMG=$(mktemp /tmp/StickyNotes-XXXXXX.dmg)

echo "Downloading $(basename "$DMG_URL")..."
curl -fL "$DMG_URL" -o "$TMP_DMG"

echo "Mounting..."
ATTACH_OUTPUT=$(hdiutil attach "$TMP_DMG" -nobrowse 2>&1) || {
  echo "Error: failed to mount DMG." >&2
  echo "$ATTACH_OUTPUT" >&2
  exit 1
}
MOUNT_POINT=$(echo "$ATTACH_OUTPUT" | grep '/Volumes/' | sed 's/.*\/Volumes/\/Volumes/' | head -1)

if [ -z "$MOUNT_POINT" ] || [ ! -d "$MOUNT_POINT/$APP_NAME" ]; then
  echo "Error: app not found in mounted DMG." >&2
  echo "Mount output: $ATTACH_OUTPUT" >&2
  exit 1
fi

echo "Installing to ${INSTALL_DIR}..."
rm -rf "${INSTALL_DIR}/${APP_NAME}"
cp -R "${MOUNT_POINT}/${APP_NAME}" "${INSTALL_DIR}/"

echo "Removing quarantine flag..."
xattr -cr "${INSTALL_DIR}/${APP_NAME}"

echo ""
echo "StickyNotes installed to ${INSTALL_DIR}/${APP_NAME}"
echo "Open it from Applications or run: open -a StickyNotes"
