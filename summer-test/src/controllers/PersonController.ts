import { Controller, Get, Param, Post, Body, Inject, AutoInject } from '../../lib/decorators';
import { PersonRequest } from '../dto/request/person-request';
import { PersonResource } from '../dto/resource/person-resource';
import { PersonService } from '../service/person-service';

@AutoInject
@Controller('/persons')
export class PersonController {
  personService: PersonService;

  @Get
  async personList() {
    const persons = await this.personService.getPersons();
    return persons;
  }

  @Post
  async addPerson(@Body personRequest: PersonRequest) {
    const persons = await this.personService.savePerson(personRequest.toPerson());
    return persons;
  }

  @Get('/:id/:name')
  async personInfo(@Param id: number) {
    const person = await this.personService.getPersonInfo(id);
    return person;
  }
}
