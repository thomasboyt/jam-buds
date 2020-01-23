#!/bin/sh
./gradlew build
docker build -t jambuds-rhiannon .
docker run \
  -p 3333:3333 \
  --rm \
  --network jam-buds_default \
  --env JDBC_DATABASE_URL="jdbc:postgresql://jam-buds_db_1:5432/jambuds?user=postgres" \
  -m512M \
  --cpus 1 \
  jambuds-rhiannon
