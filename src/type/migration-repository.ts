/**
 * Migration repository
 */

import { MigrationScript } from './migration-script';

export interface MigrationRepository {

    /**
     * Load all available migration scripts from the repository
     */
	loadAll(): Promise<MigrationScript>;
}
