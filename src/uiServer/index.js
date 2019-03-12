import '@babel/polyfill'

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

export const startGraphQLServer = async (expressApp, clientArg) => {
  expressApp.use('/api/graphqldebug', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
    context: clientArg,
    formatError: err => ({
      ...err,
      message: JSON.parse(err.message).message,
      error: JSON.parse(err.message)
    })
  }))

  expressApp.use('/api/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: false,
    context: clientArg
  }))

  expressApp.get('/', (req, res) => {
    res.send('hello world')
  })

  await clientArg.connect()

  return expressApp
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
