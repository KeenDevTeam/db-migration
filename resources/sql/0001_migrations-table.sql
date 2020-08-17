
-- extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp"

-- migrations table

CREATE TABLE IF NOT EXISTS <%- migration.tableName %>
(
	id uuid default uuid_generate_v4() not null
		constraint <%- migration.tableName %>_pk
			primary key,
	filename char(127) not null,
	timestamp timestamp default now()
);

COMMENT ON TABLE <%- migration.tableName %> IS 'Applied migrations';

COMMENT ON COLUMN <%- migration.tableName %>.filename IS 'File name of the migration script';
COMMENT ON COLUMN <%- migration.tableName %>.timestamp IS 'Time that migration has taken place';

CREATE UNIQUE INDEX IF NOT EXISTS <%- migration.tableName %>_filename_uindex on <%- migration.tableName %> (filename);
