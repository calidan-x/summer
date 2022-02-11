import { MySQLConfig, ServerConfig, SessionConfig } from '../../lib/config-handler';

export const MYSQL_CONFIG: MySQLConfig = {
  host: 'localhost',
  database: 'summer-db',
  username: 'root',
  password: 'root'
};

export const SERVER_CONFIG: ServerConfig = {
  port: 8801
};

export const SESSION_CONFIG: SessionConfig = {
  expireIn: 5000
};
