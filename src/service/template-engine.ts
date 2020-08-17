/**
 * Template engine
 */

import { render as renderTemplate } from 'ejs';

export const render = async <T>(template: string, metadata?: T): Promise<string> =>
    await renderTemplate(
        template,
        metadata,
        { async: true, }
    );
