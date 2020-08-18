/**
 * Migration config
 */

export type MigrationConfig = {

    /**
     * Name of the schema that contains migration table
     */
    schemaName: string,

    /**
     * Name of the table that contains migrations information
     */
    tableName: string,

    /**
     * Save migration record in the migrations table
     */
    keepTrackOfMigration: boolean,
}
