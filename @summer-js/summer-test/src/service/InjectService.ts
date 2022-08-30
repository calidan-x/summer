import { Service } from '@summer-js/summer'

class Info {
  msg: string
}

@Service
export class InjectService {
  getInfo() {
    return 'info'
  }
  getInfo2() {
    return [new Info()]
  }
}
