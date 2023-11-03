import convict from 'convict';
import validator from 'convict-format-with-validator';

convict.addFormats(validator);

export const applicationSchema = convict({
  APP_PORT: {
    doc: 'Application port for incoming connections',
    format: 'port',
    env: 'APP_PORT',
    default: 8080,
  },
  DB_HOST: {
    doc: 'IP address of the database server (MongoDB)',
    format: 'ipaddress',
    env: 'DB_HOST',
    default: '127.0.0.1',
  },
  SALT: {
    doc: 'Salt for password hash',
    format: String,
    env: 'SALT',
    default: '',
  },
});

