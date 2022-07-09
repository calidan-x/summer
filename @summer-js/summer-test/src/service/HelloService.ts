import { AutoInject, Service } from '@summer-js/summer'
import { InjectService } from './'

@Service
@AutoInject
export class HelloService {
  injectService: InjectService

  sayHello() {
    console.log('Hello')
  }

  getInfo() {
    return this.injectService.getInfo()
  }
}
