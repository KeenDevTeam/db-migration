/**
 * Migration
 */

export interface Migration {

    /**
     * Apply current migration
     * @param templateEngineData Any parameter you want to pass to the template engine during migration script compilation time
     */
    apply(templateEngineData?: any): Promise<void>;
}
