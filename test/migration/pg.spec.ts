/**
 * Migration / Postgres
 */

import { resolve as resolvePath, join as joinPath, } from 'path';

import 'mocha';

import chai, { expect, } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { MissingArgumentError, } from '@speedup/error';
import { Pool as PostgresConnectionPool } from 'pg';
import { config as loadEnv } from 'dotenv';

import * as mdl from '../../src/migration/pg';
import * as TemplateEngine from '../../src/template/ejs';

import * as mockMigrationRepo from '../mock/migration-repo';
import { MigrationConfig } from '../../src/type/migration-config';

chai.use(chaiAsPromised);

// load pg.spec.env
loadEnv({
	path: resolvePath(
		joinPath(
			__dirname,
			'pg.spec.env',
		)
	)
});

describe('[KeenDev][DB Migration][Migration][Postgres]', () => {

	it('Testing module structure', () => {

		expect(mdl).to.be.an('object');

		expect(mdl).to.have.property('create').that.is.a('function');
		expect(mdl).to.have.property('PostgresMigration').that.is.a('function');
	});

	describe('PostgresMigration', () => {

		describe('constructor', () => {

			it('should fail due to missing argument \'migrationRepository\'', () => {
				expect(() => new mdl.PostgresMigration()).throw(MissingArgumentError);
			});

			it('should fail due to missing argument \'templateEngine\'', () => {
				expect(() => new mdl.PostgresMigration(
					mockMigrationRepo.create(),
				)).throw(MissingArgumentError);
			});

			it('should fail due to missing argument \'migrationConfig\'', async () => {

				const templateEngine = await TemplateEngine.create();

				expect(() => new mdl.PostgresMigration(
					mockMigrationRepo.create(),
					templateEngine,
				)).throw(MissingArgumentError);
			});

			it('should fail due to missing argument \'connectionPool\'', async () => {

				const templateEngine = await TemplateEngine.create();

				expect(() => new mdl.PostgresMigration(
					mockMigrationRepo.create(),
					templateEngine,
					{
						schemaName: 'xyz',
						tableName: '_migrations',
						keepTrackOfMigration: true,
					},
				)).throw(MissingArgumentError);
			});

			it('should create a new instance of the module', async () => {

				const templateEngine = await TemplateEngine.create();
				const connectionPool = new PostgresConnectionPool();

				const instance = new mdl.PostgresMigration(
					mockMigrationRepo.create(),
					templateEngine,
					{
						schemaName: 'xyz',
						tableName: '_migrations',
						keepTrackOfMigration: true,
					},
					connectionPool,
				);
				expect(instance).to.be.instanceOf(mdl.PostgresMigration);
			});
		});

		describe('apply', () => {

			const TEST_DATABASE_NAME = process.env.TEST_DATABASE_NAME + '';

			const migrationConfig: MigrationConfig = {
				schemaName: process.env.TEST_DATABASE_SCHEMA_NAME + '',
				tableName: process.env.TEST_DATABASE_TABLE_NAME + '',
				keepTrackOfMigration: true,
			};
			let connectionPool: PostgresConnectionPool;

			beforeEach(async () => {

				// create database
				await new PostgresConnectionPool({
					connectionString: process.env.TEST_DATABASE_URI,
					connectionTimeoutMillis: 5 * 1000,

					idleTimeoutMillis: 5 * 1000,
					query_timeout: 5 * 1000,
				}).query(`CREATE DATABASE ${TEST_DATABASE_NAME}`);

				// connect to the newly created database
				connectionPool = new PostgresConnectionPool({
					connectionString: `${process.env.TEST_DATABASE_URI}/${TEST_DATABASE_NAME}`,
					connectionTimeoutMillis: 5 * 1000,

					idleTimeoutMillis: 5 * 1000,
					query_timeout: 5 * 1000,
				});

				await connectionPool.query('SELECT 1');
			});

			afterEach(async () => {

				await connectionPool.end();

				// create database
				await new PostgresConnectionPool({
					connectionString: process.env.TEST_DATABASE_URI,
					connectionTimeoutMillis: 5 * 1000,

					idleTimeoutMillis: 5 * 1000,
					query_timeout: 5 * 1000,
				}).query(`DROP DATABASE ${TEST_DATABASE_NAME}`);
			});

			it('should apply all the migrations', async () => {

				const templateEngine = await TemplateEngine.create();

				const instance = new mdl.PostgresMigration(
					mockMigrationRepo.create(),
					templateEngine,
					migrationConfig,
					connectionPool,
				);

				await instance.apply();

				const records = await connectionPool.query(`SELECT * FROM "${migrationConfig.schemaName}"."${migrationConfig.tableName}";`);

				expect(records.rows).to.be.an('array');
				expect(records.rowCount).to.be.eq(3);
				expect(records.rows).to.have.lengthOf(records.rowCount);

				records.rows.forEach(row => {

					expect(row).to.be.an('object');
					expect(row).to.have.property('record_id').that.is.a('string');
					expect(row).to.have.property('identifier').that.is.a('string');
					expect(row).to.have.property('timestamp').that.is.a('date');
				});
			});

			it('should apply no migration', async () => {

				const templateEngine = await TemplateEngine.create();

				const instance = new mdl.PostgresMigration(
					mockMigrationRepo.createWithInvalidSQLSyntaxAtFirstIndex(),
					templateEngine,
					migrationConfig,
					connectionPool,
				);

				try {
					await instance.apply();
				}
				catch (err) {
					// 
				}

				const records = await connectionPool.query(`SELECT * FROM "${migrationConfig.schemaName}"."${migrationConfig.tableName}";`);

				expect(records.rows).to.be.an('array');
				expect(records.rowCount).to.be.eq(0);
				expect(records.rows).to.have.lengthOf(records.rowCount);
			});

			it('should apply all the migrations except the last one', async () => {

				const templateEngine = await TemplateEngine.create();

				const instance = new mdl.PostgresMigration(
					mockMigrationRepo.createWithInvalidSQLSyntaxAtLastIndex(),
					templateEngine,
					migrationConfig,
					connectionPool,
				);

				try {
					await instance.apply();
				}
				catch (err) {
					// check error here
				}

				const records = await connectionPool.query(`SELECT * FROM "${migrationConfig.schemaName}"."${migrationConfig.tableName}";`);

				expect(records.rows).to.be.an('array');
				expect(records.rowCount).to.be.eq(2);
				expect(records.rows).to.have.lengthOf(records.rowCount);

				records.rows.forEach(row => {

					expect(row).to.be.an('object');
					expect(row).to.have.property('record_id').that.is.a('string');
					expect(row).to.have.property('identifier').that.is.a('string');
					expect(row).to.have.property('timestamp').that.is.a('date');
				});
			});
		});
	});
});
