import { ServerConfig, SessionConfig, RpcConfig } from '@summer-js/summer'
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

export const SERVER_CONFIG: ServerConfig = {
  port: 8801,
  cors: true,
  static: [
    {
      requestPathRoot: '/static',
      destPathRoot: 'resource',
      indexFiles: ['1.txt']
    }
  ]
}

export const SESSION_CONFIG: SessionConfig = {
  expireIn: 5
}

export const SWAGGER_CONFIG: SwaggerConfig = {
  docPath: '/swagger',
  info: { title: 'Summer' }
}

export const RPC_CONFIG: RpcConfig = {
  server: {
    accessKey: 'xxxxx'
  },
  client: {
    LOCAL_RPC: {
      url: 'http://localhost:8801',
      accessKey: 'xxxxx'
    }
  }
}
