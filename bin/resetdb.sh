#!/bin/bash
set -euo pipefail

# this just uses the spec/ resetdb script which i think is fine?
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cd $SCRIPT_DIR/../rhiannon
./gradlew flywayClean flywayMigrate --console=plain

cd ../spec
psql "postgres://postgres@localhost:5433/jambuds" -f "./data/data.sql"