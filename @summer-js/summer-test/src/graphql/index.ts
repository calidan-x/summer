import { buildSchema } from 'graphql'

export const schema = buildSchema(`
type Query {
  users(id: Int): [User]
  books: [String]
}

type User {
  id: Int
  name: String
  age: Int
}

input MessageInput {
  content: String
  author: String
}

type Message {
  id: ID!
  content: String
  author: String
}

type Mutation {
  createMessage(input: MessageInput): Message
}

`)
