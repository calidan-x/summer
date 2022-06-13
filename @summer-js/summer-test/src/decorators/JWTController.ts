import { Controller, createParamDecorator, Get } from '@summer-js/summer'
import jwt from 'jsonwebtoken'

export const Uid = createParamDecorator((ctx) => {
  const token = ctx.request.headers['authentication']
  try {
    const decoded = jwt.verify(token, 'xxxxxxxx')
    return decoded.uid
  } catch (e) {}
  return null
})

@Controller
export class JWTController {
  @Get('/userinfo')
  userinfo(@Uid uid: number) {
    return uid
  }
}
