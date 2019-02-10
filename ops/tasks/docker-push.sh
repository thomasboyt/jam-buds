#!/bin/bash
# https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/
set -Eeuo pipefail
trap 'echo "Aborting due to errexit on line $LINENO. Exit code: $?" >&2' ERR

docker tag jambuds-api $JAMBUDS_DOCKER_REGISTRY/jambuds-api
docker push $JAMBUDS_DOCKER_REGISTRY/jambuds-api
docker tag jambuds-app $JAMBUDS_DOCKER_REGISTRY/jambuds-app
docker push $JAMBUDS_DOCKER_REGISTRY/jambuds-app