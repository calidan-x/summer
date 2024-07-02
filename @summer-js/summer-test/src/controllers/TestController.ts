import { Controller, Get, Serialize, serialize } from '@summer-js/summer'

export enum Gender {
  Unknown = 0,
  Male = 1,
  Female = 2
}

export class BaseInfo {
  name: string
  gender: Gender
}

export class User {
  @Serialize((val, _user: User) => {
    console.log(val.gender)
    return val
  })
  baseInfo: BaseInfo
}

@Controller('/test')
export class TestController {
  @Get('/user')
  test() {
    const user = new User()
    user.baseInfo = new BaseInfo()
    user.baseInfo.gender = Gender.Male
    user.baseInfo.name = 'Tom'

    serialize(user)
    serialize(user)
    console.log(user)
    return ''
  }
}
