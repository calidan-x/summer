import { Middleware, Context } from '@summer-js/summer'

// @Middleware({
//   order: 0
// })
// export class ErrorMiddleware {
//   async process(ctx: Context, next: any) {
//     try {
//       await next()
//     } catch (err) {
//       ctx.response.statusCode = 500
//       ctx.response.body = 'Server Error'
//     }
//   }
// }
