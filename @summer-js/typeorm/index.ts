import { createConnection, Connection } from 'typeorm'
import { Logger, SummerPlugin, addPlugin } from '@summer-js/summer'
import { DefaultNamingStrategy } from 'typeorm'
import { snakeCase } from 'typeorm/util/StringUtils'

class DBNamingStrategy extends DefaultNamingStrategy {
  tableName(targetName: string, userSpecifiedName: string | undefined): string {
    return userSpecifiedName ? userSpecifiedName : snakeCase(targetName)
  }
  columnName(propertyName: string, customName): string {
    return customName ? customName : snakeCase(propertyName)
  }
}

export interface MySQLConfig {
  host: string
  port?: number
  database: string
  username: string
  password: string
}

const AllEntities = []
;(global as any)._TypeORMEntity = (target: Object) => {
  AllEntities.push(target)
}

declare global {
  const _TypeORMEntity: any
}

class TypeORMPlugin implements SummerPlugin {
  configKey = 'MYSQL_CONFIG'
  dbConnections: Connection[] = []

  compile(classDecorator, clazz) {
    if (classDecorator.getName() === 'Entity') {
      clazz.addDecorator({ name: '_TypeORMEntity' })
    }
  }

  autoImportDecorators() {
    return ['Entity']
  }

  async init(config) {
    await this.connect(config)
  }

  async connect(connectOptions: MySQLConfig) {
    if (connectOptions) {
      const connection: Connection = await createConnection({
        type: 'mysql',
        port: 3306,
        namingStrategy: new DBNamingStrategy(),
        entities: AllEntities,
        ...connectOptions
      })
      if (!connection.isConnected) {
        Logger.error('Failed to connect to database')
      } else {
        !process.env.SUMMER_TESTING && Logger.log('MySQL DB connected')
        this.dbConnections.push(connection)
      }
    }
  }

  async destroy() {
    while (this.dbConnections.length) {
      const conn = this.dbConnections.pop()
      await conn.close()
    }
  }
}

addPlugin(TypeORMPlugin)
export default TypeORMPlugin
