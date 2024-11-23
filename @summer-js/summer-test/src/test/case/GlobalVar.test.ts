import '@summer-js/test'

const env = SUMMER_ENV

describe('Test Global Var', () => {
  test('env', async () => {
    expect(env).toBe('test')
  })
})
