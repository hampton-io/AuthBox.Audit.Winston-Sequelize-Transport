jest.mock('sequelize');
jest.mock('./../src/SequelizeTransport');

const index = require('./../src/index');

describe('When getting the winston sequelize transport ', () => {

  it('then null is returned if the config is not set', () => {
    const configObject = {
      loggerSettings:{
        auditDb:{
        }
      }
    };

    const actual = index(configObject);

    expect(actual).toBeNull();
  });
  it('then the transport object is returned if the config is correctly set', () => {
    const sequelizeMock = require('sequelize');
    const winstonMock = require('./../src/SequelizeTransport');

    const configObject = {
      hostingEnvironment: {
        env: 'test'
      },
      loggerSettings:{
        auditDb:{
          name: 'test-db',
          username: 'testPerson',
          password: 'myPassword',
          host: 'auditHost',
          dialect: 'mssql',
        },
        applicationName: 'test application',
      }
    };

    const actual = index(configObject);

    expect(actual).not.toBeNull();
    expect(winstonMock.mock.calls.length).toBe(1);
    expect(winstonMock.mock.calls[0][0].application).toBe('test application');
    expect(sequelizeMock.mock.calls.length).toBe(1);
    expect(sequelizeMock.mock.calls[0][0]).toBe('test-db');
    expect(sequelizeMock.mock.calls[0][1]).toBe('testPerson');
    expect(sequelizeMock.mock.calls[0][2]).toBe('myPassword');
  });
});