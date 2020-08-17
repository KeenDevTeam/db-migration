
-- extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp"

-- migrations table

CREATE TABLE IF NOT EXISTS <%- migration.tableName %>
(
	record_id uuid default uuid_generate_v4() not null
		constraint <%- migration.tableName %>_pk
			primary key,
	identifier char(127) not null,
	timestamp timestamp default now()
);

COMMENT ON TABLE <%- migration.tableName %> IS 'Applied migrations';

COMMENT ON COLUMN <%- migration.tableName %>.identifier IS 'A unique identifier for the migration';
COMMENT ON COLUMN <%- migration.tableName %>.timestamp IS 'Time that migration has taken place';

CREATE UNIQUE INDEX IF NOT EXISTS <%- migration.tableName %>_identifier_uindex on <%- migration.tableName %> (identifier);
