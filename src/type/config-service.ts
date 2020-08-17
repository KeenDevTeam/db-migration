/**
 * Configuration service
 */

import { DatabaseConfig } from './database-config';
import { MigrationConfig } from './migration-config';

export interface IConfigService {

    /**
     * Database config
     */
    readonly database: DatabaseConfig;

    /**
     * Migration config
     */
    readonly migration: MigrationConfig;
}
