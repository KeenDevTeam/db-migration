/**
 * Migration engine
 */

import { join as joinPath, resolve as resolvePath, } from 'path';

import { get as env } from 'env-var';
import { ApplicationError } from '@speedup/error';
import ms from 'ms';

import * as loggerFactory from './provider/log';
import * as migrationRepositoryFactory from './provider/repository';
import * as migrationProviderFactory from './provider/migration';
import * as templateEngineFactory from './provider/template';

import { DatabaseEngine } from './type/database-engine';
import { Logger } from './type/logger';
import { Migration } from './type/migration';
import { MigrationConfig } from './type/migration-config';
import { MigrationRepository, MigrationRepositoryType } from './type/migration-repository';
import { TemplateEngine } from './type/template-engine';


/* Private methods */

const getLogger = async (): Promise<Logger> => new loggerFactory.console.ConsoleLogger();

const getTemplateEngine = async (): Promise<TemplateEngine> => await templateEngineFactory.EJS.create();

const getMigrationConfig = async (): Promise<MigrationConfig> => ({
	schemaName: env('KD_DB_MIGRATION_SCHEMA_NAME').default('public').asString(),
	tableName: env('KD_DB_MIGRATION_TABLE_NAME').required().asString(),
	keepTrackOfMigration: env('KD_DB_MIGRATION_KEEP_MIGRATIONS_TRACK').default('true').asBool(),
});

const getInitialMigrationRepository = async (): Promise<MigrationRepository> => {

	const databaseEngine: DatabaseEngine = env('KD_DB_MIGRATION_DB_ENGINE').default('pg').asEnum<DatabaseEngine>(['pg']);
	const databaseSpecificScriptDir = databaseEngine + '';

	return await migrationRepositoryFactory.fileSystem.create({
		migrationsDirectory: resolvePath(
			joinPath(
				__dirname,
				'..',
				'resources',
				'sql',
				databaseSpecificScriptDir,
			)
		),
		fileExtension: '.sql',
	});
};

const getApplicationMigrationRepository = async (): Promise<MigrationRepository> => {

	const migrationRepoProvider: MigrationRepositoryType = env('KD_DB_MIGRATION_REPO_PROVIDER').default('fs').asEnum<MigrationRepositoryType>(['fs']);

	switch (migrationRepoProvider) {

		// FileSystem
		case 'fs': {
			return await migrationRepositoryFactory.fileSystem.create({
				migrationsDirectory: resolvePath(
					env('KD_DB_MIGRATION_REPO_CONFIG_DIRECTORY').required().asString(),
				),
				fileExtension: env('KD_DB_MIGRATION_REPO_CONFIG_FILE_EXTENSION').default('.sql').asString(),
			});
		}

		// Unsupported
		default: {
			throw new ApplicationError({
				code: 'E_INVALID_PROVIDER',
				message: `Provider ${migrationRepoProvider} is not supported.`
			});
		}
	}
};

const getMigrationProvider = async (

	migrationRepository: MigrationRepository,
	templateEngine: TemplateEngine,

	migrationConfig: MigrationConfig,

	logger: Logger,

): Promise<Migration> => {

	const databaseEngine: DatabaseEngine = env('KD_DB_MIGRATION_DB_ENGINE').default('pg').asEnum<DatabaseEngine>(['pg']);

	switch (databaseEngine) {

		// FileSystem
		case 'pg': {
			return await migrationProviderFactory.postgres.create(
				migrationRepository,
				templateEngine,
				migrationConfig,
				{
					application_name: 'KeenDev|DB-MIGRATION',
					connectionString: env('KD_DB_PG_DATABASE_URI').required().asUrlString(),
					parseInputDatesAsUTC: true,
					keepAlive: true,

					connectionTimeoutMillis: ms(env('KD_DB_PG_DATABASE_CONNECT_TIMEOUT').default('10s').asString()),
					query_timeout: ms(env('KD_DB_PG_DATABASE_QUERY_TIMEOUT').default('5s').asString()),

					min: env('KD_DB_PG_DATABASE_POOL_SIZE_MIN').default('10').asIntPositive(),
					max: env('KD_DB_PG_DATABASE_POOL_SIZE_MAX').default('50').asIntPositive(),

					idle_in_transaction_session_timeout: ms(env('KD_DB_PG_DATABASE_IDLE_IN_TRANSACTION_TIMEOUT').default('10s').asString()),
					idleTimeoutMillis: ms(env('KD_DB_PG_DATABASE_IDLE_TIMEOUT').default('1m').asString()),
				},
				logger
			);
		}

		// Unsupported
		default: {
			throw new ApplicationError({
				code: 'E_INVALID_PROVIDER',
				message: `Database '${databaseEngine}' is not supported.`
			});
		}
	}
};

const getInitialMigrationProvider = async (): Promise<Migration> =>
	await getMigrationProvider(
		await getInitialMigrationRepository(),
		await getTemplateEngine(),
		await getMigrationConfig(),
		await getLogger(),
	);

const getApplicationMigrationProvider = async (): Promise<Migration> =>
	await getMigrationProvider(
		await getApplicationMigrationRepository(),
		await getTemplateEngine(),
		await getMigrationConfig(),
		await getLogger(),
	);

/* Public methods */

export const addMigration = async (name: string, content: string,): Promise<void> => {

	const migrationRepository = await getApplicationMigrationRepository();
	await migrationRepository.create(name, content,);
};

export const startMigration = async (): Promise<void> => {

	// Apply application-level migration(s) (including database preparation)
	const initialMigrationProvider = await getInitialMigrationProvider();
	await initialMigrationProvider.apply();

	// Apply user-level migration(s)
	const applicationMigrationProvider = await getApplicationMigrationProvider();
	await applicationMigrationProvider.apply();
};
