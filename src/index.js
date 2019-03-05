import '@babel/polyfill'

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

require('dotenv').config()

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
  schema,
  rootValue: root,
  graphiql: true,
  context: client,
  formatError: err => ({
    ...err,
    message: JSON.parse(err.message).message,
    error: JSON.parse(err.message)
  })
}))

serverInstance.use('/api/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: false,
  context: client
}))

serverInstance.get('/', (req, res) => {
  res.send('hello world')
})

const startGraphQLServer = async (serverArg, clientArg) => {
  try {
    await clientArg.connect()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('DB error: ', e)
    return
  }

  serverArg
    .listen(process.env.APP_SERVICE_PORT)
    .on('listening', () => {
      // eslint-disable-next-line no-console
      console.log(`Example app listening on port ${process.env.APP_SERVICE_PORT}!`)
    })
    .on('error', async (err) => {
      // eslint-disable-next-line no-console
      console.log('Server error.')
      // eslint-disable-next-line no-console
      console.log(err)
      await clientArg.disconnect()
    })
    .on('close', async () => {
      // eslint-disable-next-line no-console
      console.log('Server closing.')
      await clientArg.disconnect()
    })
}

startGraphQLServer(serverInstance, client)
