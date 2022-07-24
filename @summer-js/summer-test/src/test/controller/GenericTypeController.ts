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

class Request<T, K, L, P, Z, X, W, O> {
  int: int
  dir!: Direction[]
  intArr: int[]
  field1: T
  field2: K
  obj: L
  date: P
  g: G<int>
  z: Z
  x: G<X>
  w: W[]
  o: O[]
}

@ApiDocGroup('Generic')
@Controller('/generic-type')
export class GenericTypeController {
  @Post
  async genericRequest(@Body req: Request<string[], int, Obj, Date, G<boolean>, number, Obj, string>) {
    return req
  }

  @Get('/mixed-object-return')
  async mixedObjectReturn() {
    const g = new G<int>()
    g.a = 123
    g.b = 'sss'
    g.d = new Date(2022, 12, 12)
    return { hello: 'World', g }
  }
}
