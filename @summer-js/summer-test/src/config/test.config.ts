import { SessionConfig, ServerConfig } from '@summer-js/summer'
import { TypeORMConfig } from '@summer-js/typeorm'

export const TYPEORM_CONFIG: TypeORMConfig = {
  DATA_SOURCE: {
    type: 'mysql',
    host: 'localhost',
    database: 'summer-db',
    username: 'root',
    password: 'root'
  }
}

export const TEST_CONFIG = {
  var1: 'VAR1Change',
  var3: 'VAR3'
}

export const SESSION_CONFIG: SessionConfig = {
  expireIn: 5
}

export const SERVER_CONFIG: ServerConfig = {
  static: [{ requestPathRoot: '/static', destPathRoot: 'resource', indexFiles: ['index.html'] }]
}
