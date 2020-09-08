/**
 * Template / FileSystem
 */

import 'mocha';

import { expect, } from 'chai';

import * as mdl from '../../src/template';

describe('[KeenDev][DB Migration][Template]', () => {

	it('Testing module structure', () => {

		expect(Object.keys(mdl)).to.have.lengthOf(1);

		expect(mdl).to.have.property('ejs').that.is.an('object');
	});
});
