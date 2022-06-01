import { Controller, Get } from '@summer-js/summer'

enum Direction {
  UP = 0,
  DOWN = 1,
  LEFT = 2,
  RIGHT = 3
}

class Resource {
  date: Date
  dateTime: DateTime
  timeStamp: TimeStamp

  direction: Direction
}

@Controller
export class SerializationController {
  @Get('/serialize')
  async serialize() {
    const r = new Resource()
    r.date = new Date()
    r.dateTime = new Date()
    r.timeStamp = new Date()
    r.direction = Direction.LEFT
    return r
  }
}
