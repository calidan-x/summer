import { Service } from '@summer-js/summer'
import { Paging, Obj, AnotherObj } from '../../dto/resource/Paging'

@Service
export class SwaggerService {
  getData() {
    return {} as Paging<AnotherObj>
  }

  getPagingData() {
    return new Paging({ data: [new AnotherObj()], total: 1, pageNumber: 1, pageSize: 2 })
  }

  getMixType() {
    const a = 123
    if (a === 123) {
      return new Obj()
    }
    return new AnotherObj()
  }
}
