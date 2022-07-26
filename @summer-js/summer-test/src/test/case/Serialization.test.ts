import { initTest, endTest, request } from '@summer-js/test'

describe('Test Serialization', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('test serialization', async () => {
    let res = await request.get('/serialize')
    expect(res.body).toStrictEqual({
      direction: 'LEFT'
    })

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
  })
})
