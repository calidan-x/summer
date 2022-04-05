import { Controller, Get, PathParam, Post, Body, Inject, AutoInject, Query, convertData } from '@summer-js/summer';
import { ApiDoc, ApiGroupDoc } from '@summer-js/swagger';
import { PersonRequest } from '../dto/request/person-request';
import { PersonResource } from '../dto/resource/person-resource';
import { Person } from '../entity';
import { PersonService } from '../service/person-service';

@AutoInject
@Controller('/persons')
@ApiGroupDoc('Person相关服务', '描述')
export class PersonController {
  personService: PersonService;

  @Get
  @ApiDoc({ summery: '获取用户列表', description: '描述描述描述描述描述' })
  async personList(@Query pageIndex: string) {
    const persons = await this.personService.getPersons();
    return persons;
  }

  @Post
  async addPerson(@Body personRequest: PersonRequest) {
    const persons = await this.personService.savePerson(convertData(personRequest, Person));
    return persons;
  }

  @Get('/:id')
  async personInfo(@PathParam id: number) {
    const person = await this.personService.getPersonInfo(id);
    return person;
  }
}
