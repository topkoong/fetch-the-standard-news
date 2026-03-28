#!/usr/bin/env bash
#
# fetch-the-standard-categories.sh
# =================================
# Downloads all **categories** from The Standard WordPress API (`wp/v2/categories`)
# and writes a single merged JSON array to src/assets/cached/categories.json.
#
# Used by:
#   - The app (category labels, navigation, grouping).
#   - build-story-pages-index.sh (maps numeric category ids on posts to human names).
#
# Prerequisites: bash, curl, jq. Run from repository root.
#
# Pagination note:
#   WordPress returns fixed `per_page=100` for full pages. The **last** page often
#   contains fewer than 100 items; this script uses a custom `per_page` on the final
#   request equal to `remainingPosts` so the API returns exactly the leftover rows
#   without an empty tail page.
#
set -euo pipefail

workdir="cachescripts"
categoriesBaseUrl="https://thestandard.co/wp-json/wp/v2/categories"
querySuffix="per_page=100&orderby=name&order=asc"
categoriesDir="${workdir}/categories-json"
categoriesGroupFilename="category-group"
outputDir="${categoriesDir}/merged"
outputFilename="categories.json"
cachedDir="src/assets/cached"

mkdir -p "${categoriesDir}" "${outputDir}" "${cachedDir}"

fetchAllCategoryPages() {
  echo "Fetching The Standard categories"
  headers=$(curl -sSI "${categoriesBaseUrl}?page=1&${querySuffix}")
  rawTotalPosts=$(echo "$headers" | grep -Fi X-WP-Total: || true)
  rawTotalPages=$(echo "$headers" | grep -Fi X-WP-TotalPages: || true)
  # Header names say "Total" but value is the number of **categories**, not posts.
  totalPosts=${rawTotalPosts//[!0-9]/}
  totalPages=${rawTotalPages//[!0-9]/}
  echo "totalPages: ${totalPages:-?}"
  echo "totalPosts: ${totalPosts:-?}"

  if [ -z "${totalPages:-}" ] || [ "$totalPages" -lt 1 ]; then
    echo "error: could not parse X-WP-TotalPages from API headers" >&2
    exit 1
  fi

  local count
  for ((count = 1; count <= totalPages; count++)); do
    if [ "$count" -eq "$totalPages" ]; then
      # Last page: request only the remaining items so we do not ask for 100 when fewer exist.
      local queriedPages=$((count - 1))
      local totalQueriedPosts=$((100 * queriedPages))
      local remainingPosts=$((totalPosts - totalQueriedPosts))
      echo "remainingPosts: $remainingPosts"
      echo "Fetching categories page: $count"
      curl -s "${categoriesBaseUrl}?page=${count}&per_page=${remainingPosts}&orderby=name&order=asc" \
        -H 'Accept: application/json' \
        -H 'Content-Type: application/json' |
        jq '.' >"./${categoriesDir}/${categoriesGroupFilename}-${count}.json"
    else
      echo "Fetching categories page: $count"
      curl -s "${categoriesBaseUrl}?page=${count}&${querySuffix}" \
        -H 'Accept: application/json' \
        -H 'Content-Type: application/json' |
        jq '.' >"./${categoriesDir}/${categoriesGroupFilename}-${count}.json"
    fi
  done
}

mergeJsonFiles() {
  jq -s 'flatten' "./${categoriesDir}/${categoriesGroupFilename}"-*.json >"./${outputDir}/${outputFilename}"
  echo "Copying cache file to ${cachedDir}"
  mv "./${outputDir}/${outputFilename}" "${cachedDir}/${outputFilename}"
  echo "Cleaning up ${categoriesDir}"
  rm -f "./${categoriesDir}/${categoriesGroupFilename}"-*.json
}

fetchAllCategoryPages
mergeJsonFiles
