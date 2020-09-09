/**
 * Migration
 */

import 'mocha';

import { expect, } from 'chai';

import * as mdl from '../../src/migration';

describe('[KeenDev][DB Migration][Migration]', () => {

	it('Testing module structure', () => {

		expect(Object.keys(mdl)).to.have.lengthOf(1);

		expect(mdl).to.have.property('postgres').that.is.an('object');
	});
});
