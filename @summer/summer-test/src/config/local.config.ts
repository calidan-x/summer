import { SwaggerConfig } from '@summer/swagger';
import { ServerConfig, SessionConfig } from '@summer/summer';
import { MySQLConfig } from '@summer/mysql';

export const MYSQL_CONFIG: MySQLConfig = {
  host: 'localhost',
  database: 'summer-db',
  username: 'root',
  password: 'root'
};

export const SERVER_CONFIG: ServerConfig = {
  port: 8801,
  serveStatic: {
    paths: { f: 'resource' },
    indexFiles: ['index.html']
  }
};

export const SESSION_CONFIG: SessionConfig = {
  expireIn: 5000
};

export const SWAGGER_CONFIG: SwaggerConfig = {
  swaggerDocPath: 'swagger',
  info: { title: 'Summer' }
};
