import { SocketIOController, On, IO } from '@summer-js/socket.io'
import { Emitter } from '@socket.io/redis-emitter'
// import { createAdapter } from '@socket.io/redis-adapter'
import { Socket } from 'socket.io'
import { RedisClient } from '@summer-js/redis'
// import { PostConstruct } from '@summer-js/summer'

class Dog {
  name: string
}

@SocketIOController
export class IOEventController {
  io: IO
  redisClient: RedisClient
  emitter: Emitter

  // @PostConstruct
  // init() {
  //   const pubClient = this.redisClient
  //   const subClient = this.redisClient.duplicate()
  //   this.io.adapter(createAdapter(pubClient, subClient))
  //   this.emitter = new Emitter(this.redisClient)
  // }

  @On
  connection(socket: Socket) {
    // console.log(socket.request.headers)
    socket.send('欢迎光临')
  }

  @On
  message(socket: Socket, data: Dog, data2: number, _callback: (data: any) => void) {
    console.log(data)
    console.log(data2)
    // callback({ status: 'OK' })
    socket.emit('message', { hi: '你好' })
  }

  @On('ev t')
  event2(_socket: Socket, data: Dog[]) {
    console.log(data)
  }

  @On
  disconnecting(socket: Socket) {
    console.log(socket.data)
  }
}
