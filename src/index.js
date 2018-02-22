'use strict';

const Sequelize = require('sequelize');
const WinstonTransportSequelize = require('winston-transport-sequelize');
const SequelizeTransport = require('./SequelizeTransport');
const assert = require('assert');

const getWinstonSequelizeTransport = (config) => {

  if(!config.loggerSettings.auditDb || !config.loggerSettings.auditDb.username) {
    return null;
  }

  const databaseName = config.loggerSettings.auditDb.name || 'postgres';
  const encryptDb = config.loggerSettings.auditDb.encrypt || false;

  assert(config.loggerSettings.auditDb.username, 'Audit Database property username must be supplied');
  assert(config.loggerSettings.auditDb.password, 'Audit Database property password must be supplied');
  assert(config.loggerSettings.auditDb.host, 'Audit Database property host must be supplied');
  assert(config.loggerSettings.auditDb.dialect, 'Audit Database property dialect must be supplied, this must be postgres or mssql');

  const db = new Sequelize(databaseName, config.loggerSettings.auditDb.username, config.loggerSettings.auditDb.password, {
    host: config.loggerSettings.auditDb.host,
    dialect: config.loggerSettings.auditDb.dialect,
    dialectOptions: {
      encrypt: encryptDb,
    },
  });
  const options = {
    sequelize: db,
    database: {
      name: databaseName,
      username: config.loggerSettings.auditDb.username,
      password: config.loggerSettings.auditDb.password,
      host: config.loggerSettings.auditDb.host,
      dialect: config.loggerSettings.auditDb.dialect,
      encrypt: encryptDb,
    },
    tableName: 'AuditLogs',
    fields: { meta: Sequelize.JSONB },
    modelOptions: { timestamps: true },
    level: 'audit',
    application: config.loggerSettings.applicationName,
    environment: config.hostingEnvironment.env,
  };

  return new SequelizeTransport(options);
};

module.exports = getWinstonSequelizeTransport;