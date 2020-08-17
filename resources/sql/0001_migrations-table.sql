
-- extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA <%- db.migrationsSchemaName %>;

-- migrations table

CREATE TABLE IF NOT EXISTS <%- db.migrationsSchemaName %>.<%- db.migrationsTableName %>
(
	id uuid default uuid_generate_v4() not null
		constraint <%- db.migrationsTableName %>_pk
			primary key,
	filename char(127) not null,
	timestamp timestamp default now()
);

COMMENT ON TABLE <%- db.migrationsSchemaName %>.<%- db.migrationsTableName %> IS 'Applied migrations';

COMMENT ON COLUMN <%- db.migrationsSchemaName %>.<%- db.migrationsTableName %>.filename IS 'File name of the migration script';
COMMENT ON COLUMN <%- db.migrationsSchemaName %>.<%- db.migrationsTableName %>.timestamp IS 'Time that migration has taken place';

CREATE UNIQUE INDEX IF NOT EXISTS migrations_filename_uindex
	on <%- db.migrationsSchemaName %>.<%- db.migrationsTableName %> (filename);
