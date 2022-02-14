import { Service } from '../../lib/decorators';

@Service
export class HelloService {
  sayHello() {
    console.log('Hello');
  }
}
