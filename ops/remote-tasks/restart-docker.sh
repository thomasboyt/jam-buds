#!/bin/bash
# https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/
set -Eeuo pipefail
trap 'echo "Aborting due to errexit on line $LINENO. Exit code: $?" >&2' ERR

cd $JAMBUDS_REMOTE_PATH

docker network create jambuds &> /dev/null || true

if [ "$(docker ps -a -q -f name=jambuds-app)" ]; then
  echo "Removing running jambuds-app"
  docker stop jambuds-app > /dev/null
  docker rm jambuds-app > /dev/null
fi
if [ "$(docker ps -a -q -f name=jambuds-api)" ]; then
  echo "Removing running jambuds-api"
  docker stop jambuds-api > /dev/null
  docker rm jambuds-api > /dev/null
fi

docker run \
  --name jambuds-app \
  --env-file .env \
  -p 6000:8080 \
  --network jambuds \
  -u node \
  --restart always \
  -d jambuds-app

docker run \
  --name jambuds-api \
  --env-file .env \
  -p 6001:3000 \
  --network jambuds \
  -u node \
  --restart always \
  -d jambuds-api
