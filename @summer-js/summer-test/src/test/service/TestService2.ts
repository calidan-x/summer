import { AutoInject, Service } from '@summer-js/summer'
import { TestService } from './'

@Service
@AutoInject
export class TestService2 {
  testService: TestService

  hiFromTestService1() {
    return this.testService.sayHi()
  }
}
