#!/usr/bin/env bash
#
# fetch-image-urls.sh
# ====================
# Builds **id → image URL** maps for featured media referenced by cached posts.
# Must run **after** fetch-the-standard-posts.sh (reads src/assets/cached/posts.json
# and mobile-posts.json).
#
# Two parallel pipelines:
#   - **Desktop**: full posts.json → many per-media JSON files → merged images.json
#   - **Mobile**: mobile-posts.json (subset) → merged mobile-images.json
#
# For each post, the script reads `_links["wp:featuredmedia"][0].href` and curls that
# **media** endpoint (not the binary file yet). From the JSON it prefers, in order:
#   medium → medium_large → large → full → source_url
#
# Localization (default ON):
#   When LOCALIZE_IMAGE_ASSETS=1, each URL is downloaded to public/cached-media/<id>.<ext>.
#   The response **Content-Type** must start with `image/`; otherwise the file is removed
#   and the remote URL is kept in JSON so broken HTML/error pages are not shipped as images.
#
# Environment:
#   LOCALIZE_IMAGE_ASSETS — 1 (default) or 0. See readme “Cache scripts” section.
#
# Prerequisites: bash, curl, jq, awk. Run from repository root.
#
set -euo pipefail

shopt -s nullglob

workdir="cachescripts"
imagesDir="${workdir}/images-json/desktop"
mobileImagesDir="${workdir}/images-json/mobile"
cachedDir="src/assets/cached"
rawInputFilename="posts.json"
mobileRawInputFilename="mobile-posts.json"
inputFilename="input-${rawInputFilename}"
mobileInputFilename="mobile-input-${rawInputFilename}"
outputFilename="images.json"
mobileOutputFilename="mobile-images.json"
outputDir="${imagesDir}/merged"
mobileOutputDir="${mobileImagesDir}/merged"
publicMediaDir="public/cached-media"
localizeImageAssets="${LOCALIZE_IMAGE_ASSETS:-1}"

mkdir -p "${imagesDir}" "${mobileImagesDir}" "${outputDir}" "${mobileOutputDir}" "${cachedDir}" "${publicMediaDir}"

# For each featured-media REST URL in the posts file, fetch JSON and extract {id, url}.
fetchMediaJsonForPostsFile() {
  local inputPath="$1"
  local outDir="$2"
  local baseName="$3"
  local iter=1
  # One jq expression, no line breaks; bracket keys for sizes. Assign in shell so // is never split by continuations.
  local media_jq='{id: .id, url: (.media_details.sizes["medium"].source_url // .media_details.sizes["medium_large"].source_url // .media_details.sizes["large"].source_url // .media_details.sizes["full"].source_url // .source_url // "")}'
  local jqerr
  while IFS= read -r url; do
    [[ -z "${url}" || "${url}" == "null" ]] && continue
    echo "${url}"
    local out="./${outDir}/${baseName}-${iter}.json"
    jqerr=$(mktemp)
    if ! curl -s "${url}" \
      -H 'Accept: application/json' \
      -H 'Content-Type: application/json' |
      jq "${media_jq}" >"${out}" 2>"${jqerr}"; then
      echo "warning: jq/curl failed for ${url}: $(tr '\n' ' ' <"${jqerr}")" >&2
      jq -n '{id: null, url: ""}' >"${out}"
    fi
    rm -f "${jqerr}"
    ((iter += 1)) || true
  done < <(jq -r '.[] | ._links["wp:featuredmedia"][0].href // empty' "${inputPath}")
}

# Infer file extension from URL path (strip query string); default jpg if unknown.
getFileExt() {
  local url="$1"
  local clean="${url%%\?*}"
  local ext="${clean##*.}"
  if [[ -z "${ext}" || "${ext}" == "${clean}" || "${#ext}" -gt 5 ]]; then
    echo "jpg"
  else
    echo "${ext}"
  fi
}

