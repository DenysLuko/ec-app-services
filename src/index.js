import "@babel/polyfill"

require('dotenv').config()

import {
  Client,
  types
} from 'pg'
import express from 'express'
import graphqlHTTP from 'express-graphql'
import { buildSchema } from 'graphql'
import {
  userInput,
  userType,
  userQuery,
  userMutation,
  userResolver
} from './user'
import {
  journeyInput,
  journeyType,
  journeyQuery,
  journeyMutation,
  journeyResolver
} from './journey'
import {
  deliveryInput,
  deliveryType,
  deliveryQuery,
  deliveryMutation,
  deliveryResolver
} from './delivery'

types.setTypeParser(20, parseInt)

const serverInstance = express()

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
})

const schema = buildSchema(`
  ${userInput}
  ${userType}
  ${journeyInput}
  ${journeyType}
  ${deliveryInput}
  ${deliveryType}
  type Query {
    ${userQuery}
    ${journeyQuery}
    ${deliveryQuery}
  }
  type Mutation {
    ${userMutation}
    ${journeyMutation}
    ${deliveryMutation}
  }
`)

const root = {
  ...userResolver,
  ...journeyResolver,
  ...deliveryResolver
}

serverInstance.use('/api/graphqldebug', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
  context: client
}))

serverInstance.use('/api/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: false,
  context: client
}))

serverInstance.get('/', function (req, res) {
  res.send('hello world')
})

const startGraphQLServer = async (serverInstance, client) => {
  await client.connect()

  serverInstance
    .listen(process.env.APP_SERVICE_PORT)
    .on('listening', () => {
      console.log(`Example app listening on port ${process.env.APP_SERVICE_PORT}!`)
    })
    .on('error', async (err) => {
      console.log('Server error.')
      console.log(err)
      await client.disconnect()
    })
    .on('close', async () => {
      console.log('Server closing.')
      await client.disconnect()
    })

}

startGraphQLServer(serverInstance, client)
