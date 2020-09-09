# KeenDev / Database migration

Keep your database structure synchronized across different environments using native language on your database of choice.

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]

## Installation

```sh

# NPM
npm i @keendev/db-migration --save

# Yarn
yarn install @keendev/db-migration

```

## Usage

### Javascript

```js

const { resolve as resolvePath, join as joinPath } = require('fs');
const dbMigration = require('@keendev/db-migration');

// Postgres

// 1) Prepare a repository
const repository = dbMigration.repository.fileSystem.create({
    migrationsDirectory: resolvePath(joinPath(__dirname, 'migrations')),
    fileExtension: '.sql',
});

// 2) Create the template engine of your choice
const templateEngine = dbMigration.template.create();

// 3) Prepare migration configuration
const migrationConfig = {
    schemaName: 'migration',
    tableName: 'history',
    keepTrackOfMigration: true,
};

// 4) Prepare the database connection
const connectionPool = {
    connectionString: process.env.DATABASE_CONNECTION_URI,
};

// 5) Instantiate the database driver of your choice
const migrationEngine = dbMigration.migration.postgres.create(
    repository,
    templateEngine,
    migrationConfig,
    connectionPoolConfig,
);

// 6) Synchronize your database
migrationEngine
    .apply()
    .then(() => console.info('Database is migrated to the latest version'))
    .catch(err => console.error('Failed to migrate the database', err));

```

### TypeScript

```ts

import { resolve as resolvePath, join as joinPath } from 'fs';
import * as dbMigration from '@keendev/db-migration';

// Postgres

// 1) Prepare a repository
const repository = dbMigration.repository.fileSystem.create({
    migrationsDirectory: resolvePath(joinPath(__dirname, 'migrations')),
    fileExtension: '.sql',
});

// 2) Create the template engine of your choice
const templateEngine = dbMigration.template.create();

// 3) Prepare migration configuration
const migrationConfig: MigrationConfig = {
    schemaName: 'migration',
    tableName: 'history',
    keepTrackOfMigration: true,
};

// 4) Prepare the database connection
const connectionPool: Pool = {
    connectionString: process.env.DATABASE_CONNECTION_URI,
};

// 5) Instantiate the database driver of your choice
const migrationEngine = dbMigration.migration.postgres.create(
    repository,
    templateEngine,
    migrationConfig,
    connectionPoolConfig,
);

// 6) Synchronize your database
migrationEngine
    .apply()
    .then(() => console.info('Database is migrated to the latest version'))
    .catch(err => console.error('Failed to migrate the database', err));

```

And you're good to go!

## License

MIT

[npm-image]: https://img.shields.io/npm/v/@keendev/db-migration.svg?color=orange
[npm-url]: https://npmjs.org/package/@keendev/db-migration
[downloads-image]: https://img.shields.io/npm/dt/@keendev/db-migration.svg
[downloads-url]: https://npmjs.org/package/@keendev/db-migration
