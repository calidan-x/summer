import { Controller, Get } from '@summer-js/summer'
import { UserRpcClientService } from './client/UserRpcClientService'

@Controller
export class UserRpcController {
  userRpcClientService: UserRpcClientService

  @Get('/rpc/user')
  async getUser() {
    return await this.userRpcClientService.getUser(99, { name: '' })
  }

  @Get('/rpc/users')
  async getUsers() {
    return await this.userRpcClientService.getUsers()
  }

  @Get('/rpc/error')
  async error() {
    return await this.userRpcClientService.error()
  }
}
