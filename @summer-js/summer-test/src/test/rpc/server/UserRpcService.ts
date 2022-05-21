import { RpcProvider } from '@summer-js/summer'

@RpcProvider
export class UserRpcService {
  getUser(id: number) {
    return { id, name: 'John' }
  }
}
