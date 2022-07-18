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
    expect(res.jsonBody).toStrictEqual({
      date: '2022-07-18',
      dateTime: '2022-07-18 23:52:40',
      direction: 'LEFT',
      timeStamp: 1658159560321
    })

    res = await request.get('/class-extends-serialize')
    expect(res.jsonBody).toStrictEqual({
      date: '2022-07-18',
      dateTime: '2022-07-18 23:52:40',
      direction: 'LEFT',
      timeStamp: 1658159560321,
      count: 123
    })

    res = await request.get('/object-serialize')
    expect(res.jsonBody).toStrictEqual({
      str: 'str',
      direction: 'LEFT'
    })
  })
})
