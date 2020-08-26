/**
 * Console log provider using ora
 */

import ora from 'ora';

import { Logger } from '../../type/logger';

export class ConsoleLogger implements Logger {

	private readonly logger: ora.Ora = ora();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	info(msg: string, ...args: Array<any>): void {
		this.logger.info(msg);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	debug(msg: string, ...args: Array<any>): void {
		throw new Error('NotImplemented');
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	warning(msg: string, ...args: Array<any>): void {
		this.logger.warn(msg);
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	success(msg: string, ...args: Array<any>): void {
		this.logger.succeed(msg);
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	error(msg: string, ...args: Array<any>): void {
		this.logger.fail(msg);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	loading(msg: string, ...args: Array<any>): void {
		this.logger.start(msg);
	}
}
