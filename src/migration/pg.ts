/**
 * Postgres migration provider
 */

import { resolve as resolvePath, join as joinPath, } from 'path';

import Async from 'async';
import { Pool as PostgresConnectionPool, PoolConfig } from 'pg';
import { MissingArgumentError } from '@speedup/error';

import { Migration } from '../type/migration';
import { MigrationConfig } from '../type/migration-config';
import { MigrationRepository } from '../type/migration-repository';
import { TemplateEngine } from '../type/template-engine';

import { create as createFileSystemRepo } from '../repository/file-system';

export class PostgresMigration implements Migration {

	protected readonly migrationRepository: MigrationRepository;
	protected readonly templateEngine: TemplateEngine;
	protected readonly migrationConfig: MigrationConfig;
	protected readonly connectionPool: PostgresConnectionPool;

	constructor(

		// where to search for migrations
		migrationRepository?: MigrationRepository,

		// How to render the migration templates (if it's required)
		templateEngine?: TemplateEngine,

		// Migration parameters
		migrationConfig?: MigrationConfig,

		// Database connection settings
		connectionPool?: PostgresConnectionPool,
	) {

		if (!migrationRepository) { throw new MissingArgumentError('migrationRepository'); }
		if (!templateEngine) { throw new MissingArgumentError('templateEngine'); }
		if (!migrationConfig) { throw new MissingArgumentError('migrationConfig'); }
		if (!connectionPool) { throw new MissingArgumentError('connectionPool'); }

		this.migrationRepository = migrationRepository;
		this.templateEngine = templateEngine;
		this.migrationConfig = migrationConfig;
		this.connectionPool = connectionPool;
	}

	/**
	 * Prepare database for migration
	 */
	private async prepareDatabase(): Promise<void> {

		// Hint: Please note that these migrations are not logged in the migrations table

		const initialMigrationRepo = await createFileSystemRepo({
			migrationsDirectory: resolvePath(
				joinPath(
					__dirname,
					'script',
					'pg',
				)
			),
			fileExtension: '.sql',
		});

		await Async.forEachSeries(
			// load all initial migrations
			await initialMigrationRepo.loadAll(),

			// apply all the migration one by one
			async (migration) => {

				const client = await this.connectionPool.connect();

				try {

					const migrationScript = await this.templateEngine(
						migration.script,
						{
							migration: { ...this.migrationConfig },
						}
					);

					await client.query('BEGIN');
					await client.query(migrationScript);
					await client.query('COMMIT');
				}
				catch (err) {
					await client.query('ROLLBACK');
					throw err;
				}
				finally {
					client.release();
				}
			}
		);
	}

	/**
	 * Apply migrations on the specified PostgreSQL database
	 */
	public async apply(): Promise<void> {

		// prepare database for migration
		await this.prepareDatabase();

		await Async.forEachSeries(

			// load all migrations from repository
			await this.migrationRepository.loadAll(),

			// apply one by one
			async (migration) => {

				let migrationApplied = false;
				const client = await this.connectionPool.connect();

				try {

					// migration tracking is requested?
					if (this.migrationConfig.keepTrackOfMigration) {

						const result = await client.query(
							`SELECT Count(record_id) FROM "${this.migrationConfig.schemaName}"."${this.migrationConfig.tableName}" WHERE identifier=$1`,
							[migration.id]
						);

						migrationApplied = parseInt(result.rows[0].count) === 1;
					}

					// make sure that the migration is not applied yet
					if (!migrationApplied) {

						const migrationScript = await this.templateEngine(
							migration.script,
							{
								migration: { ...this.migrationConfig },
							}
						);

						await client.query('BEGIN');
						await client.query(migrationScript);

						// migration tracking is requested
						if (this.migrationConfig.keepTrackOfMigration) {

							await client.query(
								`INSERT INTO "${this.migrationConfig.schemaName}"."${this.migrationConfig.tableName}" (identifier) VALUES ($1)`,
								[migration.id]
							);
						}

						await client.query('COMMIT');
					}
				}
				catch (err) {
					await client.query('ROLLBACK');
					throw err;
				}
				finally {
					client.release();
				}
			}
		);
	}
}

/**
 * Create a new instance of Postgres database migration engine
 * @param migrationRepository Where to load migrations from
 * @param templateEngine How to render migrations
 * @param migrationConfig Migration configuration
 * @param connectionPoolConfig How to connect to the database
 */
export const create = async (

	// where to search for migrations
	migrationRepository: MigrationRepository,

	// How to render the migration templates (if it's required)
	templateEngine: TemplateEngine,

	// Migration parameters
	migrationConfig: MigrationConfig,

	// Database connection settings
	connectionPoolConfig: PoolConfig,

): Promise<Migration> => {

	const connectionPool = new PostgresConnectionPool(connectionPoolConfig);

	// try making a new connection to the database server
	const dummyConnection = await connectionPool.connect();
	dummyConnection.release();

	return new PostgresMigration(
		migrationRepository,
		templateEngine,
		migrationConfig,
		connectionPool,
	);
};
