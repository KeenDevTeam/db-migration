/**
 * Migration
 */

export interface Migration {

    /**
     * Apply current migration
     */
    apply(): Promise<void>;
}
