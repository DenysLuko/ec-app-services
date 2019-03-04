export const userInput = `
  input CreateUserInput {
    name: String
    lastName: String
    birthday: String
    photo: String
    username: String!
    email: String
    password: String
  }

  input UpdateUserInput {
    id: Int!
    name: String
    lastName: String
    birthday: String
    photo: String
    username: String
    email: String
    password: String
  }
`

export const userType = `
  type User {
    id: Int!
    name: String
    lastName: String
    birthday(format: String): String
    photo: String
    username: String
    email: String
    age: Int
  }
`

export const userQuery = `
  getUser(id: Int!): User
`

export const userMutation = `
  createUser(input: CreateUserInput!): User
  updateUser(input: UpdateUserInput!): User
`
