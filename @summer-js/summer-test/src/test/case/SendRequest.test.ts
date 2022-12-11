import { getInjectable } from '@summer-js/summer'
import '@summer-js/test'
import http from 'http'
import { SendRequestClient } from '../sendrequest/SendRequestClient'

describe('Test Send Request', () => {
  let server
  beforeAll(async () => {
    server = http
      .createServer(function (_req, res) {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.write('{"id":22,"name":"John"}')
        res.end()
      })
      .listen(8803)
  })

  afterAll(async () => {
    server.close()
  })

  test('should return right value', async () => {
    const sendRequestClient = getInjectable(SendRequestClient)
    const user = await sendRequestClient.getApi()
    expect(user.id).toBe(22)
    expect(user.name).toBe('John')
  })
})
