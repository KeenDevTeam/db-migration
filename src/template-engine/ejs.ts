/**
 * EJS Template engine
 */

import { render as renderTemplate } from 'ejs';
import { TemplateEngine } from '../type/template-engine';

/**
 * Render an EJS template and return the rendered content
 * @param template Template to render (string that contains the template)
 * @param data Data to pass to the render engine
 */
export const render: TemplateEngine = async <T>(template: string, data?: T): Promise<string> =>
	await renderTemplate(
		template,
		data,
		{ async: true, }
	);
