'use strict';

const Sequelize = require('sequelize');
const assert = require('assert');
const SequelizeTransport = require('./SequelizeTransport');

const getIntValueOrDefault = (value, defaultValue = 0) => {
  if (!value) {
    return defaultValue;
  }
  const int = parseInt(value);
  return isNaN(int) ? defaultValue : int;
};

const getWinstonSequelizeTransport = (config) => {

  if (!config.loggerSettings.auditDb || !config.loggerSettings.auditDb.username) {
    return null;
  }

  const databaseName = config.loggerSettings.auditDb.name || 'postgres';
  const encryptDb = config.loggerSettings.auditDb.encrypt || true;

  assert(config.loggerSettings.auditDb.username, 'Audit Database property username must be supplied');
  assert(config.loggerSettings.auditDb.password, 'Audit Database property password must be supplied');
  assert(config.loggerSettings.auditDb.host, 'Audit Database property host must be supplied');
  assert(config.loggerSettings.auditDb.dialect, 'Audit Database property dialect must be supplied, this must be postgres or mssql');


  const options = {
    database: {
      name: databaseName,
      username: config.loggerSettings.auditDb.username,
      password: config.loggerSettings.auditDb.password,
      host: config.loggerSettings.auditDb.host,
      dialect: config.loggerSettings.auditDb.dialect,
      encrypt: encryptDb,
      schema: config.loggerSettings.auditDb.schema,
    },
    tableName: 'audit_logs',
    fields: { meta: Sequelize.JSONB },
    modelOptions: { timestamps: true, underscored: true },
    level: 'audit',
    application: config.loggerSettings.applicationName,
    environment: config.hostingEnvironment.env,
  };

  if (config.loggerSettings.auditDb.pool) {
    options.database.pool = {
      max: getIntValueOrDefault(config.loggerSettings.auditDb.pool.max, 5),
      min: getIntValueOrDefault(config.loggerSettings.auditDb.pool.min, 0),
      acquire: getIntValueOrDefault(config.loggerSettings.auditDb.pool.acquire, 10000),
      idle: getIntValueOrDefault(config.loggerSettings.auditDb.pool.idle, 10000),
    };
  }

  return new SequelizeTransport(options);
};

module.exports = getWinstonSequelizeTransport;
