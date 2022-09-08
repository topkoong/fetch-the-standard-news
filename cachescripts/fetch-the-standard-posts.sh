#!/bin/sh
#
# Scrape posts from the standard and store JSON data on disk
workdir="cachescripts"
queryPerPage=100
postsDir="${workdir}/posts-json"
postsBaseUrl="https://thestandard.co/wp-json/wp/v2/posts"
postFilename="post"
outputDir="${postsDir}/merged"
outputFilename="posts.json"
cachedDir="src/assets/cached"

getTenPostPages() {
    echo "Fetching the standard posts"
    headers=$(curl -I "${postsBaseUrl}?page=1&per_page=${queryPerPage}")
    rawTotalPosts=$(echo "$headers" | grep -Fi X-WP-Total:)
    rawTotalPages=$(echo "$headers" | grep -Fi X-WP-TotalPages:)
    totalPosts=${rawTotalPosts//[!0-9]/}
    totalPages=${rawTotalPages//[!0-9]/}
    echo "totalPages: $totalPages"
    echo "totalPosts: $totalPosts"
    echo "queryPerPage: $queryPerPage"
    for ((count = 1; count <= 3; count++)); do
        if [ $count -le 10 ]; then
            echo "Fetching the standard posts page: $count"
            curl -s "${postsBaseUrl}?page=${count}&per_page=${queryPerPage}" \
                -H 'Accept: application/json' \
                -H 'Content-Type: application/json' |
                jq '.' >./${postsDir}/${postFilename}-${count}.json
        fi
    done
}
mergeJsonFiles() {
    jq -s 'flatten' ./${postsDir}/${postFilename}*.json >./${outputDir}/${outputFilename}
    echo "Copying cache file to static folder"
    mv ./${outputDir}/${outputFilename} ${cachedDir}/${outputFilename}
    echo "Cleaning up cache folder"
    rm ./${postsDir}/${postFilename}-*.json
}

getTenPostPages
mergeJsonFiles
