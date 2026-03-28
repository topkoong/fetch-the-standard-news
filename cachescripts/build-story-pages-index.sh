#!/usr/bin/env bash
#
# build-story-pages-index.sh
# ===========================
# Compiles **story-pages.json**: a denormalized list of objects for the internal
# reader route (/read/:id). Each entry is self-contained so the UI does not need
# live WordPress calls for title, body, categories, hero image, or canonical link.
#
# Inputs (must already exist under src/assets/cached/):
#   - posts.json      — from fetch-the-standard-posts.sh
#   - categories.json — from fetch-the-standard-categories.sh
#   - images.json     — from fetch-image-urls.sh (featured_media id → url)
#
# Output:
#   - src/assets/cached/story-pages.json — JSON array consumed by read-story.tsx
#
# The heavy lifting is one **jq** program that:
#   1. Builds a map categoryId → category name from categories.json.
#   2. Builds a map mediaId → image URL from images.json.
#   3. Maps each post to { id, title, excerpt, contentHtml, date, categoryNames,
#      imageUrl, sourceUrl } with HTML stripped from title/excerpt for safe plain text.
#
# Prerequisites: bash, jq. Run from repository root **after** the three fetch scripts.
#
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
  # Remove simple HTML tags and normalize whitespace for excerpt/title display.
  def stripHtml:
    gsub("<[^>]*>"; " ")
    | gsub("&nbsp;"; " ")
    | gsub("\\s+"; " ")
    | sub("^\\s+"; "")
    | sub("\\s+$"; "");

  # { "12": "Business", ... } from categories array
  def categoryNameMap:
    ($categories[0] // [])
    | reduce .[] as $c ({}; . + { (($c.id|tostring)): ($c.name // "") });

  # { "456": "https://...", ... } from images array (id matches post.featured_media)
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
      # Prefer full content; fall back to excerpt HTML if content missing.
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
