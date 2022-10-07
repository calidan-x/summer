import { Logger, SummerPlugin, addPlugin, pluginCollection, addInjectable, getConfig } from '@summer-js/summer'
import { ClassDeclaration } from 'ts-morph'
import {
  DefaultNamingStrategy,
  DataSource,
  DataSourceOptions,
  Repository as TypeOrmRepository,
  ObjectLiteral
} from 'typeorm'
import { snakeCase } from 'typeorm/util/StringUtils'

export class DBNamingStrategy extends DefaultNamingStrategy {
  tableName(targetName: string, userSpecifiedName: string | undefined): string {
    return userSpecifiedName ? userSpecifiedName : snakeCase(targetName)
  }
  columnName(propertyName: string, customName): string {
    return customName ? customName : snakeCase(propertyName)
  }
}

export type TypeORMConfig = Record<string, DataSourceOptions>

const DataSources: Record<string, DataSource> = {}
export const getDataSource = (dataSourceName: string) => {
  if (!DataSources[dataSourceName]) {
    Logger.error('TypeORM Data Source: ' + dataSourceName + ' not exists')
  }
  return DataSources[dataSourceName]
}

class TypeORMPlugin extends SummerPlugin {
  configKey = 'TYPEORM_CONFIG'

  compile(clazz: ClassDeclaration, modifyActions: (() => void)[]) {
    let isEntity = false
    for (const classDecorator of clazz.getDecorators()) {
      if (classDecorator.getName() === 'Entity') {
        isEntity = true
        break
      }
    }

    if (isEntity) {
      this.collectClass(clazz, 'AllEntities', modifyActions)
    }

    const imps = clazz.getImplements()
    if (imps.length > 0 && imps[0].getText() === 'MigrationInterface') {
      this.collectClass(clazz, 'AllMigrations', modifyActions)
    }
  }

  async init(config) {
    await this.connect(config)
  }

  async connect(typeOrmOptions: TypeORMConfig) {
    const isSummerTesting = process.env.SUMMER_TESTING !== undefined

    if (typeOrmOptions) {
      for (const dataSourceName in typeOrmOptions) {
        const options = typeOrmOptions[dataSourceName]
        const dataSource = new DataSource({
          namingStrategy: new DBNamingStrategy(),
          entities: pluginCollection['AllEntities'],
          migrations: pluginCollection['AllMigrations'],
          ...options
        })

        try {
          await dataSource.initialize()
          DataSources[dataSourceName] = dataSource
          if (!isSummerTesting) {
            Logger.info('TypeORM Data Source: ' + dataSourceName + ' connected')
          }
        } catch (e) {
          Logger.error('Failed to connect data source: ' + dataSourceName)
          Logger.error(e)
        }
      }
    }
  }

  async destroy() {
    for (const dataSourceName of Object.keys(DataSources)) {
      const ds = DataSources[dataSourceName]
      await ds.destroy()
      delete DataSources[dataSourceName]
    }
  }
}

addPlugin(TypeORMPlugin)
export default TypeORMPlugin

export class Repository<
  Entity extends ObjectLiteral,
  DataSourceName extends string = ''
> extends TypeOrmRepository<Entity> {}

addInjectable(Repository, (entity: any, dataSourceName: string) => {
  const typeORMConfig = getConfig('TYPEORM_CONFIG')
  if (Object.keys(typeORMConfig)[0]) {
    try {
      return getDataSource(dataSourceName || Object.keys(typeORMConfig)[0]).getRepository(entity)
    } catch (e) {
      Logger.error(e)
    }
  }
})
