import { RpcClient } from '@summer-js/summer'
import { QueryUser } from './QueryUser'

export class User {
  id: number
  name: string
}

@RpcClient('LOCAL_RPC', 'UserRpcService')
export class UserRpcClientService {
  getUser: (id: number, queryUser: QueryUser) => Promise<User>
  getUsers: () => Promise<User[]>
  error: () => Promise<User[]>
}
