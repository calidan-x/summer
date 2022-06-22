import { Controller, Get, Body, Post } from '@summer-js/summer'
import { ApiDocGroup } from '@summer-js/swagger'

enum Direction {
  Up,
  Down
}

class Obj {
  a: number
  b: string
}

class G<T> {
  a: T
  b: string
  d: Date
}

class Request<T, K, L, P> {
  int: int
  dir: Direction[]
  intArr: int[]
  field1: T
  field2: K
  obj: L
  date: P
  ggg: G<int>
}

@ApiDocGroup('Generic')
@Controller('/generic-type')
export class GenericTypeController {
  @Post
  async genericRequest(@Body req: Request<string, int, Obj, Date>) {
    console.log('body', req)
    return req
  }

  @Get
  async object() {
    const g = new G()
    g.a = 123
    g.b = 'sss'
    g.d = new Date()
    return { hello: 'World', data: new Date(), g }
  }
}
