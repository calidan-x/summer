import { Service } from '@summer-js/summer'
import { InjectService } from './'

@Service
export class HelloService {
  injectService: InjectService

  sayHello() {
    console.log('Hello')
  }

  getInfo() {
    return this.injectService.getInfo()
  }

  getInfo2() {
    return this.injectService.getInfo2()
  }
}
