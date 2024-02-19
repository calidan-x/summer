import { ServerConfig, SessionConfig, RpcConfig } from '@summer-js/summer'
import { SwaggerConfig } from '@summer-js/swagger'
import { TypeORMConfig } from '@summer-js/typeorm'
// import { MongoDBConfig } from '@summer-js/mongodb'
import { RedisConfig } from '@summer-js/redis'
import { SocketIOConfig } from '@summer-js/socket.io'
// import { KafkaConfig, logLevel } from 'kafkajs'
import { ElasticSearchConfig } from '@summer-js/elasticsearch'

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
  ],
  compression: {
    enable: true
  }
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
    // description: 'Last build at: ' + new Date(SUMMER_BUILD_TIMESTAMP),
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

export const ELASTICSEARCH_CONFIG: ElasticSearchConfig = {
  Default: { node: 'http://localhost:9200' }
}

export const REDIS_CONFIG: RedisConfig = {
  port: 6379,
  host: '127.0.0.1'
}

export const SOCKET_IO_CONFIG: SocketIOConfig = {}

// export const MONGODB_CONFIG: MongoDBConfig = {
//   DefaultSource: {
//     url: 'mongodb://localhost:27017',
//     db: 'db',
//     collectionNameConvert(name) {
//       return name.replace(/([A-Z])/g, '_$1').toLowerCase()
//     }
//   }
// }

// export const KAFKA_CONFIG: KafkaConfig = {
//   clientId: 'client2',
//   brokers: ['127.0.0.1:9092'],
//   logLevel: logLevel.ERROR
// }
