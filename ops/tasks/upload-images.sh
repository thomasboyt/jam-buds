#!/bin/bash
# https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/
set -Eeuo pipefail
trap 'echo "Aborting due to errexit on line $LINENO. Exit code: $?" >&2' ERR

# strategy via https://stackoverflow.com/a/26226261

upload_image() {
  IMAGE=$1
  docker save $IMAGE | gzip | pv | \
    ssh $JAMBUDS_SSH_REMOTE 'gunzip | docker load'
}

upload_image jambuds-api
upload_image jambuds-app