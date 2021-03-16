import { Controller, Get, Autowired, PathParam, Post, RequestBody } from '../../lib/decorators';
import { PersonRequest } from '../dto/request/person-request';
import { PersonResource } from '../dto/resource/person-resource';
import { PersonService } from '../service/person-service';

@Controller('/persons')
export class PersonController {
  @Autowired
  personService: PersonService;

  @Get('')
  async personList() {
    const persons = await this.personService.getPersons();
    return persons;
  }

  @Post('')
  async addPerson(@RequestBody personRequest: PersonRequest) {
    const persons = await this.personService.savePerson(personRequest.toPerson());
    return persons;
  }

  @Get('/:id')
  async personInfo(@PathParam id: string) {
    const person = await this.personService.getPersonInfo(id);
    return PersonResource.from(person);
  }
}
