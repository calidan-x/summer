import { AutoInject, Inject, Service } from '@summer-js/summer'
import { InjectService } from './InjectService'

@Service
@AutoInject
export class HelloService {
  injectService: InjectService

  sayHello() {
    console.log('Hello')
  }

  printInjection() {
    console.log(this.injectService)
  }
}
