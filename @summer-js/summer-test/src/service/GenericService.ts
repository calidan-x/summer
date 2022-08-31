import { Service } from '@summer-js/summer'

@Service
export class GenericService<T, K> {
  t: T
  k: K

  constructor(typeT: any, typeK: any) {
    if (typeT) {
      this.t = new typeT()
    }
    if (typeK) {
      this.k = new typeK()
    }
  }
}
