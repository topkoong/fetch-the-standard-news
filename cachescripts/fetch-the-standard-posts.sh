#!/usr/bin/env bash
#
# fetch-the-standard-posts.sh
# ============================
# Downloads WordPress REST **posts** from The Standard (`wp/v2/posts`) and merges
# paginated responses into JSON files consumed by the Vite app and downstream scripts.
#
# Prerequisites (run from repository root):
#   - bash 4+, curl, jq
#
# Outputs (final paths):
#   - src/assets/cached/posts.json       — full merged list (all fetched pages).
#   - src/assets/cached/mobile-posts.json — posts from **page 1 only** (lighter bundle).
#   - src/assets/cached/posts-meta.json   — audit: totals from WP headers + how many
#                                           pages were actually fetched.
#
# Environment:
#   POST_FETCH_PAGES — Optional. Non-negative integer = max number of API pages to pull
#                      (each page is up to `queryPerPage` posts, default 100).
#                      Default when unset: **all** pages reported by `X-WP-TotalPages`.
#                      Use e.g. `POST_FETCH_PAGES=3` for a fast partial refresh.
#
# Flow:
#   1. HEAD-like request via curl -sSI on page 1 to read X-WP-Total / X-WP-TotalPages.
#   2. Loop pages 1..maxPage, save each response as pretty-printed JSON under
#      cachescripts/posts-json/post-<n>.json
#   3. jq -s 'flatten' merges all page files into one array for posts.json;
#      mobile-posts.json uses only post-1.json (single-page slice for mobile bundle).
#   4. Move merged files into src/assets/cached/ and delete per-page temp files.
#
set -euo pipefail

workdir="cachescripts"
queryPerPage=100
postsDir="${workdir}/posts-json"
postsBaseUrl="https://thestandard.co/wp-json/wp/v2/posts"
querySuffix="per_page=${queryPerPage}&orderby=date&order=desc"
postFilename="post"
outputDir="${postsDir}/merged"
outputFilename="posts.json"
mobileOutputFilename="mobile-posts.json"
metaOutputFilename="posts-meta.json"
cachedDir="src/assets/cached"

mkdir -p "${postsDir}" "${outputDir}" "${cachedDir}"

# --- Fetch every requested page from the REST API ---------------------------------
fetchPostPages() {
  echo "Fetching The Standard posts"
  # WordPress sends total count and page count in response headers (not JSON body).
  headers=$(curl -sSI "${postsBaseUrl}?page=1&${querySuffix}")
  rawTotalPosts=$(echo "$headers" | grep -Fi X-WP-Total: || true)
  rawTotalPages=$(echo "$headers" | grep -Fi X-WP-TotalPages: || true)
  totalPosts=${rawTotalPosts//[!0-9]/}
  totalPages=${rawTotalPages//[!0-9]/}
  echo "totalPages: ${totalPages:-?}"
  echo "totalPosts: ${totalPosts:-?}"
  echo "queryPerPage: ${queryPerPage}"

  if [ -z "${totalPages:-}" ] || [ "$totalPages" -lt 1 ]; then
    echo "error: could not parse X-WP-TotalPages from API headers" >&2
    exit 1
  fi

  # Cap how many pages we download: either user limit or full site.
  local want="${POST_FETCH_PAGES:-all}"
  local maxPage
  if [ "$want" = "all" ]; then
    maxPage="$totalPages"
  else
    if ! [[ "$want" =~ ^[0-9]+$ ]]; then
      echo "error: POST_FETCH_PAGES must be a non-negative number or 'all'" >&2
      exit 1
    fi
    maxPage="$want"
    if [ "$maxPage" -gt "$totalPages" ]; then
      maxPage="$totalPages"
    fi
  fi

  if [ "$maxPage" -lt 1 ]; then
    echo "error: nothing to fetch (POST_FETCH_PAGES=0?)" >&2
    exit 1
  fi

  echo "Fetching pages 1..${maxPage} (set POST_FETCH_PAGES or POST_FETCH_PAGES=all to change)"
  local count
  for ((count = 1; count <= maxPage; count++)); do
    echo "Fetching page: $count"
    curl -s "${postsBaseUrl}?page=${count}&${querySuffix}" \
      -H 'Accept: application/json' \
      -H 'Content-Type: application/json' |
      jq '.' >"./${postsDir}/${postFilename}-${count}.json"
  done

  # Record what we actually pulled (for CI logs and debugging stale caches).
  jq -n \
    --argjson totalPosts "${totalPosts}" \
    --argjson totalPages "${totalPages}" \
    --argjson fetchedPages "${maxPage}" \
    --argjson perPage "${queryPerPage}" \
    --arg fetchedAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    '{
      totalPosts: $totalPosts,
      totalPages: $totalPages,
      fetchedPages: $fetchedPages,
      perPage: $perPage,
      fetchedAt: $fetchedAt
    }' >"./${outputDir}/${metaOutputFilename}"
}

# --- Merge page files into app-facing bundles -------------------------------------
mergeJsonFiles() {
  # jq -s slurps all inputs as array of arrays; flatten produces one big post array.
  jq -s 'flatten' "./${postsDir}/${postFilename}"*.json >"./${outputDir}/${outputFilename}"
  # Mobile bundle: intentionally only the first page to limit asset size.
  jq -s 'flatten' "./${postsDir}/${postFilename}-1.json" >"./${outputDir}/${mobileOutputFilename}"
  echo "Copying cache files to ${cachedDir}"
  mv "./${outputDir}/${mobileOutputFilename}" "${cachedDir}/${mobileOutputFilename}"
  mv "./${outputDir}/${outputFilename}" "${cachedDir}/${outputFilename}"
  mv "./${outputDir}/${metaOutputFilename}" "${cachedDir}/${metaOutputFilename}"
  echo "Cleaning up ${postsDir}"
  rm -f "./${postsDir}/${postFilename}"-*.json
}

fetchPostPages
mergeJsonFiles
