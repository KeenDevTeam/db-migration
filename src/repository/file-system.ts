/**
 * FileSystem repository
 */

import { readdirSync, readFileSync, } from 'fs';
import { join as joinPath, resolve as resolvePath, } from 'path';

import { MissingArgumentError } from '@speedup/error';

import { MigrationRepository } from '../type/migration-repository';
import { MigrationScript } from '../type/migration-script';

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
			.filter(this.extensionValidator)
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
}
