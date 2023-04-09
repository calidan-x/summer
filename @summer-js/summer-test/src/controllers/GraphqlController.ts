import { Controller, Post, Body } from '@summer-js/summer'
import { handle, GraphQLRequest } from '@summer-js/graphql'
import { schema } from '../graphql'

@Controller
export class GraphqlController {
  @Post('/graphql')
  graphql(@Body req: GraphQLRequest) {
    var rootValue = {
      users: (_query: any) => {
        // data can read from DB here
        return [
          {
            id: 1,
            name: 'Tom',
            age: 123
          }
        ]
      },
      books: () => ['Book1', 'Book2', 'Book3'],
      createMessage({ input }) {
        input.id = 1
        return input
      }
    }
    return handle({ source: req.query, schema, rootValue })
  }
}
