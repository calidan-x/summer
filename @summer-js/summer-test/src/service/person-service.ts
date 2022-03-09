import { getRepository } from 'typeorm';
import { Service } from '@summer-js/summer';
import { Person } from '../entity';

@Service
export class PersonService {
  personRepository = getRepository(Person);

  async getPersons() {
    const person = await this.personRepository.find();
    return person;
  }

  async getPersonInfo(id: number) {
    const person = await this.personRepository.findOne(id);
    return person;
  }

  async savePerson(person: Person) {
    await this.personRepository.save(person);
  }
}
