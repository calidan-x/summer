import {
  Logger,
  SummerPlugin,
  addPlugin,
  pluginCollection,
  addInjectable,
  getEnvConfig,
  createMethodDecorator
} from '@summer-js/summer'
import { AsyncLocalStorage } from 'async_hooks'
import { ClassDeclaration } from 'ts-morph'
import {
  DefaultNamingStrategy,
  DataSource,
  DataSourceOptions,
  Repository as TypeOrmRepository,
  ObjectLiteral,
  EntityManager
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
      // console.log(clazz.getName())
      // clazz.getProperties().forEach((p) => {
      //   p.getChildren().forEach((c, inx) => {
      //     console.log(inx, c.getText(), c.compilerNode.kind.toString())
      //     console.log('\n')
      //   })
      //   console.log(p.getText())
      // })
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

const asyncLocalStorage = new AsyncLocalStorage<EntityManager>()

export type TransactionOptions = { dataSourceName?: string }

export const Transaction = createMethodDecorator(
  async (ctx, invokeMethod?, transactionOptions?: TransactionOptions) => {
    await transaction(async () => {
      await invokeMethod(ctx.invocation.params)
    }, transactionOptions)
  }
)

export const transaction = async (exec: () => void, transactionOptions?: TransactionOptions) => {
  const typeORMConfig = getEnvConfig('TYPEORM_CONFIG')
  const dataSource = getDataSource(transactionOptions?.dataSourceName || Object.keys(typeORMConfig)[0])
  await dataSource.transaction(async (transactionManager) => {
    await asyncLocalStorage.run(transactionManager, async () => {
      await exec()
    })
  })
}

export class Repository<
  Entity extends ObjectLiteral,
  // @ts-ignore
  DataSourceName extends string = ''
> extends TypeOrmRepository<Entity> {}

addInjectable(Repository, (entity: any, dataSourceName: string) => {
  const typeORMConfig = getEnvConfig('TYPEORM_CONFIG')
  if (Object.keys(typeORMConfig)[0]) {
    try {
      const repository = getDataSource(dataSourceName || Object.keys(typeORMConfig)[0]).getRepository(entity)
      repository.save
      const patchMethods = [
        'save',
        'remove',
        'insert',
        'update',
        'delete',
        'softRemove',
        'recover',
        'softDelete',
        'restore',
        'clear',
        'increment',
        'decrement'
      ]
      patchMethods.forEach((m) => {
        const originMethod = repository[m]
        repository[m] = (...args: any) => {
          const transactionManager = asyncLocalStorage.getStore()
          if (!transactionManager) {
            return originMethod.apply(repository, args)
          }
          return transactionManager[m].apply(transactionManager, args)
        }
      })
      return repository
    } catch (e) {
      Logger.error(e)
    }
  }
  return null
})
