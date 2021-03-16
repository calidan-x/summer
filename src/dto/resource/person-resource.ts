import { convertClass } from '../../../lib/utils';
import { Person } from '../../entity/person';

export class PersonResource {
  id: number;
  name: string;
  lastName: string;

  static from(person: Person): PersonResource {
    let personResource = convertClass(person, PersonResource);
    personResource.name = person.firstName + ' ' + person.lastName;
    return personResource;
  }
}
