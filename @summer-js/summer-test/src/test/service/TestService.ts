import { Service } from '@summer-js/summer'

@Service
export class TestService {
  sayHi() {
    return 'Hi from TestService'
  }
}
