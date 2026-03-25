#!/usr/bin/env bash
#
# Build images.json / mobile-images.json from cached posts (featured media → medium URL).
# Run after fetch-the-standard-posts.sh. Requires: bash, curl, jq. Run from repo root.
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

mkdir -p "${imagesDir}" "${mobileImagesDir}" "${outputDir}" "${mobileOutputDir}" "${cachedDir}"

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
      jq '{id: .id, url: ."media_details" .sizes .medium ."source_url" }' \
        >"./${outDir}/${baseName}-${iter}.json" || true
    ((iter += 1)) || true
  done < <(jq -r '.[] | ._links."wp:featuredmedia"[0].href // empty' "${inputPath}")
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
