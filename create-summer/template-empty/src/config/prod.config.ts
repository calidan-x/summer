import { ServerConfig, SessionConfig } from '@summer-js/summer';
import { MySQLConfig } from '@summer-js/typeorm';

export const MYSQL_CONFIG: MySQLConfig = {
  host: 'localhost',
  database: 'summer-db',
  username: 'root',
  password: 'root'
};

export const SERVER_CONFIG: ServerConfig = {
  port: 9901
};

export const SESSION_CONFIG: SessionConfig = {
  expireIn: 5000
};
