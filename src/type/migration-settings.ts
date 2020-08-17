/**
 * Migration settings
 */

export type MigrationSettings = {

    /**
     * Name of the schema that contains migration table
     */
    schemaName: string,

    /**
     * Name of the table that contains migrations information
     */
    tableName: string,
}
