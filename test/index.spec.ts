/**
 * Module entry point tests
 */

import 'mocha';

import { expect, } from 'chai';

import * as mdl from '../src';

describe('[KeenDev][DB Migration][Module]', () => {

	it('Testing module structure', () => {

		expect(Object.keys(mdl)).to.have.lengthOf(4);

		expect(mdl).to.have.property('migration').that.is.an('object');
		expect(mdl).to.have.property('repository').that.is.an('object');
		expect(mdl).to.have.property('template').that.is.an('object');
		expect(mdl).to.have.property('util').that.is.an('object');
	});
});
