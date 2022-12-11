import { request } from '@summer-js/test'

describe('Config Test', () => {
  test('test set cookie', async () => {
    let result = await request.get('/cookie/set')
    expect(result.headers['Set-Cookie'][0]).toEqual('TestCookie=Value')
    expect(result.headers['Set-Cookie'][1]).toEqual('TestCookie2=Value2')
  })

  test('test clear cookie', async () => {
    let result = await request.get('/cookie/clear')
    expect(result.headers['Set-Cookie'][0]).toEqual('TestCookie=; Max-Age=0')
  })
})
