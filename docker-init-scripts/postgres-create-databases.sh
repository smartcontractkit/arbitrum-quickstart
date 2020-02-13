#!/bin/bash

set -e
set -u

function create_user_and_database() {
  local database=$1
  echo "  Creating user and database '$database'"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	    CREATE USER $database;
	    CREATE DATABASE $database;
	    GRANT ALL PRIVILEGES ON DATABASE $database TO $database;
EOSQL
}

if [ -n "$POSTGRES_CREATE_DATABASES" ]; then
  echo "Database creation requested: $POSTGRES_CREATE_DATABASES"
  for db in $(echo $POSTGRES_CREATE_DATABASES | tr ',' ' '); do
    create_user_and_database $db
  done
  echo "Database(s) created"
fi
