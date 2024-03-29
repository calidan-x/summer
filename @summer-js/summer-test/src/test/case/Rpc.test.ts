import { getInjectable } from '@summer-js/summer'
import { request } from '@summer-js/test'
import http from 'http'
import { UserRpcClientService } from '../rpc/client/UserRpcClientService'

describe('Test Rpc', () => {
  let server
  beforeAll(async () => {
    server = http
      .createServer(function (_req, res) {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.write('{"id":99,"name":"John"}')
        res.end()
      })
      .listen(8802)
  })

  afterAll(async () => {
    server.close()
  })

  test('should return right value', async () => {
    const userRpcClientService = getInjectable(UserRpcClientService)
    const user = await userRpcClientService.getUser(99, { name: 'test' })
    expect(user.id).toBe(99)
    expect(user.name).toBe('John')
  })

  test('should send right value', async () => {
    const result = await request.post(
      '/',
      { class: 'UserRpcService', method: 'getUser', data: [99] },
      {
        headers: { 'summer-rpc-access-key': 'xxxxx' }
      }
    )
    const user = result.body
    expect(user.id).toBe(99)
    expect(user.name).toBe('John')
  })
})
