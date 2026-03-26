#!/usr/bin/env bash
#
# Download posts from The Standard WP API into src/assets/cached.
# Requires: bash, curl, jq. Run from repository root.
#
# Environment:
#   POST_FETCH_PAGES — number of pages to fetch (100 posts each), default all.
#                      Set to "all" to fetch every page (can be very slow / large).
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

fetchPostPages() {
  echo "Fetching The Standard posts"
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

mergeJsonFiles() {
  jq -s 'flatten' "./${postsDir}/${postFilename}"*.json >"./${outputDir}/${outputFilename}"
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
