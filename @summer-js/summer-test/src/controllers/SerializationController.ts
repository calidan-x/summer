import { Controller, Get } from '@summer-js/summer'

enum Direction {
  UP = 0,
  DOWN = 1,
  LEFT = 2,
  RIGHT = 3
}

class Resource {
  direction: Direction
}

class ExtendResource extends Resource {
  count: number
}

class ObjectClass {
  str: string
  direction: Direction
}

class D {
  d: Date
}

@Controller
export class SerializationController {
  @Get('/serialize')
  async serialize() {
    const r = new Resource()
    r.direction = Direction.LEFT

    return r
  }

  @Get('/class-extends-serialize')
  async extendsSerialize() {
    const r = new ExtendResource()
    r.direction = Direction.LEFT
    r.count = 123
    return r
  }

  @Get('/object-serialize')
  async objectSerialize() {
    return { str: 'str', direction: 2 } as ObjectClass
  }

  @Get('/not-date')
  async dateSerialize() {
    return { d: 'not date' } as any as D
  }
}
