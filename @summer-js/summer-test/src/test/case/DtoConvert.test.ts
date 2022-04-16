import { convertData, fillData } from '@summer-js/summer'
import { initTest, endTest, request } from '@summer-js/test'

class AddUserRequest {
  name: string
  age: number
  moreInfo: string
}

class User {
  id: number
  name: string
  age: number
}

class UserResource {
  name: string
  age: number
  moreInfo: string
}

describe('DTO convert Test', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('test convertData', async () => {
    const addUserRequest: AddUserRequest = new AddUserRequest()
    addUserRequest.name = 'John'
    addUserRequest.age = 12
    addUserRequest.moreInfo = 'moreInfo'

    const user = convertData(addUserRequest, User)

    expect(JSON.stringify(user)).toBe('{"name":"John","age":12}')
  })

  test('test fillData', async () => {
    const user = new User()
    user.name = 'John'
    user.age = 12

    const userResource: UserResource = new UserResource()
    fillData(userResource, user)

    userResource.moreInfo = 'moreInfo'

    expect(JSON.stringify(userResource)).toBe('{"name":"John","age":12,"moreInfo":"moreInfo"}')
  })
})
