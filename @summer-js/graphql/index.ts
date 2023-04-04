import { ResponseError } from '@summer-js/summer'
import { graphql, parse, GraphQLArgs } from 'graphql'
import { validate } from 'graphql/validation'

export const handle = async (args: GraphQLArgs) => {
  try {
    const ast = parse(args.source)
    const result = validate(args.schema, ast)
    if (result.length > 0) {
      throw new ResponseError(400, result)
    }
  } catch (err: any) {
    throw new ResponseError(400, err)
  }

  try {
    return await graphql(args)
  } catch (err) {
    throw new ResponseError(400, err)
  }
}

export class GraphQLRequest {
  @_PropDeclareType([String])
  query: string
}
