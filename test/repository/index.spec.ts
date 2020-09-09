/**
 * Repository
 */

import 'mocha';

import { expect, } from 'chai';

import * as mdl from '../../src/repository';

describe('[KeenDev][DB Migration][Repository]', () => {

	it('Testing module structure', () => {

		expect(Object.keys(mdl)).to.have.lengthOf(1);

		expect(mdl).to.have.property('fileSystem').that.is.an('object');
	});
});
