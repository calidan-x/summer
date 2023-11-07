import { RedisConfig } from '@summer-js/redis'
import { SocketIOConfig } from '@summer-js/socket.io'
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
  static: [{ requestPath: '/static', destPath: 'resource', indexFiles: ['index.html'] }],
  cors: true,
  port: 8802,
  compression: {
    enable: true
  }
}

export const RPC_CONFIG: RpcConfig = {
  provider: {
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
  readTypeORMComment: true,
  info: { title: 'Summer', version: '1.0.0' },
  securitySchemes: {
    AppAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization'
    }
  }
}

export const MySQL = {
  host: 'localhost'
}

export const SOCKET_IO_CONFIG: SocketIOConfig = {}

export const REDIS_CONFIG: RedisConfig = {
  port: 6379,
  host: '127.0.0.1'
}
