/**
 * Migration repository
 */

import { MigrationScript } from './migration-script';

export interface MigrationRepository {

    /**
     * Load all available migration scripts from the repository
     */
    loadAll(): Promise<Array<MigrationScript>>;

    /**
     * Create a blank migration
     * @param humanFriendlyName A name for the migration (e.g. Add users table)
     */
    create(humanFriendlyName: string): Promise<void>;
}
