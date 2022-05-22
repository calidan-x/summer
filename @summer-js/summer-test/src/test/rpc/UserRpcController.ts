import { Controller, Get, Inject } from '@summer-js/summer'
import { UserRpcClientService } from './client/UserRpcClientService'

@Controller
export class UserRpcController {
  @Inject
  userRpcClientService: UserRpcClientService

  @Get('/rpc/user')
  async getUser() {
    return await this.userRpcClientService.getUser(99, { name: '' })
  }

  @Get('/rpc/users')
  async getUsers() {
    return await this.userRpcClientService.getUsers()
  }
}
