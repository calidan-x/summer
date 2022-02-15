import { Service } from '@summer/summer';

@Service
export class HelloService {
  sayHello() {
    console.log('Hello');
  }
}
