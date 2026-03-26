#!/usr/bin/env bash
#
# Build images.json / mobile-images.json from cached posts (featured media → medium URL).
# Run after fetch-the-standard-posts.sh. Requires: bash, curl, jq. Run from repo root.
# Environment:
#   LOCALIZE_IMAGE_ASSETS=1 (default) downloads images to public/cached-media and stores local URLs.
#   Set LOCALIZE_IMAGE_ASSETS=0 to keep remote CDN URLs in JSON.
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

fetchMediaJsonForPostsFile() {
  local inputPath="$1"
  local outDir="$2"
  local baseName="$3"
  local iter=1
  while IFS= read -r url; do
    [[ -z "${url}" || "${url}" == "null" ]] && continue
    echo "${url}"
    curl -s "${url}" \
      -H 'Accept: application/json' \
      -H 'Content-Type: application/json' |
      jq '{
        id: .id,
        url:
          ."media_details".sizes.medium.source_url //
          ."media_details".sizes.medium_large.source_url //
          ."media_details".sizes.large.source_url //
          ."media_details".sizes.full.source_url //
          .source_url
      }' \
        >"./${outDir}/${baseName}-${iter}.json" || true
    ((iter += 1)) || true
  done < <(jq -r '.[] | ._links."wp:featuredmedia"[0].href // empty' "${inputPath}")
}

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
    local localUrl="cached-media/${localFilename}"
    if [ ! -f "${localPath}" ]; then
      curl -sSL "${remoteUrl}" -o "${localPath}" || true
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
