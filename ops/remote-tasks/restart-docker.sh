#!/bin/bash
# https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/
set -Eeuo pipefail
trap 'echo "Aborting due to errexit on line $LINENO. Exit code: $?" >&2' ERR

cd $JAMBUDS_REMOTE_PATH

docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d