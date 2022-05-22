import { Rpc } from '@summer-js/summer'
import { QueryUser } from './QueryUser'

class User {
  id: number
  name: string
}

@Rpc('LOCAL_RPC', 'UserRpcService')
export class UserRpcClientService {
  getUser: (id: number, queryUser: QueryUser) => Promise<User>
  getUsers: () => Promise<User[]>
}
