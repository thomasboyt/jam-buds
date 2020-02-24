#!/bin/bash
set -euo pipefail

flyway_url=${JDBC_DATABASE_URL:-jdbc:postgresql://localhost:5433/jambuds_test?user=postgres&password=}
database_url=${DATABASE_URL:-postgres://postgres@localhost:5433/jambuds_test}

cd ../rhiannon
./gradlew flywayClean flywayMigrate -Dflyway.url=$flyway_url --console=plain

cd ../spec
mkdir -p tmp
pg_dump --schema-only $database_url > tmp/schema.sql
echo "Exported schema to $(pwd)/tmp/schema.sql"