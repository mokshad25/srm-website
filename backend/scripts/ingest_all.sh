#!/usr/bin/env bash
# Indexes every URL in scripts/ingest_urls.tsv, carries on past failures, then
# prints what failed and the admin stats. Run from backend/ with the venv active
# and the API running. Set API_BASE to use another host.
set -u
cd "$(dirname "$0")/.."

YEAR="2026-27"
API_BASE="${API_BASE:-http://127.0.0.1:8000}"
ok=0
failed=()

while IFS=$'\t' read -r category url; do
  [ -z "$url" ] && continue
  echo "--> [$category] $url"
  if output=$(python -m app.ingestion.cli --url "$url" --category "$category" --academic-year "$YEAR" 2>&1); then
    echo "    $(echo "$output" | tail -n 1)"
    ok=$((ok + 1))
  else
    reason=$(echo "$output" | tail -n 1)
    echo "    FAILED: $reason"
    failed+=("$url  ->  $reason")
  fi
done < scripts/ingest_urls.tsv

echo
echo "Indexed: $ok   Failed: ${#failed[@]}"
for line in "${failed[@]:-}"; do [ -n "$line" ] && echo "  $line"; done

key=$(grep -E '^ADMIN_API_KEY=' .env | cut -d= -f2-)
echo
echo "GET /api/admin/stats"
curl -s -H "Authorization: Bearer $key" "$API_BASE/api/admin/stats" || echo "API not reachable at $API_BASE"
echo
