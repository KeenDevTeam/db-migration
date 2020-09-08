/**
 * FileSystem repository
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, } from 'fs';
import { join as joinPath, resolve as resolvePath, } from 'path';
import { EOL } from 'os';

import { MissingArgumentError } from '@speedup/error';
import { paramCase, } from 'change-case';

import { MigrationRepository } from '../type/migration-repository';
import { MigrationScript } from '../type/migration-script';
import * as EmptyMigrationTemplate from '../util/empty-migration-template';

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

		mkdirSync(this.config.migrationsDirectory, { recursive: true, });
	}

	/**
	 * Extension validator
	 * @param fileName File name to validate
	 */
	private extensionValidator(fileName: string, validExtension?: string): boolean {
		return validExtension ? fileName.endsWith(validExtension) : true;
	}

	/**
	 * Load all migration scripts from a specific directory on local file system
	 */
	async loadAll(): Promise<Array<MigrationScript>> {

		return readdirSync(this.config.migrationsDirectory, 'utf-8')
			.filter((fileName: string) => this.extensionValidator(fileName, this.config.fileExtension)
			) // exclude all files with invalid extension
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
	 * @param content Migration script content
	 */
	async create(humanFriendlyName: string, content: string): Promise<void> {

		const timestamp = new Date().valueOf();
		const fileName = joinPath(
			this.config.migrationsDirectory,
			`${timestamp}_${paramCase(humanFriendlyName)}${this.config.fileExtension}`
		);

		writeFileSync(
			fileName,
			[
				EmptyMigrationTemplate.render(humanFriendlyName),
				content,
			].join(EOL),
			'utf-8'
		);
	}
}

/**
 * Create a file system migration repository
 * @param config File system migration repository configuration
 */
export const create = async (config?: FileSystemRepositoryConfig): Promise<MigrationRepository> =>
	new FileSystemRepository(config);
