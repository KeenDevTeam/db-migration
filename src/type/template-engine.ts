/**
 * Template engine
 */

export type TemplateEngine = <T>(template: string, data?: T) => Promise<string>;
