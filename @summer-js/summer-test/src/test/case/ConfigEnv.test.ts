import { getEnvConfig } from '@summer-js/summer'
import '@summer-js/test'

describe('Config Test', () => {
  test('test getConfig', async () => {
    const config = getEnvConfig('TEST_CONFIG')
    expect(config).toStrictEqual({
      var1: 'VAR1Change',
      var2: ['A1', 'B2'],
      var3: 'VAR3'
    })
  })
})
