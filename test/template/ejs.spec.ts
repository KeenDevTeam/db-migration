/**
 * Template / EJS
 */

import 'mocha';

import chai, { expect, } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import * as mdl from '../../src/template/ejs';

chai.use(chaiAsPromised);

describe('[KeenDev][DB Migration][Template][EJS]', () => {

	it('Testing module structure', () => {

		expect(mdl).to.be.an('object');

		expect(mdl).to.have.property('create').that.is.a('function');
		expect(mdl).to.have.property('render').that.is.a('function');
	});

	describe('create', () => {

		it('should return an instance of the render function', async () => {

			const render = await mdl.create();
			expect(render).to.be.a('function');
		});
	});

	describe('render', () => {

		it('should render a template and return a filled version of it', async () => {

			const template = 'Hello <%- user.name %>';
			const result = await mdl.render(template, { user: { name: 'Danial' } });

			expect(result).to.be.a('string').that.is.eq('Hello Danial');
		});

		it('should render an empty template and return a empty string', async () => {

			const result = await mdl.render('', { user: { name: 'Danial' } });
			expect(result).to.be.a('string').that.is.eq('');
		});

		it('should throw error if the variable is not defined', async () => {

			const template = 'Hello <%- user.name %>';
			await expect(mdl.render(template)).to.be.rejectedWith('user is not defined');
		});
	});
});
