import {
  Inject,
  Controller,
  Get,
  Query,
  Response,
  Hi,
  Hihi,
  RequireLogin,
  Config,
  MysqlConfig
} from '../../lib/decorators';
import { HelloService } from '../service';

@Controller('/hello')
export class HelloEntry {
  @Inject
  helloService: HelloService;

  @Get('/1')
  hello() {
    return 'sss';
  }

  @Get('/2')
  hello2() {
    return 'Hello S';
  }
}
