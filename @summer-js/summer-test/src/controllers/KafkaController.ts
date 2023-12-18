import { Controller, Get, Logger } from '@summer-js/summer'
import { Producer, Consume, EachMessagePayload } from '@summer-js/kafka'

@Controller('/v1/kafka')
export class KafkaController {
  producer: Producer
  // consumer: Consumer<'test-group-1'>

  // @PostConstruct
  // async init() {
  //   if (!this.consumer) {
  //     return
  //   }
  //   await this.consumer.subscribe({ topic: 'test-topic', fromBeginning: true })
  //   await this.consumer.run({
  //     eachMessage: async ({ topic, partition, message }) => {
  //       console.log('topic', topic)
  //       console.log('partition', partition)
  //       if (message.value) {
  //         console.log({
  //           value: message.value.toString()
  //         })
  //       }
  //     }
  //   })
  // }

  @Get('/send')
  async test() {
    await this.producer.send({
      topic: 'test-topic',
      messages: [{ value: 'Hello KafkaJS user! ' + Date.now() }]
    })
  }

  @Consume({ topic: 'test-topic', groupId: 'test-group-1' })
  doSomething({ message }: EachMessagePayload) {
    Logger.debug(message.value?.toString())
  }
}
//
