import { Controller, Get, PathParam, Post, Body, Inject, AutoInject, Query, convertData } from '@summer-js/summer'
import { ApiDoc, ApiDocGroup } from '@summer-js/swagger'
import { PersonRequest } from '../dto/request/person-request'
import { Person } from '../entity'
import { PersonService } from '../service/person-service'

@AutoInject
@Controller('/persons')
@ApiDocGroup('Person相关服务')
export class PersonController {
  personService: PersonService

  @Get
  @ApiDoc('获取用户列表', { description: '描述描述描述描述描述' })
  async personList(@Query pageIndex: string) {
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
