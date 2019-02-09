export const userInput = `
  input NewUserInput {
    name: String
    lastName: String
    birthday: String
    photo: String
    username: String!
    email: String
    password: String
  }

  input ExistingUserInput {
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
  user(id: String): User
`

export const userMutation = `
  createUser(input: NewUserInput!): User
  updateUser(id: Int!, input: ExistingUserInput!): User
`
