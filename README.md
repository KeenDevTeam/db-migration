# Database migration CLI

Keep your Postgres database synchronized.

## Installation

### Environment variables

#### Migration config

| Name | Required | Type | Default Value | Description |
|:-----|:--------:|:----:|:--------------|:------------|
| KD_DB_MIGRATION_SCHEMA_NAME | NO | String | 'public' | The schema that migration table is located/created in. |
| KD_DB_MIGRATION_TABLE_NAME | Yes | String | null | Name of the table that contains migration information. |
| KD_DB_MIGRATION_KEEP_MIGRATIONS_TRACK | NO | Boolean | true | Flag for determining keeping track of the migrations applied. |

#### Database engine

| Name | Required | Type | Default Value | Description |
|:-----|:--------:|:----:|:--------------|:------------|
| KD_DB_MIGRATION_DB_ENGINE | Yes | String | null | Only 'pg'. |

##### Postgres

| Name | Required | Type | Default Value | Description |
|:-----|:--------:|:----:|:--------------|:------------|
| KD_DB_PG_DATABASE_URI | Yes | String | null | URI that points to the target postgres database (e.g. postgres://user:pass@hostname:5432/db_name_here). |
| KD_DB_PG_DATABASE_CONNECT_TIMEOUT | No | String | '10s' | The time to wait before raising timeout error while connecting to the database in MS compatible format. |
| KD_DB_PG_DATABASE_QUERY_TIMEOUT | No | String | '5s' | The time to wait before raising timeout error while waiting for the query result in MS compatible format. |
| KD_DB_PG_DATABASE_POOL_SIZE_MIN | No | Number | 10 | Minimum number of open connections. |
| KD_DB_PG_DATABASE_POOL_SIZE_MAX | No | Number | 50 | Maximum number of open connections. |
| KD_DB_PG_DATABASE_IDLE_IN_TRANSACTION_TIMEOUT | No | String | '10s' | The time to wait before raising timeout error while waiting for the transaction result in MS compatible format. |
| KD_DB_PG_DATABASE_IDLE_TIMEOUT | No | String | '1m' | The time to wait before marking a connection as idle in MS compatible format. |

#### Migration repository

| Name | Required | Type | Default Value | Description |
|:-----|:--------:|:----:|:--------------|:------------|
| KD_DB_MIGRATION_REPO_PROVIDER | Yes | String | null | Only 'fs'. |

##### File system

| Name | Required | Type | Default Value | Description |
|:-----|:--------:|:----:|:--------------|:------------|
| KD_DB_MIGRATION_REPO_CONFIG_DIRECTORY | Yes | String | null | Path to the folder that contains migration scripts. |
| KD_DB_MIGRATION_REPO_CONFIG_FILE_EXTENSION | Yes | String | null | Extension to be considered as migration script (e.g. .sql). |
