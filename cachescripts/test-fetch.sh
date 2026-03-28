#!/usr/bin/env bash
#
# test-fetch.sh
# =============
# Minimal **connectivity smoke test** for The Standard WordPress REST API.
# Does **not** write any cache files — prints one post’s id and title to stdout.
#
# Use this to verify curl/jq/network before running the heavier fetch scripts, or in
# debugging when CI cannot reach the API.
#
# Example:
#   bash cachescripts/test-fetch.sh
#
set -euo pipefail

curl -sS "https://thestandard.co/wp-json/wp/v2/posts?per_page=1&orderby=date&order=desc" \
  -H 'Accept: application/json' |
  jq '.[0] | { id, title: .title.rendered }'
