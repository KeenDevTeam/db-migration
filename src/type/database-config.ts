/**
 * Database config
 */

export type DatabaseConfig = {

    /**
     * Database engine
     */
    engine: 'pg',

    /**
     * Engine-specific configuration
     */
    config: any, // eslint-disable-line @typescript-eslint/no-explicit-any
}
