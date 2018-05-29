const winston = require('winston');
const WinstonSequelizeTransport = require('./../src');

let password = null;
for (let i = 0; i < process.argv.length; i++) {
  if ((process.argv[i] === '-p' || process.argv[i] === '--password') && i < process.argv.length - 1) {
    password = process.argv[i + 1];
  }
}

const consoleTransport = new (winston.transports.Console)({ level: 'Debug', colorize: true });
const sequelizeTransport = WinstonSequelizeTransport({
  hostingEnvironment: {
    env: 'dev',
  },
  loggerSettings: {
    auditDb: {
      name: 'DFE_SIGNIN_AUDIT',
      host: 'localhost',
      username: 'sa',
      password,
      dialect: 'mssql',
      encrypt: false,
    },
    applicationName: 'audit-harness',
  },
});

const loggerConfig = {
  levels: {
    audit: 0,
    error: 1,
    warn: 2,
    info: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  },
  colors: {
    info: 'yellow',
    ok: 'green',
    error: 'red',
    audit: 'magenta',
  },
  transports: [consoleTransport, sequelizeTransport],
};
const logger = new (winston.Logger)(loggerConfig);

logger.audit('here in harness again', {
  type: 'test',
  subType: 'harness',
  userId: '60d4e302-ca10-4f66-a22b-ff5527617d6c',
  serialNumber: '112345671',
});


logger.audit('here in harness', {
  type: 'test',
  subType: 'harness',
  userId: '60d4e302-ca10-4f66-a22b-ff5527617d6c',
  serialNumber: '112345671',
  organisationId: '10d4e302-ca10-4f66-a22b-ff5527617d6e',
});

logger.audit('here in harness again', {
  type: 'test',
  subType: 'harness',
  userId: '60d4e302-ca10-4f66-a22b-ff5527617d6c',
  serialNumber: '112345671',
  organisationId: null,
});



console.log('done');