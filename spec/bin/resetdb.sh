#!/bin/bash
set -euo pipefail

database_url=${DATABASE_URL:-postgres://postgres@localhost:5433/jambuds_test}
redis_url=${REDIS_URL:-redis://localhost:6380/1}

# okay for this to fail when schema doesn't exist
echo "Clearing schema"
set +e
psql $database_url -c "DROP SCHEMA public CASCADE;" > /dev/null 2>&1
set -e

psql $database_url -c "CREATE SCHEMA public;" > /dev/null

echo "Importing schema from $(pwd)/tmp/schema.sql"
psql $database_url < tmp/schema.sql > /dev/null

echo "Creating seed data"
psql $database_url -f "./data/data.sql"
wait

echo "Flushing Redis"
redis-cli -u $redis_url flushall