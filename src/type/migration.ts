/**
 * Migration
 */

export interface Migration {

    /**
     * Apply the migration
     */
    apply(): Promise<void>;
}
