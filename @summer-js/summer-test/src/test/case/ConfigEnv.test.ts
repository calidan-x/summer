import { getConfig } from '@summer-js/summer'
import { initTest, endTest } from '@summer-js/test'

describe('Config Test', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('test getConfig', async () => {
    const config = getConfig('TEST_CONFIG')
    expect(config).toStrictEqual({
      var1: 'VAR1Change',
      var2: ['A1', 'B2'],
      var3: 'VAR3'
    })
  })
})
