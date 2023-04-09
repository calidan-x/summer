import {
  Body,
  Controller,
  Get,
  Query,
  PathParam,
  Header,
  Post,
  MinLen,
  MaxLen,
  Max,
  Min,
  Pattern,
  Email,
  Delete,
  Patch,
  Queries,
  Put,
  StreamingData
} from '@summer-js/summer'
import { ApiDoc, ApiDocGroup, PropDoc } from '@summer-js/swagger'
import { Paging, Obj, ExtendObj } from '../../dto/resource/Paging'
import { SwaggerService } from '../service/SwaggerService'

interface InterfaceGenericRes<T> {
  a: T
}

interface InterfaceRes {
  a: number
  b: string
}

class Request {
  string: string
  number: number
  int: int
  boolean: boolean
  Date: Date

  stringArray: string[]
  intArray: int[]
  numberArray: number[]
  booleanArray: boolean[]
  DateArray: Date[]

  stringOptional?: string
  numberOptional?: number
  intOptional?: int
  booleanOptional?: boolean
  DateOptional?: Date

  obj: Obj
  objArray: Obj[]

  @Min(10)
  @Max(20)
  num: int

  @MinLen(10)
  @MaxLen(20)
  len: string

  @MinLen(10)
  @MaxLen(20)
  lenItems: string[]

  @Pattern(/regExp/)
  regExp: string

  @Email
  email: string

  password: string

  @PropDoc('Desc', 'Example')
  desc: string
}

class Resource {
  string: string
  number: number
  int: int
  boolean: boolean
  Date: Date

  stringArray: string[]
  intArray: int[]
  numberArray: number[]
  booleanArray: boolean[]
  DateArray: Date[]

  stringOptional?: string
  numberOptional?: number
  intOptional?: int
  booleanOptional?: boolean
  DateOptional?: Date

  obj: Obj
  objArray: Obj[]

  @Min(10)
  @Max(20)
  num: int

  @MinLen(10)
  @MaxLen(20)
  len: string

  @MinLen(10)
  @MaxLen(20)
  lenItems: string[]

  @Pattern(/regExp/)
  regExp: string

  @Email
  email: string

  password: string

  @PropDoc('Desc', 'Example')
  desc: string
}

class AllQueries {
  q1: string
  q2: int
}

@Controller('/swagger-test')
@ApiDocGroup('Swagger Apis')
export class SwaggerController {
  swaggerService: SwaggerService

  @Get
  @ApiDoc('Get Hello', { description: 'desc' })
  async hello() {
    return 'Hello Swagger Doc!'
  }

  @Get('/unknown')
  unknown(): unknown {
    return
  }

  unknownData(a: boolean) {
    if (a) {
      return ''
    }
    return [1, 2] as any
  }

  @Get('/multi-return')
  async promiseUnknown(): Promise<Paging<unknown>> {
    return new Paging({ data: this.unknownData(true) as any, pageNumber: 134, pageSize: 12, total: 12 })
  }

  @Get('/paging')
  async paging() {
    const objs: Obj[] = [
      {
        a: 'string',
        b: 100
      },
      {
        a: 'string2',
        b: 200
      }
    ]
    return new Paging({ data: objs, pageNumber: 1, pageSize: 10, total: 100 })
  }

  @ApiDoc('Doc Summary', {
    description: 'desc',
    errors: [
      {
        statusCode: 400,
        description: 'request error',
        example: { code: 10000, msg: 'request error' }
      },
      {
        statusCode: 500,
        example: 'server error'
      }
    ]
  })
  @Post('/swagger-params/:id')
  paramDoc(
    @Body body: Request,
    @Query query: string,
    @Query boolQuery: boolean,
    @Queries queries: AllQueries,
    @PathParam id: int,
    @Header header: string
  ) {
    body
    query
    boolQuery
    queries
    id
    header
  }

  @Post('/swagger-string-array-request')
  async stringArrayRequest(@Body array: string[]) {
    return array
  }

  @Post('/swagger-obj-array-request')
  async objArrayRequest(@Body objArray: Obj[]) {
    return objArray
  }

  @Get('/swagger-return-string-async')
  async returnString() {
    return 'string'
  }

  @Post('/swagger-return-int-async')
  async returnNumber() {
    return 123
  }

  @Delete('/swagger-return-object-async')
  async returnObject() {
    return new Resource()
  }

  @Delete('/swagger-return-string-array-async')
  async returnArray() {
    return ['string1', 'string2']
  }

  @Patch('/swagger-return-obj-array-async')
  async returnObjectArray() {
    return [new Resource(), new Resource(), new Resource()]
  }

  @Get('/swagger-security')
  @ApiDoc('security', { security: [{ AppAuth: [] }] })
  async security() {
    return ''
  }

  @Post('/swagger-extends-class')
  @ApiDoc('extends class')
  async extendClass(@Body _extendObj: ExtendObj) {
    return new ExtendObj()
  }

  @Put('/interface-return')
  async getInterface() {
    const a: InterfaceRes = { a: 123, b: 'Str' }
    return a
  }

  @Put('/wrong-return')
  async getWringReturn() {
    const a: InterfaceGenericRes<InterfaceRes> = { a: { a: 123, b: 'str' } }
    return a
  }

  @Put('/wrong-return2')
  async getWringReturn2() {
    const a: Partial<InterfaceRes> = { a: 123, b: 'str' }
    return a
  }

  @Put('/service-object-convert-type')
  async getServiceData() {
    return this.swaggerService.getData()
  }

  @Put('/service-mixed-type-return')
  async serviceMixTypeClass() {
    return this.swaggerService.getMixType() as any
  }

  @Put('/service-paging-return')
  async getServicePagingData() {
    return this.swaggerService.getPagingData()
  }

  @Get('/file')
  async fileData() {
    return new StreamingData('package.json')
  }
}
