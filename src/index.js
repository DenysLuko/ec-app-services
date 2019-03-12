
import {
  Client,
  types
} from 'pg'
import express from 'express'

import { startGraphQLServer } from './uiServer'
import { startChatServer } from './chatServer'

types.setTypeParser(20, parseInt)

const dbClient = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
})

const setupAppServer = async (expressApp, db) => {
  const httpServer = await startGraphQLServer(expressApp, db)
  startChatServer(httpServer, db)
}

setupAppServer(express(), dbClient)
