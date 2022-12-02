import { Logger, SummerPlugin, addPlugin, addInjectable } from '@summer-js/summer'
import { Client, ClientOptions } from '@elastic/elasticsearch'

export type ElasticSearchConfig = ClientOptions

let esClient: Client
class ElasticSearch extends SummerPlugin {
  configKey = 'ELASTICSEARCH_CONFIG'

  async init(config) {
    if (config) {
      await this.connect(config)
    }
  }

  async connect(options: ElasticSearchConfig) {
    const isSummerTesting = process.env.SUMMER_TESTING !== undefined
    esClient = new Client(options)
    await esClient
      .ping()
      .then(() => {
        if (!isSummerTesting) {
          Logger.info('Elastic Search Connected')
        }
      })
      .catch((err) => {
        Logger.error(err)
      })
  }

  async destroy() {}
}

addPlugin(ElasticSearch)
export default ElasticSearch

export class ESClient extends Client {}
addInjectable(ESClient, () => {
  return esClient
})
