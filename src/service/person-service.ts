import { getRepository } from 'typeorm';
import { Service } from '../../lib/decorators';
import { Person } from '../entity/person';

@Service
export class PersonService {
  personRepository = getRepository(Person);

  async getPersons() {
    const person = await this.personRepository.find();
    return person;
  }

  async getPersonInfo(id: string) {
    const person = await this.personRepository.findOne(id);
    return person;
  }

  async savePerson(person: Person) {
    await this.personRepository.save(person);
  }
}
