import { RpcProvider } from '@summer-js/summer'

@RpcProvider
export class UserRpcService {
  getUser(id: number) {
    return { id, name: 'John' }
  }
  getUsers() {
    return [
      { id: 1, name: 'John' },
      { id: 2, name: 'Tom' }
    ]
  }
}
