import { getLocInstance } from '@summer-js/summer'
import { initTest, endTest } from '@summer-js/test'

import { PersonService } from './../service/person-service'

describe('Test Movie Service', () => {
  let personService: PersonService

  beforeAll(async () => {
    await initTest()
    // 必须在 initTest() 之后获取
    personService = getLocInstance(PersonService)
  })

  afterAll(async () => {
    await endTest()
  })

  test('should return movie list', async () => {
    const persons = await personService.getPersons()
    expect(persons.length).toBe(0)
  })
})
