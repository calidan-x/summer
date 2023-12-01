import { Logger, SummerPlugin, addPlugin, addInjectable } from '@summer-js/summer'
import { MongoClient, MongoClientOptions, Collection as MongoDBCollection, Document } from 'mongodb'

export type MongoDBConfig = Record<
  string,
  { url: string; db: string; collectionNameConvert?: (name: string) => string; options?: MongoClientOptions }
>
// @ts-ignore
export class MongoDBClient<SourceName = ''> extends MongoClient {}
// @ts-ignore
export class Collection<
  Collection extends Document | string,
  // @ts-ignore
  DBName extends string = '',
  // @ts-ignore
  SourceName extends string = ''
> extends MongoDBCollection<Collection extends string ? Document : Collection> {}

class MongoDB extends SummerPlugin {
  configKey = 'MONGODB_CONFIG'
  config: MongoDBConfig
  mangoClients: Record<string, MongoDBClient> = {}

  async init(_config) {
    if (_config) {
      this.config = _config
    }
    addInjectable(MongoDBClient, async (key = '') => {
      return await this.connectAndGetInstance(key)
    })

    addInjectable(Collection, async (collection: any, dbName: string, key = '') => {
      if (!collection) {
        return null
      }
      const mongoDbClient = await this.connectAndGetInstance(key)
      if (mongoDbClient) {
        if (!key && Object.keys(this.config).length > 0) {
          key = Object.keys(this.config)[0]
        }
        const db = mongoDbClient.db(dbName || this.config[key].db)
        const name = collection.name || collection
        return db.collection(
          this.config[key].collectionNameConvert ? this.config[key].collectionNameConvert!(name) : name
        )
      }
      return null
    })
  }

  async connectAndGetInstance(key: string) {
    if (this.config) {
      const isSummerTesting = process.env.SUMMER_TESTING !== undefined
      if (!key && Object.keys(this.config).length > 0) {
        key = Object.keys(this.config)[0]
      }
      let mangoClient = this.mangoClients[key]
      if (!mangoClient) {
        mangoClient = new MongoClient(this.config[key].url, this.config[key].options)
        try {
          await mangoClient.connect()
          if (!isSummerTesting) {
            Logger.info(`Mongo Client(${key}) Connected `)
          }
        } catch (error) {
          Logger.error(error)
        }
        this.mangoClients[key] = mangoClient
      }
      return mangoClient
    }
    return null
  }

  async destroy() {
    try {
      for (const mangoClient of Object.values(this.mangoClients)) {
        mangoClient.close()
      }
    } catch (e) {}
  }
}

addPlugin(MongoDB)
export default MongoDB
