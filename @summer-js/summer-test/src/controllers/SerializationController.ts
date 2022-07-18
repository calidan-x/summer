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

class ExtendResource extends Resource {
  count: number
}

class ObjectClass {
  str: string
  direction: Direction
}

@Controller
export class SerializationController {
  @Get('/serialize')
  async serialize() {
    const r = new Resource()
    r.date = new Date(1658159560321)
    r.dateTime = new Date(1658159560321)
    r.timeStamp = new Date(1658159560321)
    r.direction = Direction.LEFT

    return r
  }

  @Get('/class-extends-serialize')
  async extendsSerialize() {
    const r = new ExtendResource()
    r.date = new Date(1658159560321)
    r.dateTime = new Date(1658159560321)
    r.timeStamp = new Date(1658159560321)
    r.direction = Direction.LEFT
    r.count = 123
    return r
  }

  @Get('/object-serialize')
  async objectSerialize() {
    return { str: 'str', direction: 2 } as ObjectClass
  }
}
