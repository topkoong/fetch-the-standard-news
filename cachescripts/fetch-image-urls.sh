#!/bin/sh
#
# Scrape post image url from the standard and store JSON data on disk
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

getMobileImageResponses() {
    cp ./${cachedDir}/${mobileRawInputFilename} ./${mobileImagesDir}/${mobileInputFilename}
    ## .[] iterates over the outer array
    arr=($(cat ./${mobileImagesDir}/${mobileInputFilename} | jq '.[] ."_links" ."wp:featuredmedia"[0] .href'))
    ## now loop through the above array
    iter=1
    for url in ${arr[@]}; do
        url=$(sed -e 's/^"//' -e 's/"$//' <<<"$url")
        echo $url
        curl ${url} \
            -H 'Accept: application/json' \
            -H 'Content-Type: application/json' |
            jq '{id: .id, url: ."media_details" .sizes .medium ."source_url" }' >./${mobileImagesDir}/${mobileOutputFilename}-${iter}.json
        ((iter += 1))
    done
}
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
    jq -s 'flatten' ./${mobileImagesDir}/${mobileOutputFilename}-*.json >./${mobileOutputDir}/${mobileOutputFilename}
    jq -s 'flatten' ./${imagesDir}/${outputFilename}-*.json >./${outputDir}/${outputFilename}
    echo "Copying cache file to static folder"
    mv ./${outputDir}/${outputFilename} ${cachedDir}/${outputFilename}
    mv ./${mobileOutputDir}/${mobileOutputFilename} ${cachedDir}/${mobileOutputFilename}
    echo "Cleaning up cache folder"
    rm ./${imagesDir}/${outputFilename}-*.json
    rm ./${mobileImagesDir}/${mobileOutputFilename}-*.json
}
getMobileImageResponses
getImageResponses
mergeJsonFiles
