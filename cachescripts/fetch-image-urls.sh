#!/bin/sh
#
# Scrape post image url from the standard and store JSON data on disk
workdir="cachescripts"
imagesDir="${workdir}/images-json"
cachedDir="src/assets/cached"
rawInputFilename="posts.json"
inputFilename="input-${rawInputFilename}"
outputFilename="images.json"
outputDir="${imagesDir}/merged"
mockNum=936

# optional adding
# mockNum=936
#  if [ $iter -gt ${mockNum} ]; then
#     url=$(sed -e 's/^"//' -e 's/"$//' <<<"$url")
#     echo $url
#     curl ${url} \
#         -H 'Accept: application/json' \
#         -H 'Content-Type: application/json' |
#         jq '{id: .id, url: .guid.rendered}' >./${imagesDir}/${outputFilename}-${iter}.json
# fi
# ((iter += 1))

# adding a specific image
# mockNum=936
#  if [ $iter -gt ${mockNum} ]; then
#     url=$(sed -e 's/^"//' -e 's/"$//' <<<"$url")
#     echo $url
#     curl ${url} \
#         -H 'Accept: application/json' \
#         -H 'Content-Type: application/json' |
#         jq '{id: .id, url: .guid.rendered}' >./${imagesDir}/${outputFilename}-${iter}.json
# fi
# ((iter += 1))

getImageResponses() {
    cp ./${cachedDir}/${rawInputFilename} ./${imagesDir}/${inputFilename}
    ## .[] iterates over the outer array
    arr=($(cat ./${imagesDir}/${inputFilename} | jq '.[] ."_links" ."wp:featuredmedia"[0] .href'))
    ## now loop through the above array
    iter=1
    for url in ${arr[@]}; do
        url=$(sed -e 's/^"//' -e 's/"$//' <<<"$url")
        echo $url
        curl ${url} \
            -H 'Accept: application/json' \
            -H 'Content-Type: application/json' |
            jq '{id: .id, url: ."media_details" .sizes .medium ."source_url" }' >./${imagesDir}/${outputFilename}-${iter}.json
        ((iter += 1))
    done
}
mergeJsonFiles() {
    jq -s 'flatten' ./${imagesDir}/${outputFilename}-*.json >./${outputDir}/${outputFilename}
    echo "Copying cache file to static folder"
    mv ./${outputDir}/${outputFilename} ${cachedDir}/${outputFilename}
    echo "Cleaning up cache folder"
    rm ./${imagesDir}/${outputFilename}-*.json
}

getImageResponses
mergeJsonFiles
