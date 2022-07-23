import { PropDoc } from '@summer-js/swagger'

export class Paging<T> {
  constructor(props: { data: T[]; pageNumber: number; pageSize: number; total: number }) {
    for (const k in props) {
      this[k] = props[k]
    }
  }
  data: T[]
  pageNumber: number
  pageSize: number
  total: number
}

export class Obj {
  @PropDoc('A', 'A Value')
  a: string
  @PropDoc('B', 1)
  b: int
}

export class ExtendObj extends Obj {
  c: string
  d: number
}

export class AnotherObj {
  field1: string
  field2: number
}
