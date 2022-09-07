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
    headers=$(curl -I "${categoriesBaseUrl}?page=1&per_page=${queryPerPage}" -H 'authority: thestandard.co' -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' -H 'accept-language: en-US,en;q=0.9,th;q=0.8' -H 'cache-control: max-age=0' -H 'cookie: _ga=GA1.2.303761722.1658836647; _fbp=fb.1.1658836648323.503368516; _svtri=097582c5-8854-4c79-afc4-bfe53ee2e6eb; _pprv=%7B%22consent%22%3A%7B%220%22%3A%7B%22mode%22%3A%22opt-in%22%7D%2C%221%22%3A%7B%22mode%22%3A%22opt-in%22%7D%2C%222%22%3A%7B%22mode%22%3A%22opt-in%22%7D%2C%223%22%3A%7B%22mode%22%3A%22opt-in%22%7D%2C%224%22%3A%7B%22mode%22%3A%22opt-in%22%7D%2C%225%22%3A%7B%22mode%22%3A%22opt-in%22%7D%2C%226%22%3A%7B%22mode%22%3A%22opt-in%22%7D%2C%227%22%3A%7B%22mode%22%3A%22opt-in%22%7D%7D%7D; _pcid=%7B%22browserId%22%3A%22l7kpsv2axtngw3q0%22%7D; __gpi=UID=000008180a15dff6:T=1658836647:RT=1662137583:S=ALNI_MZjo-YSbuJbFVKlopFKXMcyBR3RcA; cX_G=cx%3A1qjrkuuq6t65jnzottt5akev%3Al3nfc0l5ionm; _svs=%7B%22p%22%3A%7B%2215%22%3A1662137588714%2C%222010%22%3A1662137588711%2C%224242%22%3A1662137588726%7D%7D; _pctx=%7Bu%7DN4IgDghg5gpgagSxgdwJIBMQC4QBsDsA1gI4AWArgMakBmYAXgHYBuAzlABwgA0I5rMAE6tsjcrly9%2BQgMoAXCHP7YQERgHtGPEKwRyYGFQEYjAZg4A2ACwX8%2BK6YBMp07YsmQAXyA; cX_P=l7kpsv2axtngw3q0; __gads=ID=64b55b8ff60dcc39:T=1658836647:S=ALNI_Mb_eY_B0pK7aGHqjjgEppymuWCWLA; ppwp_wp_session=f41b64af924afed8a74eea726f1cb629%7C%7C1662561784%7C%7C1662561424' -H 'sec-ch-ua: "Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"' -H 'sec-ch-ua-mobile: ?0' -H 'sec-ch-ua-platform: "macOS"' -H 'sec-fetch-dest: document' -H 'sec-fetch-mode: navigate' -H 'sec-fetch-site: none' -H 'sec-fetch-user: ?1' -H 'upgrade-insecure-requests: 1' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36')
    echo "headers: $headers"
    rawTotalPosts=$(echo "$headers" | grep -Fi X-WP-Total:)
    rawTotalPages=$(echo "$headers" | grep -Fi X-WP-TotalPages:)
    echo "rawTotalPosts: $rawTotalPosts"
    echo "rawTotalPages: $rawTotalPages"
    totalPosts=${rawTotalPosts//[!0-9]/}
    totalPages=${rawTotalPages//[!0-9]/}
    echo "totalPages: $totalPages"
    echo "totalPosts: $totalPosts"
    echo "queryPerPage: $queryPerPage"
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
mergeJsonFiles() {
    jq -s 'flatten' ./${categoriesDir}/${categoriesGroupFilename}-*.json >./${outputDir}/${outputFilename}
    echo "Copying cache file to static folder"
    mv ./${outputDir}/${outputFilename} ${cachedDir}/${outputFilename}
    echo "Cleaning up cache folder"
    rm ./${categoriesDir}/${categoriesGroupFilename}-*.json
}

getTotalCategoryPages
# mergeJsonFiles
