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
  Queries
} from '@summer-js/summer'
import { ApiDoc, ApiDocGroup, PropDoc } from '@summer-js/swagger'

class Obj {
  @PropDoc('A', 'A Value')
  a: string
  @PropDoc('B', 1)
  b: int
}

class ExtendObj extends Obj {
  c: string
  d: number
}

export class Paging<T> {
  constructor(data: T[], { pageNumber, pageSize, total }: { pageNumber: number; pageSize: number; total: number }) {
    this.data = data
    this.pageNumber = pageNumber
    this.pageSize = pageSize
    this.total = total
  }
  data: T[]
  pageNumber: number
  pageSize: number
  total: number
}

class Request {
  string: string
  number: number
  int: int
  boolean: boolean
  Date: Date
  DateTime: DateTime
  TimeStamp: TimeStamp

  stringArray: string[]
  intArray: int[]
  numberArray: number[]
  booleanArray: boolean[]
  DateArray: Date[]
  DateTimeArray: DateTime[]
  TimeStampArray: TimeStamp[]

  stringOptional?: string
  numberOptional?: number
  intOptional?: int
  booleanOptional?: boolean
  DateOptional?: Date
  DateTimeOptional?: DateTime
  TimeStampOptional?: TimeStamp

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
  DateTime: DateTime
  TimeStamp: TimeStamp

  stringArray: string[]
  intArray: int[]
  numberArray: number[]
  booleanArray: boolean[]
  DateArray: Date[]
  DateTimeArray: DateTime[]
  TimeStampArray: TimeStamp[]

  stringOptional?: string
  numberOptional?: number
  intOptional?: int
  booleanOptional?: boolean
  DateOptional?: Date
  DateTimeOptional?: DateTime
  TimeStampOptional?: TimeStamp

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
  @Get
  @ApiDoc('Get Hello', { description: 'desc' })
  async hello() {
    return 'Hello Swagger Doc!'
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
    return new Paging(objs, { pageNumber: 1, pageSize: 10, total: 100 })
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
  ) {}

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
  async extendClass(@Body extendObj: ExtendObj) {
    return new ExtendObj()
  }
}
