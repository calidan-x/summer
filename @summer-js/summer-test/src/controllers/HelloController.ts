import { Body, Controller, Get, Query, PathParam, Header } from '@summer-js/summer';
import { ApiDoc, ApiGroupDoc } from '@summer-js/swagger';
import { Dog } from '../dto/request/Dog';

class HelloRequest {
  name: string;
  age: int;
  pets: Dog[];
}

@Controller()
@ApiGroupDoc('Hello相关服务', '描述')
export class HelloController {
  @Get()
  @ApiDoc({ summery: '获取Hello', description: '描述描述描述描述描述', response: 'Hello Summer!' })
  hello() {
    return 'Hello Summer!';
  }

  @ApiDoc({
    summery: '测试文档',
    description: '描述描述描述描述描述',
    requestBody: { name: 'Tom', age: 123 },
    response: { name: 'Tom', age: 123 },
    errorResponses: {
      404: { code: 123123, msg: 'not found' }
    }
  })
  @Get('/hello/:id')
  paramDoc(@Body body: HelloRequest, @Query query: string, @PathParam id: int, @Header header): string {
    return 'Doc';
  }

  @ApiDoc({ summery: '获取错误', description: '获取错误' })
  @Get('/error')
  error() {
    throw new Error('hello');
  }
}
