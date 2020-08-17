/**
 * Template engine
 */

import { render as renderTemplate } from 'ejs';

/**
 * Render a template and return the rendered content
 * @param template Template to render (string that contains the template)
 * @param data Data to pass to the render engine
 */
export const render = async <T>(template: string, data?: T): Promise<string> =>
    await renderTemplate(
        template,
        data,
        { async: true, }
    );
