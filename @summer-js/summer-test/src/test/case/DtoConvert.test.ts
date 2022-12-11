import { convertData, fillData } from '@summer-js/summer'
import '@summer-js/test'

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
  test('test convertData', async () => {
    const addUserRequest: AddUserRequest = new AddUserRequest()
    addUserRequest.name = 'John'
    addUserRequest.age = 12
    addUserRequest.moreInfo = 'moreInfo'

    const user = convertData(addUserRequest, User)

    expect(user).toEqual({ name: 'John', age: 12 })
  })

  test('test fillData', async () => {
    const user = new User()
    user.name = 'John'
    user.age = 12

    const userResource: UserResource = new UserResource()
    fillData(userResource, user)

    userResource.moreInfo = 'moreInfo'

    expect(userResource).toEqual({ name: 'John', age: 12, moreInfo: 'moreInfo' })
  })
})
