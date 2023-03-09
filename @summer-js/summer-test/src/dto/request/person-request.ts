import { PropDoc } from '@summer-js/swagger'

export class PersonRequest {
  firstName: string
  lastName: string
}

export class PersonSearchRequest {
  @PropDoc('query first name', 'John')
  firstName: string

  lastName: string
}
