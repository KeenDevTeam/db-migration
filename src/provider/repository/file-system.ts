/**
 * FileSystem repository
 */

import { readdirSync, readFileSync, writeFileSync, } from 'fs';
import { join as joinPath, resolve as resolvePath, } from 'path';

import { MissingArgumentError } from '@speedup/error';
import { paramCase, } from 'change-case';

import { MigrationRepository } from '../../type/migration-repository';
import { MigrationScript } from '../../type/migration-script';
import * as EmptyMigrationTemplate from '../../util/empty-migration-template';

export type FileSystemRepositoryConfig = {

	/**
	 * Directory that contains migration scripts
	 */
	migrationsDirectory: string,

	/**
	 * File extension
	 */
	fileExtension?: string,
};

/**
 * Local file system repository implementation
 */
export class FileSystemRepository implements MigrationRepository {

	/**
	 * Configuration
	 */
	private readonly config: FileSystemRepositoryConfig;

	constructor(config?: FileSystemRepositoryConfig) {

		if (!config) { throw new MissingArgumentError('config'); }

		this.config = config;
	}

	/**
	 * Extension validator
	 * @param fileName File name to validate
	 */
	private extensionValidator(fileName: string): boolean {
		return this.config.fileExtension ? fileName.endsWith(this.config.fileExtension) : true;
	}

	/**
	 * Load all migration scripts from a specific directory on local file system
	 */
	async loadAll(): Promise<Array<MigrationScript>> {

		return readdirSync(this.config.migrationsDirectory, 'utf-8')
			.filter(this.extensionValidator) // exclude all files with invalid extension
			.map(fileName => ({
				id: fileName,
				script: readFileSync(
					resolvePath(
						joinPath(this.config.migrationsDirectory, fileName)
					),
					'utf-8'
				)
			}));
	}

	/**
	 * Create a blank migration
	 * @param humanFriendlyName A name for the migration (e.g. Add users table)
	 */
	async create(humanFriendlyName: string): Promise<void> {

		const fileName = paramCase(humanFriendlyName);

		writeFileSync(
			fileName,
			EmptyMigrationTemplate.render(humanFriendlyName),
			'utf-8'
		);
	}
}

/**
 * Create a file system migration repository
 * @param config File system migration repository configuration
 */
export const create = (config: FileSystemRepositoryConfig): MigrationRepository =>
	new FileSystemRepository(config);
