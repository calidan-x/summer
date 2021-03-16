import { IsString } from 'class-validator';
import { convertClass } from '../../../lib/utils';
import { Person } from '../../entity/person';

export class PersonRequest {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  toPerson() {
    return convertClass(this, Person);
  }
}
