const Transport = require('winston-transport');
const Sequelize = require('sequelize');
const assert = require('assert');
const uuid = require('uuid/v4');

const logsSchema = {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false,
  },
  level: Sequelize.STRING,
  message: Sequelize.STRING,
  application: Sequelize.STRING,
  environment: Sequelize.STRING,
  type: Sequelize.STRING,
  subType: { type: Sequelize.STRING, field: 'sub_type' },
  userId: { type: Sequelize.UUID, field: 'user_id' },
  organisationId: { type: Sequelize.UUID, field: 'organisation_id' },
};
const defaultLogsOptions = {
  timestamps: true,
  schema: 'dbo',
  // TODO: Define indexes
};
const metaSchema = {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false,
  },
  key: Sequelize.STRING,
  value: Sequelize.STRING,
};
const defaultMetaOptions = {
  timestamps: false,
  schema: 'dbo',
  // TODO: Define indexes
};
const keysToExcludeFromMeta = ['type', 'subType', 'userId', 'organisationId'];

const writeLog = async (logsModel, metaModel, level, message, meta, application, environment) => {
  const id = uuid();

  const log = await logsModel.create({
    id,
    level,
    message,
    application,
    environment,
    type: meta.type,
    subType: meta.subType,
    userId: meta.userId,
    organisationId: meta.organisationId,
  });


  const metaKeys = Object.keys(meta);
  for (let i = 0; i < metaKeys.length; i += 1) {
    const key = metaKeys[i];

    if (!keysToExcludeFromMeta.find(x => x === key)) {
      const value = meta[key];
      const jsonify = value instanceof Object;
      await metaModel.create({
        id: uuid(),
        auditId: id,
        key,
        value: jsonify ? JSON.stringify(value) : value,
        isJson: jsonify,
      });
    }
  }

  return log.get();
};

class SequelizeTransport extends Transport {
  constructor(opts) {
    super(opts);

    assert(opts.database, 'Audit Database property must be supplied');
    assert(opts.database.name, 'Audit Database property name must be supplied');
    assert(opts.database.username, 'Audit Database property username must be supplied');
    assert(opts.database.password, 'Audit Database property password must be supplied');
    assert(opts.database.host, 'Audit Database property host must be supplied');
    assert(opts.database.dialect, 'Audit Database property dialect must be supplied, this must be postgres or mssql');

    const dbOpts = {
      retry: {
        match: [
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/,
          /TimeoutError/,
        ],
        name: 'query',
        backoffBase: 100,
        backoffExponent: 1.1,
        timeout: 60000,
        max: 5,
      },
      host: opts.database.host,
      dialect: opts.database.dialect,
      dialectOptions: {
        encrypt: opts.database.encrypt || true,
      },
    };
    if (opts.database.pool) {
      dbOpts.pool = opts.database.pool;
    }

    this._db = new Sequelize(opts.database.name, opts.database.username, opts.database.password, dbOpts);

    const logsOptions = { tableName: 'audit_logs', ...defaultLogsOptions };
    if (opts.database.schema) {
      logsOptions.schema = opts.database.schema;
    }
    this._logs = this._db.define('AuditLogs', logsSchema, logsOptions);

    const metaOptions = { tableName: 'audit_log_meta', ...defaultMetaOptions };
    if (opts.database.schema) {
      metaOptions.schema = opts.database.schema;
    }
    this._meta = this._db.define('AuditLogMeta', metaSchema, metaOptions);
    this._meta.belongsTo(this._logs, { as: 'AuditLog', foreignKey: 'auditId' });

    this.opts = opts;
  }

  log(level, message, meta, callback) {
    writeLog(this._logs, this._meta, level, message, meta, this.opts.application, this.opts.environment)
      .then((log) => {
        this.emit('logged');
        callback(null, log);
      })
      .catch((e) => {
        this.emit('error', e);
        callback(e);
      });
  }
}

module.exports = SequelizeTransport;
