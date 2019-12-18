# AuthBox.Audit.Winston-Sequelize-Transport

Creates a winston sequelize transport. The following config options are required:

```
    "hostingEnvironment": {
    "env": "dev"
    },
    "loggerSettings": {
        "logLevel": "debug",
        "applicationName": "MyApi",
        "auditDb": {
          "host" :"DBHostName",
          "username":"db-login-name",
          "password":"db-login-pwd",
          "dialect":"mssql",
          "name":"database-name",
          "encrypt": true,
          "schema": "dbo"
        }
  },
```

usage is as follows:

```

const winstonSequelizeTransport = require('authbox.audit.winston-sequelize-transport');


const transport = winstonSequelizeTransport(config);
const loggerConfig = {
  transports: [],
};
loggerConfig.transports.push(new WinstonTransportSequelize(options));
const logger = new (winston.Logger)(loggerConfig);

```
