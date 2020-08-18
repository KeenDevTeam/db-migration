/**
 * Postgres Migration
 */

import { Pool as PostgresConnectionPool } from 'pg';
import { MissingArgumentError, } from '@speedup/error';
import ora from 'ora';

import { Migration } from '../type/migration';
import { MigrationConfig } from '../type/migration-config';

export class PostgresMigration implements Migration {

	/**
	 * Database connection pool
	 */
	private readonly connectionPool: PostgresConnectionPool;

	/**
	 * Migration configuration
	 */
	private readonly migrationConfig: MigrationConfig;

	/**
	 * A Unique identifier as migration ID
	 */
	private readonly migrationId: string;

	/**
	 * Migration script (SQL)
	 */
	private readonly migrationScript: string;

	/**
	 * CLI spinner
	 */
	private readonly spinner: ora.Ora;

	/**
	 * Default constructor
	 * @param connectionPool Database connection pool
	 * @param migrationConfig Migration configuration
	 * @param migrationId Migration ID
	 * @param migrationScript Migration script in any supported language
	 */
	constructor(
		connectionPool: PostgresConnectionPool,

		migrationConfig: MigrationConfig,
		migrationId: string,
		migrationScript: string,
	) {
		if (!connectionPool) { throw new MissingArgumentError('connectionPool'); }

		if (!migrationConfig) { throw new MissingArgumentError('migrationConfig'); }
		if (!migrationId) { throw new MissingArgumentError('migrationId'); }
		if (!migrationScript) { throw new MissingArgumentError('migrationScript'); }

		this.connectionPool = connectionPool;

		this.migrationConfig = migrationConfig;
		this.migrationId = migrationId;
		this.migrationScript = migrationScript;

		// instantiate the spinner
		this.spinner = ora();
	}

	/**
	 * Apply current migration
	 */
	async apply(): Promise<void> {

		console.log('+-+-+-+-+-+-+-+-+-+-+');
		this.spinner.info(`Applying migration ${this.migrationId}...`);

		let migrationApplied = false;

		this.spinner.start('Connecting to the database...');
		const client = await this.connectionPool.connect();
		this.spinner.succeed('Connected to the database.');

		try {

			this.spinner.start('Checking migration status...');

			// migration tracking is requested?
			if (this.migrationConfig.keepTrackOfMigration) {

				const result = await client.query(
					`SELECT Count(id) FROM "${this.migrationConfig.schemaName}"."${this.migrationConfig.tableName}" WHERE migration_id=$1`,
					[this.migrationId]
				);

				migrationApplied = parseInt(result.rows[0].count) === 1;
				this.spinner.info(`Migration applied: ${migrationApplied ? 'Yes' : 'No'}`);
			}
			else {

				this.spinner.warn('Skip keeping track of migration.');
			}

			// make sure that the migration is not applied yet
			if (!migrationApplied) {

				this.spinner.info('Running migration script...');

				await client.query('BEGIN');
				await client.query(this.migrationScript);

				// migration tracking is requested
				if (this.migrationConfig.keepTrackOfMigration) {

					this.spinner.start('Keeping track of the migration...');

					await client.query(
						`INSERT INTO "${this.migrationConfig.schemaName}"."${this.migrationConfig.tableName}" (identifier) VALUES ($1)`,
						[this.migrationId]
					);
				}

				this.spinner.start('Committing the changes...');
				await client.query('COMMIT');
				this.spinner.succeed('Changes are committed.');
			}
			else {

				this.spinner.succeed('Skipped (Already applied).');
			}
		}
		catch (err) {

			this.spinner.fail(`Error in applying the migration. ${err.message}`);

			this.spinner.start('Rolling back the transaction...');
			await client.query('ROLLBACK');
			this.spinner.succeed('Transaction is rolled back.');
			throw err;
		}
		finally {

			// release the connection
			this.spinner.start('Releasing the connection...');
			client.release();
			this.spinner.succeed('Connection is released.');

			console.log('+-+-+-+-+-+-+-+-+-+-+');
			console.log();
		}
	}
}
