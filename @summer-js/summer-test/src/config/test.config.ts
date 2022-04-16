import { SessionConfig, ServerConfig } from '@summer-js/summer'
import { MySQLConfig } from '@summer-js/typeorm'

export const TEST_CONFIG = {
  var1: 'VAR1Change',
  var3: 'VAR3'
}

export const MYSQL_CONFIG: MySQLConfig = {
  host: 'localhost',
  database: 'summer-db',
  username: 'root',
  password: 'root'
}

export const SESSION_CONFIG: SessionConfig = {
  expireIn: 5
}

export const SERVER_CONFIG: ServerConfig = {
  static: [{ requestPathRoot: '/static', destPathRoot: 'resource', indexFiles: ['index.html'] }]
}
