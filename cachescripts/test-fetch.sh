#!/usr/bin/env bash
# Quick smoke test: The Standard WP REST returns post JSON.
set -euo pipefail
curl -sS "https://thestandard.co/wp-json/wp/v2/posts?per_page=1&orderby=date&order=desc" \
  -H 'Accept: application/json' |
  jq '.[0] | { id, title: .title.rendered }'
