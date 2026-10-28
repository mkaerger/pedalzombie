#!/usr/bin/env bash
# Manual fallback for the GitHub Actions deploy (.github/workflows/deploy.yml):
# builds the site and uploads dist/ to the Strato web root via SFTP, after backing up
# the current online state into .deploy/.
#
#   npm run deploy
#
# Connection settings: SFTP_CONF (default ../sftp.conf) with SFTP_HOST, SFTP_USER.
# Password: macOS keychain item "pedalzombie-sftp" — never stored in this repo.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
conf="${SFTP_CONF:-$root/../sftp.conf}"
# shellcheck source=/dev/null
source "$conf"
: "${SFTP_HOST:?missing in $conf}" "${SFTP_USER:?missing in $conf}"
SFTP_PASS="$(security find-generic-password -s pedalzombie-sftp -w)"
export SFTP_PASS

cd "$root"
npm run test --silent
npm run build --silent

work="$root/.deploy"
mkdir -p "$work"
stamp="$(date +%Y%m%d-%H%M%S)"

read -r -p "Deploy to https://pedalzombie.com (live)? Type 'live' to continue: " answer
[[ "$answer" == "live" ]] || { echo "aborted"; exit 1; }

backup="$work/backup-$stamp"
mkdir -p "$backup"
{
  echo "lcd $backup"
  for f in index.html favicon.ico .htaccess; do echo "-get -p $f"; done
  (cd dist && find . -mindepth 1 -maxdepth 1 -type d | sed 's|^\./|-get -pr |')
} > "$work/backup.cmds"
expect scripts/sftp.exp "$SFTP_USER@$SFTP_HOST" "$work/backup.cmds" > /dev/null
(cd "$work" && zip -qr "backup-$stamp.zip" "backup-$stamp" && rm -rf "backup-$stamp")
echo "Backup of the online state: .deploy/backup-$stamp.zip"

{
  echo "lcd $root/dist"
  echo "cd /"
  # sftp has no recursive mkdir for put -r targets, so create every directory first
  (cd dist && find . -mindepth 1 -type d | sed 's|^\./|-mkdir |')
  echo "put .htaccess"
  (cd dist && find . -mindepth 1 -maxdepth 1 ! -name .htaccess | sed "s|^\./|put -r |")
} > "$work/upload.cmds"

expect scripts/sftp.exp "$SFTP_USER@$SFTP_HOST" "$work/upload.cmds" > "$work/upload-$stamp.log"
echo "Uploaded dist/ to / on $SFTP_HOST"
