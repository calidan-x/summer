import { SocketIOController, On, IO } from '@summer-js/socket.io'
import { Socket } from 'socket.io'

class Dog {
  name: string
}

@SocketIOController
export class IOEventController {
  io: IO

  @On
  connection(socket: Socket) {
    console.log(socket.request.headers)
    socket.send('欢迎光临')
  }

  @On
  message(socket: Socket, data: Dog) {
    console.log(data)
    socket.emit('message', { hi: '你好' })
  }

  @On('ev t')
  event2(socket: Socket, data) {
    console.log(data)
    socket.emit('evt', '你好2')
  }
}
