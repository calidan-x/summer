import { getInjectablesByTags } from '@summer-js/summer'

describe('Test service Tags', () => {
  test('should return services', async () => {
    const res = getInjectablesByTags(['pet'])
    expect(res.length).toBe(2)
  })
})
