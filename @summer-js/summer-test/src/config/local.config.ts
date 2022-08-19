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
  basePath: '/local-service',
  static: [
    {
      requestPath: '/static',
      destPath: 'resource',
      indexFiles: ['1.txt']
    },
    {
      requestPath: '/spa',
      destPath: 'resource/spa',
      indexFiles: ['index.html'],
      spa: true
    }
  ]
  // clusterMode: true,
  // workersNumber: 3
}

export const SESSION_CONFIG: SessionConfig = {
  expireIn: 5
}

export const SWAGGER_CONFIG: SwaggerConfig = {
  docPath: '/swagger-ui',
  readTypeORMComment: true,
  info: {
    title: 'Summer',
    // description: 'Last build at: ' + new Date(Number(process.env.SUMMER_BUILD_TIME)),
    version: '1.0.0'
  },

  securitySchemes: {
    AppAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization'
    }
  }
}

export const RPC_CONFIG: RpcConfig = {
  provider: {
    accessKey: 'xxxxx'
  },
  client: {
    LOCAL_RPC: {
      url: 'http://localhost:8801/local-service/',
      accessKey: 'xxxxx'
    }
  }
}
