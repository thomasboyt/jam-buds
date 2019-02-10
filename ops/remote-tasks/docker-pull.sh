#!/bin/bash
# https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/
set -Eeuo pipefail
trap 'echo "Aborting due to errexit on line $LINENO. Exit code: $?" >&2' ERR

docker pull $JAMBUDS_DOCKER_REGISTRY/jambuds-app
docker tag $JAMBUDS_DOCKER_REGISTRY/jambuds-app jambuds-app
docker pull $JAMBUDS_DOCKER_REGISTRY/jambuds-api
docker tag $JAMBUDS_DOCKER_REGISTRY/jambuds-api jambuds-api