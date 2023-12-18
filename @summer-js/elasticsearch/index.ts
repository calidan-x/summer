import { Logger, SummerPlugin, addPlugin, addInjectable } from '@summer-js/summer'
import { Client, ClientOptions } from '@elastic/elasticsearch'

export type ElasticSearchConfig = Record<string, ClientOptions>

class ElasticSearch extends SummerPlugin {
  configKey = 'ELASTICSEARCH_CONFIG'
  clients = {}

  async init(config) {
    addInjectable(ESClient, async (dataSourceName: string) => {
      if (!config) {
        return null
      }
      if (Object.keys(config).length === 0) {
        return null
      }
      if (!dataSourceName) {
        dataSourceName = Object.keys(config)[0]
      }
      if (!config[dataSourceName]) {
        Logger.error(`No data source name \"${dataSourceName}\" in elastic search config`)
        return null
      }
      if (this.clients[dataSourceName]) {
        return this.clients[dataSourceName]
      }

      const client = await this.connect(config[dataSourceName], dataSourceName)
      this.clients[dataSourceName] = client
      return client
    })
  }

  async connect(options: ClientOptions, dataSourceName: string) {
    const isSummerTesting = process.env.SUMMER_TESTING !== undefined
    const esClient = new Client(options)
    await esClient
      .ping()
      .then(() => {
        if (!isSummerTesting) {
          Logger.info(`Elastic Search(${dataSourceName}) Connected`)
        }
      })
      .catch((err) => {
        Logger.error(err)
      })
    return esClient
  }

  async destroy() {}
}

addPlugin(ElasticSearch)
export default ElasticSearch

// @ts-ignore
export class ESClient<DataSourceName extends string = ''> extends Client {}
