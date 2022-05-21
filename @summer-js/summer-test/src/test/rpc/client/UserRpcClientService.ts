import { Rpc } from '@summer-js/summer'

interface User {
  id: number
  name: string
}

@Rpc('LOCAL_RPC', 'UserRpcService')
export class UserRpcClientService {
  getUser: (id: number) => Promise<User>
}
