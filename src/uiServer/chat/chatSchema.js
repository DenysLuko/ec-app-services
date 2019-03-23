export const chatInput = `
  input MessageChannelInput {
    owner: Int!
    name: String
    backgroundImg: String
    messageChannelUsers: [Int]!
  }
`

export const chatType = `
  type MessageChannel {
    id: Int!
    owner: Int!
    name: String
    backgroundImg: String
    messages: [Message]
    messageChannelUsers: [User]!
  }

  type Message {
    id: Int!
    dateSent(format: String): String!
    msgContent: String!
    byUser: User!
    status: String!
  }
`

export const chatQuery = `
  getMessageChannelsForUser(id: Int!): [MessageChannel]!
`

export const chatMutation = `
  createMessageChannel(input: MessageChannelInput!): MessageChannel!
`
