import { Logger, SummerPlugin, addPlugin, addInjectable } from '@summer-js/summer'
import {
  Kafka,
  KafkaConfig,
  Producer as KafkaProducer,
  Consumer as KafkaConsumer,
  ConnectEvent,
  DisconnectEvent,
  InstrumentationEvent,
  Logger as KafkaLogger,
  ProducerBatch,
  ProducerEvents,
  ProducerRecord,
  RecordMetadata,
  RemoveInstrumentationEventListener,
  RequestEvent,
  RequestQueueSizeEvent,
  RequestTimeoutEvent,
  Transaction,
  ValueOf,
  ConsumerCommitOffsetsEvent,
  ConsumerCrashEvent,
  ConsumerEndBatchProcessEvent,
  ConsumerEvents,
  ConsumerFetchEvent,
  ConsumerFetchStartEvent,
  ConsumerGroupJoinEvent,
  ConsumerHeartbeatEvent,
  ConsumerRebalancingEvent,
  ConsumerReceivedUnsubcribedTopicsEvent,
  ConsumerRunConfig,
  ConsumerStartBatchProcessEvent,
  ConsumerSubscribeTopic,
  ConsumerSubscribeTopics,
  GroupDescription,
  TopicPartitionOffset,
  TopicPartitionOffsetAndMetadata,
  TopicPartitions
} from 'kafkajs'

export { KafkaConfig }

export class KafkaClient extends Kafka {}

