export class Paging<T> {
  constructor(props: { data: T[]; pageNumber: number; pageSize: number; total: number }) {
    Object.assign(this, props)
  }
  data: T[]
  pageNumber: number
  pageSize: number
  total: number
}
