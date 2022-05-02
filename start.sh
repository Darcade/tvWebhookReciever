#!/bin/bash

cd ./ChromePlugin

yarn install
yarn build

cp -R artifacts/ ../Server/public/

cd ..

#grep -v '^#' .env

# Export env vars
export $(grep -v '^#' .env | xargs)

echo $PUBLIC_VAPID_KEY
echo $PRIVATE_VAPID_KEY
echo $MAILTO_VAPID

cd ./Server/

yarn start 