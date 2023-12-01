import { request } from '@summer-js/test'

describe('Test Serialization', () => {
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
