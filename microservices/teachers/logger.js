const { createLogger, format, transports } = require('winston');

const logger = createLogger({
	level: 'info',
	exitOnError: false,
	format: format.combine(format.timestamp(), format.json()),
	transports: [
		new transports.File({ level: 'info', filename: './logs/infos.log' }),
		new transports.Console(),
	],
});
const errorLogger = createLogger({
	level: 'error',
	exitOnError: false,
	format: format.combine(format.timestamp(), format.json()),
	transports: [
		new transports.File({ level: 'error', filename: './logs/erros.log' }),
		new transports.Console(),
	],
});

module.exports = { logger, errorLogger };
