
-- Schema
CREATE SCHEMA IF NOT EXISTS <%- migration.schemaName %>;

-- extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA <%- migration.schemaName %>;

-- migrations table

CREATE TABLE IF NOT EXISTS <%- migration.schemaName %>.<%- migration.tableName %>
(
	record_id uuid default <%- migration.schemaName %>.uuid_generate_v4() not null
		constraint <%- migration.tableName %>_pk
			primary key,
	identifier char(127) not null,
	timestamp timestamp default now()
);

COMMENT ON TABLE <%- migration.schemaName %>.<%- migration.tableName %> IS 'Applied migrations';

COMMENT ON COLUMN <%- migration.schemaName %>.<%- migration.tableName %>.identifier IS 'A unique identifier for the migration';
COMMENT ON COLUMN <%- migration.schemaName %>.<%- migration.tableName %>.timestamp IS 'Time that migration has taken place';

CREATE UNIQUE INDEX IF NOT EXISTS <%- migration.tableName %>_identifier_uindex on <%- migration.schemaName %>.<%- migration.tableName %> (identifier);
