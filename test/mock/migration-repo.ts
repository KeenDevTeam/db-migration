/**
 * Mock migration repo
 */

import { MigrationRepository } from '../../src/type/migration-repository';
import { MigrationScript } from '../../src/type/migration-script';

export const create = (): MigrationRepository => ({
	/**
	 * Load all available migration scripts from the repository
	 */
	loadAll: async (): Promise<Array<MigrationScript>> => ([
		{
			id: 'mig-1',
			script: 'SELECT 1',
		},
		{
			id: 'mig-2',
			script: 'SELECT 2',
		},
		{
			id: 'mig-3',
			script: 'SELECT 3',
		}
	]),

	/**
	 * Create a blank migration
	 * @param humanFriendlyName A name for the migration (e.g. Add users table)
	 * @param content Migration script content
	 */
	create: async (humanFriendlyName: string, content: string): Promise<void> => { } // eslint-disable-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
});

export const createWithInvalidSQLSyntaxAtFirstIndex = (): MigrationRepository => ({
	/**
	 * Load all available migration scripts from the repository
	 */
	loadAll: async (): Promise<Array<MigrationScript>> => ([
		{
			id: 'mig-1',
			script: 'SELECT * from invalid.obj',
		},
		{
			id: 'mig-2',
			script: 'SELECT 2',
		},
		{
			id: 'mig-3',
			script: 'SELECT 3',
		},
	]),

	/**
	 * Create a blank migration
	 * @param humanFriendlyName A name for the migration (e.g. Add users table)
	 * @param content Migration script content
	 */
	create: async (humanFriendlyName: string, content: string): Promise<void> => { } // eslint-disable-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
});

export const createWithInvalidSQLSyntaxAtLastIndex = (): MigrationRepository => ({
	/**
	 * Load all available migration scripts from the repository
	 */
	loadAll: async (): Promise<Array<MigrationScript>> => ([
		{
			id: 'mig-1',
			script: 'SELECT 1',
		},
		{
			id: 'mig-2',
			script: 'SELECT 2',
		},
		{
			id: 'mig-3',
			script: 'SELECT * from invalid.obj',
		},
	]),

	/**
	 * Create a blank migration
	 * @param humanFriendlyName A name for the migration (e.g. Add users table)
	 * @param content Migration script content
	 */
	create: async (humanFriendlyName: string, content: string): Promise<void> => { } // eslint-disable-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
});
