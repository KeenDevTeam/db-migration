/**
 * Command-line interface (CLI)
 */

import { program as cli } from 'commander';

import * as figlet from 'figlet';
import chalk from 'chalk';
import clear from 'clear';

import * as migrationEngine from '../engine';

/* CLI application */

clear();
console.info(chalk.yellow(figlet.textSync('Keen Dev', 'Banner4')));
console.info();
console.info(chalk.green(figlet.textSync('DB MIGRATION', 'Banner4')));
console.info();

cli
	.name('db-migrate')
	.passCommandToAction(false);

cli
	.command('add <name>')
	.description('Add a new migration in the migration repository')
	.action(async (name: string) => await migrationEngine.addMigration(name));

cli
	.command('start')
	.description('Apply all the available migrations on the database.')
	.action(async () => await migrationEngine.startMigration());

cli.parse(process.argv);
