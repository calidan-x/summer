import {
  Controller,
  Get,
  PathParam,
  Post,
  Body,
  Inject,
  AutoInject,
  Query,
  convertData,
  ResponseError
} from '@summer-js/summer'
import { ApiDoc, ApiDocGroup } from '@summer-js/swagger'
import { PersonRequest } from '../dto/request/person-request'
import { Person } from '../entity'
import { PersonService } from './PersonService'

@AutoInject
@Controller('/persons')
@ApiDocGroup('Person相关服务')
export class PersonController {
  personService: PersonService

  @Get
  @ApiDoc('获取用户列表', {
    errors: [
      new ResponseError(400, { message: '错误1' }),
      new ResponseError(400, { message: '错误2' }),
      { statusCode: 400, description: '请求错误', example: '错误3' },
      { statusCode: 400, example: { message: '错误5' } }
    ]
  })
  async personList(@Query pageIndex?: string) {
    const persons = await this.personService.getPersons()
    return persons
  }

  @Post
  async addPerson(@Body personRequest: PersonRequest) {
    const persons = await this.personService.savePerson(convertData(personRequest, Person))
    return persons
  }

  @Get('/:id')
  async personInfo(@PathParam id: number) {
    const person = await this.personService.getPersonInfo(id)
    return person
  }
}
