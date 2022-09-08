#!/bin/sh

test=$(
    curl -s https://www.brandbuffet.in.th/wp-json/wp/v2/posts \
        -H 'Accept: application/json' \
        -H 'Content-Type: application/json' | jq '[ .[] | {id: .id,title: .title.rendered}]'
)

echo "${test}"
