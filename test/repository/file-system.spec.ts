/**
 * Repository / FileSystem
 */

import { resolve as resolvePath, join as joinPath, } from 'path';
import { mkdirSync, writeFileSync, rmdirSync } from 'fs';

import 'mocha';

import chai, { expect, } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import * as mdl from '../../src/repository/file-system';
import { MissingArgumentError, } from '@speedup/error';

chai.use(chaiAsPromised);

const REPO_DIR_NAME = 'fs-repo';
const TEST_REPO_PATH = resolvePath(joinPath(__dirname, REPO_DIR_NAME));

describe('[KeenDev][DB Migration][Repository][file-system]', () => {

	it('Testing module structure', () => {

		expect(Object.keys(mdl)).to.have.lengthOf(2);

		expect(mdl).to.have.property('FileSystemRepository').that.is.a('function');
		expect(mdl).to.have.property('create').that.is.a('function');
	});

	describe('FileSystemRepository', () => {

		beforeEach(async () => {

			mkdirSync(TEST_REPO_PATH);

			[...Array<number>(10).keys()]
				.map(i => writeFileSync(joinPath(TEST_REPO_PATH, `${i}.sql`), `${i}`));

			[...Array<number>(10).keys()]
				.map(i => writeFileSync(joinPath(TEST_REPO_PATH, `${i}.ext`), `${i}`));
		});

		afterEach(async () => {

			rmdirSync(TEST_REPO_PATH, { recursive: true });
		});

		describe('constructor', () => {

			it('should fail if no config is passed', () => {

				expect(() => new mdl.FileSystemRepository()).throws(MissingArgumentError);
			});

			it('should create a new instance of the FileSystemRepository without fileExtension parameter', () => {

				const instance = new mdl.FileSystemRepository({
					migrationsDirectory: TEST_REPO_PATH
				});

				expect(instance).to.be.instanceOf(mdl.FileSystemRepository);
			});

			it('should create a new instance of the FileSystemRepository', () => {

				const instance = new mdl.FileSystemRepository({
					migrationsDirectory: TEST_REPO_PATH,
					fileExtension: '.sql',
				});

				expect(instance).to.be.instanceOf(mdl.FileSystemRepository);
			});
		});

		describe('loadAll', () => {

			it('should load all 20 files in the test repo dir (without validating file extension)', async () => {

				const instance = new mdl.FileSystemRepository({
					migrationsDirectory: TEST_REPO_PATH,
				});

				const scripts = await instance.loadAll();

				expect(scripts).to.be.an('array').that.has.lengthOf(20);

				scripts.forEach(script => {

					expect(script).to.have.property('id').that.is.a('string');
					expect(script).to.have.property('script').which.is.a('string');
				});
			});

			it('should load all 10 .SQL files in the test repo dir (with file extension validation)', async () => {

				const instance = new mdl.FileSystemRepository({
					migrationsDirectory: TEST_REPO_PATH,
					fileExtension: '.sql',
				});

				const scripts = await instance.loadAll();

				expect(scripts).to.be.an('array').that.has.lengthOf(10);

				scripts.forEach((script, i) => {

					expect(script).to.have.property('id').that.is.a('string');
					expect(script).to.have.property('script').which.is.a('string').that.is.eq(`${i}`);
				});
			});
		});

		describe('create', () => {

			it('should create a new migration and load it as the last migration script', async () => {

				const instance = new mdl.FileSystemRepository({
					migrationsDirectory: TEST_REPO_PATH,
					fileExtension: '.xyz',
				});

				await instance.create('Test migration', 'test_migration');
				const scripts = await instance.loadAll();

				expect(scripts).to.be.an('array').that.has.lengthOf(1);

				expect(scripts[0]).to.have.property('id').that.is.a('string');
				expect(scripts[0]).to.have.property('script').which.contains('test_migration');
			});
		});
	});

	describe('create', () => {

		it('should fail if no config is passed', async () => {

			await expect(mdl.create()).rejectedWith(MissingArgumentError);
		});

		it('should create a new instance of the FileSystemRepository', async () => {

			// since all the constructor and class parts are test before,
			// it's not necessary to test them again here.

			const instance = await mdl.create({
				migrationsDirectory: __dirname,
				fileExtension: '',
			});

			expect(instance).to.be.instanceOf(mdl.FileSystemRepository);
		});
	});
});
