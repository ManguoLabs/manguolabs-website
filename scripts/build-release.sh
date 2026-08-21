#!/usr/bin/env bash
set -euo pipefail
out="${1:-dist}"; stage="$(mktemp -d)"; trap 'rm -rf "$stage"' EXIT; mkdir -p "$out"
for f in index.html robots.txt sitemap.xml; do test -f "$f"; cp "$f" "$stage/"; done
for d in assets articles node-firewall xboard-security-audit xboard-node-extension; do test -d "$d"; cp -a "$d" "$stage/"; done
find "$stage" -type f \( -name '.DS_Store' -o -name '._*' -o -name '.gitkeep' \) -delete
if find "$stage" -type f \( -name 'MANIFEST.sha256' -o -name '.env*' -o -name '*.pem' -o -name '*.key' -o -name '*.sql' -o -name '*.sqlite*' -o -name 'id_rsa*' -o -name 'id_ed25519*' \) -print | grep -q .; then echo 'Forbidden file in release' >&2; exit 1; fi
node scripts/validate-seo.mjs
archive="$out/manguolabs-website.tar.gz"; tar -C "$stage" -czf "$archive" .
(cd "$out" && sha256sum manguolabs-website.tar.gz > manguolabs-website.tar.gz.sha256)
! tar -tzf "$archive" | grep -Eq '(^|/)MANIFEST\.sha256$'
echo "Built $archive and checksum"
