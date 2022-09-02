import { ServerConfig } from '@summer-js/summer'
import { TypeORMConfig } from '@summer-js/typeorm'
import { SwaggerConfig } from '@summer-js/swagger'

export const SERVER_CONFIG: ServerConfig = {
  port: 8801
}

export const TYPEORM_CONFIG: TypeORMConfig = {
  MOVIE_DB: {
    type: 'mysql',
    host: 'localhost',
    database: 'movie-db',
    username: 'root',
    password: 'root'
  }
}

export const SWAGGER_CONFIG: SwaggerConfig = {
  docPath: '/swagger',
  info: { title: 'Movie', version: '1.0.0' },
  readTypeORMComment: true,
  securitySchemes: {
    AppAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization'
    }
  }
}
