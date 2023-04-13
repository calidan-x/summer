import { Controller, Get } from '@summer-js/summer'

enum Direction {
  UP = 0,
  DOWN = 1,
  LEFT = 2,
  RIGHT = 3
}
enum Country {
  'China' = '中国',
  'US' = '美国'
}

class Resource {
  direction: Direction
  country: Country
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

type T = 'AA' | 'BB'

class A {
  a: T
  b: T
}

@Controller
export class SerializationController {
  @Get('/serialize')
  async serialize() {
    const r = new Resource()
    r.direction = Direction.LEFT
    r.country = Country.China
    return [r, r]
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

  @Get('/union-type')
  async unionTypeSerialize() {
    const a = new A()
    a.a = 'AA'
    a.b = 'BB'
    return a
  }
}
