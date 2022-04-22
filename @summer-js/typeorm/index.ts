import { Logger, SummerPlugin, addPlugin } from '@summer-js/summer'
import { ClassDeclaration } from 'ts-morph'
import { DefaultNamingStrategy, DataSource, DataSourceOptions } from 'typeorm'
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

const AllEntities = []
;(global as any)._TypeORMEntity = (target: Object) => {
  AllEntities.push(target)
}
declare global {
  const _TypeORMEntity: any
}

const AllMigrations = []
declare global {
  const _TypeORMMigration: any
}
;(global as any)._TypeORMMigration = (target: Object) => {
  AllMigrations.push(target)
}

const DataSources: Record<string, DataSource> = {}
export const getDataSource = (dataSourceName: string) => {
  return DataSources[dataSourceName]
}

class TypeORMPlugin implements SummerPlugin {
  configKey = 'TYPEORM_CONFIG'

  compile(clazz: ClassDeclaration) {
    for (const classDecorator of clazz.getDecorators()) {
      if (classDecorator.getName() === 'Entity') {
        clazz.addDecorator({ name: '_TypeORMEntity' })
      }
    }
    const imps = clazz.getImplements()
    if (imps.length > 0 && imps[0].getText() === 'MigrationInterface') {
      clazz.addDecorator({ name: '_TypeORMMigration' })
    }
  }

  autoImportDecorators() {
    return ['Entity', '_TypeORMMigration']
  }

  async init(config) {
    await this.connect(config)
  }

  async connect(typeOrmOptions: TypeORMConfig) {
    if (typeOrmOptions) {
      for (const dataSourceName in typeOrmOptions) {
        const options = typeOrmOptions[dataSourceName]
        const dataSource = new DataSource({
          namingStrategy: new DBNamingStrategy(),
          entities: AllEntities,
          migrations: AllMigrations,
          ...options
        })
        try {
          await dataSource.initialize()
          DataSources[dataSourceName] = dataSource
        } catch (e) {
          Logger.error('Failed to connect data source: ' + dataSourceName)
          Logger.info(e)
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
