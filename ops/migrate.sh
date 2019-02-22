#!/bin/bash
# https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/
set -Eeuo pipefail
trap 'echo "Aborting due to errexit on line $LINENO. Exit code: $?" >&2' ERR

# set pwd to root folder of the project
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
cd $SCRIPTPATH/..

# Load env vars for build & deploy
set -o allexport
source .env.deploy
set +o allexport

ssh $JAMBUDS_SSH_REMOTE \
  JAMBUDS_REMOTE_PATH=$JAMBUDS_REMOTE_PATH \
  'bash -s' < ops/remote-tasks/run-migrations.sh