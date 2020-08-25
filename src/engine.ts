/**
 * Migration engine
 */

import Async from 'async';
import { MissingArgumentError, } from '@speedup/error';

import { DatabaseEngine } from './type/database-engine';
import { MigrationConfig } from './type/migration-config';
import { MigrationRepository } from './type/migration-repository';
import { TemplateEngine } from './type/template-engine';

export class MigrationEngine {

	protected readonly migrationRepository: MigrationRepository;
	protected readonly templateEngine: TemplateEngine;
	protected readonly databaseEngine: DatabaseEngine;

	constructor(

		migrationRepository: MigrationRepository,
		templateEngine: TemplateEngine,
		databaseEngine: DatabaseEngine,
	) {

		if (!migrationRepository) { throw new MissingArgumentError('migrationRepository'); }
		if (!templateEngine) { throw new MissingArgumentError('templateEngine'); }
		if (!databaseEngine) { throw new MissingArgumentError('databaseEngine'); }

		this.migrationRepository = migrationRepository;
		this.templateEngine = templateEngine;
		this.databaseEngine = databaseEngine;
	}

	/**
	 * Apply migrations
	 * @param migrationConfig Migration configuration
	 */
	async apply(migrationConfig: MigrationConfig): Promise<void> {

		Async.forEachSeries(
			// retrieve all migrations from the repository
			await this.migrationRepository.loadAll(),

			// 1) iterate over all migration script file
			// 2) Render the migration script
			// 3) Apply the migration
			async (migrationScriptFile) =>
				await this.databaseEngine.run(
					// render the migration script
					await this.templateEngine(
						migrationScriptFile.script,
						// this object is available in the transaction template render function
						{
							migration: { ...migrationConfig },
						},
					),
					migrationConfig,
				)
		);
	}
}
