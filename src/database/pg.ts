/**
 * Postgres Database
 */

import { Pool as PostgresConnectionPool, PoolConfig } from 'pg';

export const create = async (config?: PoolConfig): Promise<PostgresConnectionPool> => {

	const connectionPool = new PostgresConnectionPool(config);

	// try making a new connection to the database server
	const dummyConnection = await connectionPool.connect();
	dummyConnection.release();

	return connectionPool;
};
