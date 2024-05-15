import { Serialize, serialize } from '@summer-js/summer'
import { request } from '@summer-js/test'

export class Dog {
  name: string
  age: number
  @Serialize((_, obj: Dog) => {
    if (obj.age > 10) {
      return 'old'
    }
    return 'young'
  })
  ageType: string
}

describe('Test Serialization', () => {
  test('test serialization function', async () => {
    const dog = new Dog()
    dog.name = 'Max'
    dog.age = 3
    expect(serialize(dog)).toEqual({
      name: 'Max',
      age: 3,
      ageType: 'young'
    })

    dog.name = 'Max'
    dog.age = 12
    expect(serialize(dog)).toEqual({
      name: 'Max',
      age: 12,
      ageType: 'old'
    })
  })

  test('test serialization', async () => {
    let res = await request.get('/serialize')
    expect(res.body).toStrictEqual([
      {
        direction: 'LEFT',
        country: 'China'
      },
      {
        direction: 'LEFT',
        country: 'China'
      }
    ])

    res = await request.get('/class-extends-serialize')
    expect(res.body).toStrictEqual({
      direction: 'LEFT',
      count: 123
    })

    res = await request.get('/object-serialize')
    expect(res.body).toStrictEqual({
      str: 'str',
      direction: 'LEFT'
    })

    res = await request.get('/not-date')
    expect(res.body).toStrictEqual({
      d: 'not date'
    })

    res = await request.get('/union-type')
    expect(res.body).toStrictEqual({
      a: 'AA',
      b: 'BB'
    })

    res = await request.get('/prop-serialize')
    expect(res.body).toStrictEqual({
      name: 'John',
      password: '*****',
      gender: 'Male',
      nickName: 'nick',
      address: 'New York, US'
    })

    res = await request.get('/assign-serialize')
    expect(res.body).toStrictEqual({
      direction: 'LEFT',
      user: {
        name: 'John',
        password: '*****',
        gender: 'Male',
        nickName: 'nick',
        address: 'New York, US'
      }
    })
  })
})