export class Producer implements KafkaProducer {
  // @ts-ignore
  send(record: ProducerRecord): Promise<RecordMetadata[]> {
    throw new Error('Method not implemented.')
  }
  // @ts-ignore
  sendBatch(batch: ProducerBatch): Promise<RecordMetadata[]> {
    throw new Error('Method not implemented.')
  }
  connect(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  disconnect(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  isIdempotent(): boolean {
    throw new Error('Method not implemented.')
  }
  events: ProducerEvents
  on(
    eventName: 'producer.connect',
    listener: (event: ConnectEvent) => void
  ): RemoveInstrumentationEventListener<'producer.connect'>
  on(
    eventName: 'producer.disconnect',
    listener: (event: DisconnectEvent) => void
  ): RemoveInstrumentationEventListener<'producer.disconnect'>
  on(
    eventName: 'producer.network.request',
    listener: (event: RequestEvent) => void
  ): RemoveInstrumentationEventListener<'producer.network.request'>
  on(
    eventName: 'producer.network.request_queue_size',
    listener: (event: RequestQueueSizeEvent) => void
  ): RemoveInstrumentationEventListener<'producer.network.request_queue_size'>
  on(
    eventName: 'producer.network.request_timeout',
    listener: (event: RequestTimeoutEvent) => void
  ): RemoveInstrumentationEventListener<'producer.network.request_timeout'>
  on(
    eventName: ValueOf<ProducerEvents>,
    listener: (event: InstrumentationEvent<any>) => void
  ): RemoveInstrumentationEventListener<ValueOf<ProducerEvents>>
  on(
    // @ts-ignore
    eventName: unknown,
    // @ts-ignore
    listener: unknown
  ):
    | import('kafkajs').RemoveInstrumentationEventListener<'producer.connect'>
    | import('kafkajs').RemoveInstrumentationEventListener<'producer.disconnect'>
    | import('kafkajs').RemoveInstrumentationEventListener<'producer.network.request'>
    | import('kafkajs').RemoveInstrumentationEventListener<'producer.network.request_queue_size'>
    | import('kafkajs').RemoveInstrumentationEventListener<'producer.network.request_timeout'>
    | import('kafkajs').RemoveInstrumentationEventListener<
        import('kafkajs').ValueOf<import('kafkajs').ProducerEvents>
      > {
    throw new Error('Method not implemented.')
  }
  transaction(): Promise<Transaction> {
    throw new Error('Method not implemented.')
  }
  logger(): KafkaLogger {
    throw new Error('Method not implemented.')
  }
}

// @ts-ignore
export class Consumer<groupId extends string> implements KafkaConsumer {
  connect(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  disconnect(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  // @ts-ignore
  subscribe(subscription: ConsumerSubscribeTopics | ConsumerSubscribeTopic): Promise<void> {
    throw new Error('Method not implemented.')
  }
  stop(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  // @ts-ignore
  run(config?: ConsumerRunConfig | undefined): Promise<void> {
    throw new Error('Method not implemented.')
  }
  // @ts-ignore
  commitOffsets(topicPartitions: TopicPartitionOffsetAndMetadata[]): Promise<void> {
    throw new Error('Method not implemented.')
  }
  // @ts-ignore
  seek(topicPartitionOffset: TopicPartitionOffset): void {
    throw new Error('Method not implemented.')
  }
  describeGroup(): Promise<GroupDescription> {
    throw new Error('Method not implemented.')
  }
  // @ts-ignore
  pause(topics: { topic: string; partitions?: number[] | undefined }[]): void {
    throw new Error('Method not implemented.')
  }
  paused(): TopicPartitions[] {
    throw new Error('Method not implemented.')
  }
  // @ts-ignore
  resume(topics: { topic: string; partitions?: number[] | undefined }[]): void {
    throw new Error('Method not implemented.')
  }
  on(
    eventName: 'consumer.heartbeat',
    listener: (event: ConsumerHeartbeatEvent) => void
  ): RemoveInstrumentationEventListener<'consumer.heartbeat'>
  on(
    eventName: 'consumer.commit_offsets',
    listener: (event: ConsumerCommitOffsetsEvent) => void
  ): RemoveInstrumentationEventListener<'consumer.commit_offsets'>
  on(
    eventName: 'consumer.group_join',
    listener: (event: ConsumerGroupJoinEvent) => void
  ): RemoveInstrumentationEventListener<'consumer.group_join'>
  on(
    eventName: 'consumer.fetch_start',
    listener: (event: ConsumerFetchStartEvent) => void
  ): RemoveInstrumentationEventListener<'consumer.fetch_start'>
  on(
    eventName: 'consumer.fetch',
    listener: (event: ConsumerFetchEvent) => void
  ): RemoveInstrumentationEventListener<'consumer.fetch'>
  on(
    eventName: 'consumer.start_batch_process',
    listener: (event: ConsumerStartBatchProcessEvent) => void
  ): RemoveInstrumentationEventListener<'consumer.start_batch_process'>
  on(
    eventName: 'consumer.end_batch_process',
    listener: (event: ConsumerEndBatchProcessEvent) => void
  ): RemoveInstrumentationEventListener<'consumer.end_batch_process'>
  on(
    eventName: 'consumer.connect',
    listener: (event: ConnectEvent) => void
  ): RemoveInstrumentationEventListener<'consumer.connect'>
  on(
    eventName: 'consumer.disconnect',
    listener: (event: DisconnectEvent) => void
  ): RemoveInstrumentationEventListener<'consumer.disconnect'>
  on(
    eventName: 'consumer.stop',
    listener: (event: InstrumentationEvent<null>) => void
  ): RemoveInstrumentationEventListener<'consumer.stop'>
  on(
    eventName: 'consumer.crash',
    listener: (event: ConsumerCrashEvent) => void
  ): RemoveInstrumentationEventListener<'consumer.crash'>
  on(
    eventName: 'consumer.rebalancing',
    listener: (event: ConsumerRebalancingEvent) => void
  ): RemoveInstrumentationEventListener<'consumer.rebalancing'>
  on(
    eventName: 'consumer.received_unsubscribed_topics',
    listener: (event: ConsumerReceivedUnsubcribedTopicsEvent) => void
  ): RemoveInstrumentationEventListener<'consumer.received_unsubscribed_topics'>
  on(
    eventName: 'consumer.network.request',
    listener: (event: RequestEvent) => void
  ): RemoveInstrumentationEventListener<'consumer.network.request'>
  on(
    eventName: 'consumer.network.request_timeout',
    listener: (event: RequestTimeoutEvent) => void
  ): RemoveInstrumentationEventListener<'consumer.network.request_timeout'>
  on(
    eventName: 'consumer.network.request_queue_size',
    listener: (event: RequestQueueSizeEvent) => void
  ): RemoveInstrumentationEventListener<'consumer.network.request_queue_size'>
  on(
    eventName: ValueOf<ConsumerEvents>,
    listener: (event: InstrumentationEvent<any>) => void
  ): RemoveInstrumentationEventListener<ValueOf<ConsumerEvents>>
  on(
    // @ts-ignore
    eventName: unknown,
    // @ts-ignore
    listener: unknown
  ):
    | RemoveInstrumentationEventListener<'consumer.heartbeat'>
    | RemoveInstrumentationEventListener<'consumer.commit_offsets'>
    | RemoveInstrumentationEventListener<'consumer.group_join'>
    | RemoveInstrumentationEventListener<'consumer.fetch_start'>
    | RemoveInstrumentationEventListener<'consumer.fetch'>
    | RemoveInstrumentationEventListener<'consumer.start_batch_process'>
    | RemoveInstrumentationEventListener<'consumer.end_batch_process'>
    | RemoveInstrumentationEventListener<'consumer.connect'>
    | RemoveInstrumentationEventListener<'consumer.disconnect'>
    | RemoveInstrumentationEventListener<'consumer.stop'>
    | RemoveInstrumentationEventListener<'consumer.crash'>
    | RemoveInstrumentationEventListener<'consumer.rebalancing'>
    | RemoveInstrumentationEventListener<'consumer.received_unsubscribed_topics'>
    | RemoveInstrumentationEventListener<'consumer.network.request'>
    | RemoveInstrumentationEventListener<'consumer.network.request_timeout'>
    | RemoveInstrumentationEventListener<'consumer.network.request_queue_size'>
    | RemoveInstrumentationEventListener<ValueOf<import('kafkajs').ConsumerEvents>> {
    throw new Error('Method not implemented.')
  }
  logger(): KafkaLogger {
    throw new Error('Method not implemented.')
  }
  events: ConsumerEvents
}

class KafkaPlugin extends SummerPlugin {
  configKey = 'KAFKA_CONFIG'
  config: KafkaConfig
  kafkaClient: Kafka
  consumers: Record<string, KafkaConsumer> = {}
  producer: KafkaProducer

  async init(_config) {
    if (_config) {
      this.config = _config
    }

    addInjectable(KafkaClient, async () => {
      return await this.connectAndGetInstance()
    })

    addInjectable(Producer, async () => {
      const kafkaClient = await this.connectAndGetInstance()
      if (kafkaClient) {
        const isSummerTesting = process.env.SUMMER_TESTING !== undefined
        try {
          const producer = kafkaClient.producer()
          await producer.connect()
          this.producer = producer
          if (!isSummerTesting) {
            Logger.info(`Kafka Producer Connected`)
          }
          return producer
        } catch (error) {
          Logger.error(error)
        }
      }
      return null
    })

    addInjectable(Consumer, async (groupId: string) => {
      if (!groupId) {
        return null
      }
      const kafkaClient = await this.connectAndGetInstance()
      if (kafkaClient) {
        if (this.consumers[groupId]) {
          return this.consumers[groupId]
        }
        const isSummerTesting = process.env.SUMMER_TESTING !== undefined
        try {
          const consumer = kafkaClient.consumer({ groupId })
          await consumer.connect()
          this.consumers[groupId] = consumer
          if (!isSummerTesting) {
            Logger.info(`Kafka Consumer(groupId:${groupId}) Connected`)
          }
          return consumer
        } catch (error) {
          Logger.error(error)
        }
      }
      return null
    })
  }

  async connectAndGetInstance() {
    if (this.config) {
      if (!this.kafkaClient) {
        this.kafkaClient = new Kafka(this.config)
      }
      return this.kafkaClient
    }
    return null
  }

  async destroy() {
    try {
      for (const consumer of Object.values(this.consumers)) {
        await consumer.disconnect()
      }
      await this.producer.disconnect()
    } catch (e) {}
  }
}

addPlugin(KafkaPlugin)
export default KafkaPlugin