# Rewrite images.json in place: replace remote URLs with cached-media/ paths when a
# valid image file exists on disk after download.
localizeImagesFile() {
  local inputJson="$1"
  local outputJson="$2"
  local tmpOutput="${outputJson}.tmp"
  : >"${tmpOutput}"
  echo "[" >"${tmpOutput}"
  local first=1
  while IFS=$'\t' read -r id remoteUrl; do
    [[ -z "${id}" || -z "${remoteUrl}" || "${remoteUrl}" == "null" ]] && continue
    local ext
    ext=$(getFileExt "${remoteUrl}")
    local localFilename="${id}.${ext}"
    local localPath="${publicMediaDir}/${localFilename}"
    # Path relative to site root as stored in JSON (Vite public/ is served at /).
    local localUrl="cached-media/${localFilename}"
    if [ ! -f "${localPath}" ]; then
      local headersPath="${localPath}.headers"
      curl -sSL -D "${headersPath}" "${remoteUrl}" -o "${localPath}" || true
      local contentType
      contentType="$(awk -F': ' 'BEGIN{IGNORECASE=1} /^Content-Type:/ {print tolower($2); exit}' "${headersPath}" | tr -d '\r')"
      rm -f "${headersPath}"
      if [[ -z "${contentType}" || "${contentType}" != image/* ]]; then
        rm -f "${localPath}"
      fi
    fi
    local finalUrl="${remoteUrl}"
    if [ -f "${localPath}" ] && [ -s "${localPath}" ]; then
      finalUrl="${localUrl}"
    fi
    if [ "${first}" -eq 0 ]; then
      echo "," >>"${tmpOutput}"
    fi
    jq -n --argjson id "${id}" --arg url "${finalUrl}" '{id: $id, url: $url}' >>"${tmpOutput}"
    first=0
  done < <(jq -r '.[] | [.id, .url] | @tsv' "${inputJson}")
  echo "]" >>"${tmpOutput}"
  mv "${tmpOutput}" "${outputJson}"
}

getMobileImageResponses() {
  cp "./${cachedDir}/${mobileRawInputFilename}" "./${mobileImagesDir}/${mobileInputFilename}"
  fetchMediaJsonForPostsFile "./${mobileImagesDir}/${mobileInputFilename}" "${mobileImagesDir}" "${mobileOutputFilename}"
}

getImageResponses() {
  cp "./${cachedDir}/${rawInputFilename}" "./${imagesDir}/${inputFilename}"
  fetchMediaJsonForPostsFile "./${imagesDir}/${inputFilename}" "${imagesDir}" "${outputFilename}"
}

mergeJsonFiles() {
  local files
  files=("./${mobileImagesDir}/${mobileOutputFilename}"-*.json)
  if [ ${#files[@]} -gt 0 ]; then
    jq -s 'flatten' "${files[@]}" >"./${mobileOutputDir}/${mobileOutputFilename}"
  else
    echo '[]' >"./${mobileOutputDir}/${mobileOutputFilename}"
  fi
  files=("./${imagesDir}/${outputFilename}"-*.json)
  if [ ${#files[@]} -gt 0 ]; then
    jq -s 'flatten' "${files[@]}" >"./${outputDir}/${outputFilename}"
  else
    echo '[]' >"./${outputDir}/${outputFilename}"
  fi
  if [ "${localizeImageAssets}" = "1" ]; then
    echo "Localizing images into ${publicMediaDir}"
    localizeImagesFile "./${mobileOutputDir}/${mobileOutputFilename}" "./${mobileOutputDir}/${mobileOutputFilename}"
    localizeImagesFile "./${outputDir}/${outputFilename}" "./${outputDir}/${outputFilename}"
  fi
  echo "Copying cache files to ${cachedDir}"
  mv "./${outputDir}/${outputFilename}" "${cachedDir}/${outputFilename}"
  mv "./${mobileOutputDir}/${mobileOutputFilename}" "${cachedDir}/${mobileOutputFilename}"
  echo "Cleaning up temp image JSON"
  rm -f "./${imagesDir}/${outputFilename}"-*.json
  rm -f "./${mobileImagesDir}/${mobileOutputFilename}"-*.json
}

getMobileImageResponses
getImageResponses
mergeJsonFiles
