import convict from 'convict';
import validator from 'convict-format-with-validator';

convict.addFormats(validator);

export const applicationConfigSchema = convict({
  APP_PORT: {
    doc: 'Application port for incoming connections',
    format: 'port',
    env: 'APP_PORT',
    default: 8080,
  },
  DB_HOST: {
    doc: 'IP address of the database server',
    format: 'ipaddress',
    env: 'DB_HOST',
    default: '127.0.0.1',
  },
  DB_PORT: {
    doc: 'Port to connect to the database',
    format: 'port',
    env: 'DB_PORT',
    default: '27017',
  },
  DB_NAME: {
    doc: 'Database name',
    format: String,
    env: 'DB_NAME',
    default: 'six_cities',
  },
  DB_USER: {
    doc: 'Username to connect to database',
    format: String,
    env: 'DB_USER',
    default: '',
  },
  DB_PASSWORD: {
    doc: 'Password to connect to database',
    format: String,
    env: 'DB_PASSWORD',
    default: '',
  },
  SALT: {
    doc: 'Salt for password hash',
    format: String,
    env: 'SALT',
    default: '',
  },
  DEFAULT_PASSWORD: {
    doc: 'Default user password which will be used if other not provided',
    format: String,
    env: 'DEFAULT_PASSWORD',
    default: '12345678',
  },
  UPLOAD_DIRECTORY: {
    doc: 'Directory for upload user files',
    format: String,
    env: 'UPLOAD_DIRECTORY',
    default: './user_data/',
  },
  JWT_SECRET: {
    doc: 'Secret for sign JWT',
    format: String,
    env: 'JWT_SECRET',
    default: '1234567890',
  }
});
