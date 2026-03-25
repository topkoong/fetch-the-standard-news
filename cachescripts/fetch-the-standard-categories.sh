#!/usr/bin/env bash
#
# Download categories from The Standard WP API into src/assets/cached/categories.json
# Requires: bash, curl, jq. Run from repository root.
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
