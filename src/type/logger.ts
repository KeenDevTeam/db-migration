/**
 * Logger
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LogFunction = (msg: string, ...args: Array<any>) => void;

export interface Logger {

	info: LogFunction,
	debug: LogFunction,
	warning: LogFunction,
	success: LogFunction,
	error: LogFunction,

	loading: LogFunction,
}
