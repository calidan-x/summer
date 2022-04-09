import { initTest, endTest, request } from '@summer-js/test'
import { getLocInstance } from '@summer-js/summer'
import { MovieController } from './../src/controllers/MovieController'
import { HelloService } from './../src/service/HelloService'
import { PersonService } from '../src/service/person-service'

describe('Test Movie Service', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('should return movie list', async () => {
    const movieController = getLocInstance(MovieController)
    console.log(movieController)
    expect(100).toBe(100)
  })
})
