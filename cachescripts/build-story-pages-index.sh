#!/usr/bin/env bash
#
# Build a structured story index for internal reading pages.
# Requires: bash, jq. Run from repository root after fetching posts/categories/images.
set -euo pipefail

cachedDir="src/assets/cached"
postsJson="${cachedDir}/posts.json"
categoriesJson="${cachedDir}/categories.json"
imagesJson="${cachedDir}/images.json"
outputJson="${cachedDir}/story-pages.json"

if [ ! -f "${postsJson}" ] || [ ! -f "${categoriesJson}" ] || [ ! -f "${imagesJson}" ]; then
  echo "error: missing required cached JSON files in ${cachedDir}" >&2
  exit 1
fi

echo "Building ${outputJson}"
jq -n \
  --slurpfile posts "${postsJson}" \
  --slurpfile categories "${categoriesJson}" \
  --slurpfile images "${imagesJson}" \
  '
  def stripHtml:
    gsub("<[^>]*>"; " ")
    | gsub("&nbsp;"; " ")
    | gsub("\\s+"; " ")
    | sub("^\\s+"; "")
    | sub("\\s+$"; "");

  def categoryNameMap:
    ($categories[0] // [])
    | reduce .[] as $c ({}; . + { (($c.id|tostring)): ($c.name // "") });

  def imageMap:
    ($images[0] // [])
    | reduce .[] as $img ({}; . + { (($img.id|tostring)): ($img.url // "") });

  (categoryNameMap) as $catMap
  | (imageMap) as $imgMap
  | ($posts[0] // [])
  | map({
      id: .id,
      title: ((.title.rendered // "Untitled") | stripHtml),
      excerpt: ((.excerpt.rendered // "") | stripHtml),
      contentHtml: (.content.rendered // .excerpt.rendered // ""),
      date: .date,
      categoryNames: (
        (.categories // [])
        | map(($catMap[(tostring)] // empty))
        | map(select(length > 0))
      ),
      imageUrl: ($imgMap[(.featured_media|tostring)] // empty),
      sourceUrl: (.link // empty)
    })
  ' >"${outputJson}"

echo "Wrote ${outputJson}"
