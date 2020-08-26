/**
 * Postgres migration provider
 */

import Async from 'async';
import { Pool as PostgresConnectionPool, PoolConfig } from 'pg';
import { MissingArgumentError } from '@speedup/error';

import { Logger } from '../../type/logger';
import { Migration } from '../../type/migration';
import { MigrationConfig } from '../../type/old/migration-config';
import { MigrationRepository } from '../../type/migration-repository';
import { TemplateEngine } from '../../type/template-engine';

export class PostgresMigration implements Migration {

	protected readonly migrationRepository: MigrationRepository;
	protected readonly templateEngine: TemplateEngine;
	protected readonly migrationConfig: MigrationConfig;
	protected readonly connectionPool: PostgresConnectionPool;
	protected readonly logger: Logger;

	constructor(

		// where to search for migrations
		migrationRepository?: MigrationRepository,

		// How to render the migration templates (if it's required)
		templateEngine?: TemplateEngine,

		// Migration parameters
		migrationConfig?: MigrationConfig,

		// Database connection settings
		connectionPool?: PostgresConnectionPool,

		// Logger
		logger?: Logger,
	) {

		if (!migrationRepository) { throw new MissingArgumentError('migrationRepository'); }
		if (!templateEngine) { throw new MissingArgumentError('templateEngine'); }
		if (!migrationConfig) { throw new MissingArgumentError('migrationConfig'); }
		if (!connectionPool) { throw new MissingArgumentError('connectionPool'); }
		if (!logger) { throw new MissingArgumentError('logger'); }

		this.migrationRepository = migrationRepository;
		this.templateEngine = templateEngine;
		this.migrationConfig = migrationConfig;
		this.connectionPool = connectionPool;
		this.logger = logger;
	}

	/**
	 * Apply migrations on the specified PostgreSQL database
	 */
	public async apply(): Promise<void> {

		this.logger.loading('Connecting to the database...');
		const client = await this.connectionPool.connect();
		this.logger.success('Connected to the database.');

		await Async.forEachSeries(

			// load all migrations from repository
			await this.migrationRepository.loadAll(),

			// apply one by one
			async (migration) => {

				let migrationApplied = false;

				try {

					this.logger.loading('Checking migration status...');

					// migration tracking is requested?
					if (this.migrationConfig.keepTrackOfMigration) {

						const result = await client.query(
							`SELECT Count(id) FROM "${this.migrationConfig.schemaName}"."${this.migrationConfig.tableName}" WHERE migration_id=$1`,
							[migration.id]
						);

						migrationApplied = parseInt(result.rows[0].count) === 1;
						this.logger.info(`Migration applied: ${migrationApplied ? 'Yes' : 'No'}`);
					}
					else {

						this.logger.warning('Skip keeping track of migration.');
					}

					// make sure that the migration is not applied yet
					if (!migrationApplied) {

						this.logger.loading('Rendering the migration script...');

						const migrationScript = await this.templateEngine(
							migration.script,
							{
								migration: { ...this.migrationConfig },
							}
						);

						this.logger.success('Migration script is rendered.');
						this.logger.loading('Running migration script...');

						await client.query('BEGIN');
						await client.query(migrationScript);

						// migration tracking is requested
						if (this.migrationConfig.keepTrackOfMigration) {

							this.logger.info('Keeping track of the migration...');

							await client.query(
								`INSERT INTO "${this.migrationConfig.schemaName}"."${this.migrationConfig.tableName}" (identifier) VALUES ($1)`,
								[migration.id]
							);
						}

						this.logger.loading('Committing the changes...');
						await client.query('COMMIT');
						this.logger.success('Changes are committed.');
					}
					else {

						this.logger.success('Skipped (Already applied).');
					}
				}
				catch (err) {

					this.logger.error(`Error in applying the migration. ${err.message}`);

					this.logger.loading('Rolling back the transaction...');
					await client.query('ROLLBACK');
					this.logger.success('Transaction is rolled back.');
					throw err;
				}
				finally {

					// release the connection
					this.logger.loading('Releasing the connection...');
					client.release();
					this.logger.success('Connection is released.');
				}
			}
		);

		this.logger.loading('Disconnecting from database...');
		client.release();
		this.logger.success('Database connection is closed.');
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

	// Logger
	logger: Logger,

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
		logger,
	);
};
