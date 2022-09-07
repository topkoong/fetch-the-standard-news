#!/bin/sh
#
# Scrape post categories from the standard and store JSON data on disk
workdir="cachescripts"
categoriesBaseUrl="https://thestandard.co/wp-json/wp/v2/categories"
queryPerPage=100
categoriesDir="${workdir}/categories-json"
categoriesGroupFilename="category-group"
outputDir="${categoriesDir}/merged"
outputFilename="categories.json"
cachedDir="src/assets/cached"

getTotalCategoryPages() {
    echo "Fetching the standard categories"
    # headers=$(curl -I "${categoriesBaseUrl}?page=1&per_page=${queryPerPage}")
    # echo "headers: $headers"
    headers=$(curl -I https://jsonplaceholder.typicode.com/posts)
    echo "headers: $headers"
    curl -s https://jsonplaceholder.typicode.com/posts \
        -H 'Accept: application/json' \
        -H 'Content-Type: application/json' | jq '.'
    # rawTotalPosts=$(echo "$headers" | grep -Fi X-WP-Total:)
    # rawTotalPages=$(echo "$headers" | grep -Fi X-WP-TotalPages:)
    # echo "rawTotalPosts: $rawTotalPosts"
    # echo "rawTotalPages: $rawTotalPages"
    # totalPosts=${rawTotalPosts//[!0-9]/}
    # totalPages=${rawTotalPages//[!0-9]/}
    # echo "totalPages: $totalPages"
    # echo "totalPosts: $totalPosts"
    # echo "queryPerPage: $queryPerPage"
    # for ((count = 1; count <= $totalPages; count++)); do
    #     if [ $count -eq $totalPages ]; then
    #         quriedPages=$((count - 1))
    #         totalQueriedPages=$((queryPerPage * quriedPages))
    #         remainingPosts=$((totalPosts - totalQueriedPages))
    #         echo "remainingPosts: $remainingPosts"
    #         echo "Fetching the standard categories page: $count"
    #         curl -s "${categoriesBaseUrl}?page=${count}&per_page=${remainingPosts}" \
    #             -H 'Accept: application/json' \
    #             -H 'Content-Type: application/json' |
    #             jq '.' >./${categoriesDir}/${categoriesGroupFilename}-${count}.json
    #     else
    #         echo "Fetching the standard categories page: $count"
    #         curl -s "${categoriesBaseUrl}?page=${count}&per_page=${queryPerPage}" \
    #             -H 'Accept: application/json' \
    #             -H 'Content-Type: application/json' |
    #             jq '.' >./${categoriesDir}/${categoriesGroupFilename}-${count}.json
    #     fi
    # done
}
# mergeJsonFiles() {
#     jq -s 'flatten' ./${categoriesDir}/${categoriesGroupFilename}-*.json >./${outputDir}/${outputFilename}
#     echo "Copying cache file to static folder"
#     mv ./${outputDir}/${outputFilename} ${cachedDir}/${outputFilename}
#     echo "Cleaning up cache folder"
#     rm ./${categoriesDir}/${categoriesGroupFilename}-*.json
# }

getTotalCategoryPages
# mergeJsonFiles
