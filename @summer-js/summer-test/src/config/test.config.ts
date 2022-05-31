import { SessionConfig, ServerConfig, RpcConfig } from '@summer-js/summer'
import { SwaggerConfig } from '@summer-js/swagger'
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
  static: [{ requestPathRoot: '/static', destPathRoot: 'resource', indexFiles: ['index.html'] }],
  cors: true,
  port: 8802
}

export const RPC_CONFIG: RpcConfig = {
  server: {
    accessKey: 'xxxxx'
  },
  client: {
    LOCAL_RPC: {
      url: 'http://localhost:8802',
      accessKey: 'xxxxx'
    }
  }
}

export const SWAGGER_CONFIG: SwaggerConfig = {
  docPath: '/swagger-ui',
  info: { title: 'Summer', version: '1.0.0' },
  securityDefinitions: {
    AppAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization'
    }
  }
}
