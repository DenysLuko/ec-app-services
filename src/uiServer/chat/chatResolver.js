import {
  mapMessageChannels,
  mapMessages,
  mapMessageChannelAndMessages
} from './chatMapper'
import {
  generatePlaceholders,
  zipInputObject,
  camelCaseToSnakeCase,
  generateQueryError
} from '../utils'

const buildGetMessageChannelByIdQuery = id => ({
  text: 'SELECT * FROM message_channel_view WHERE message_channel_id = $1;',
  values: [id]
})

const buildGetMessageChannelsForUserQuery = id => ({
  text: 'SELECT * FROM message_channel_view WHERE message_channel_owner = $1;',
  values: [id]
})

const buildGetMessagesForMessageChannelQuery = (ids = []) => {
  let counter = 1

  const whereClause = ids.map(() => `message_to_channel = $${counter++}`).join(' OR ')

  return {
    text: `SELECT DISTINCT ON(message_to_channel) * FROM message_view WHERE ${whereClause} ORDER BY message_to_channel, message_date_sent desc;`,
    values: [...ids]
  }
}

const buildCreateMessageChannelQuery = (columnNames = [], columnValues = []) => ({
  text: `INSERT INTO message_channel (${columnNames.join(', ')}) VALUES (${generatePlaceholders(columnValues.length)}) RETURNING *;`,
  values: [...columnValues]
})

const buildCreateMessageChannelUserQuery = (columnNames = [], columnValues = []) => ({
  text: `INSERT INTO message_channel_user (${columnNames.join(', ')}) VALUES (${generatePlaceholders(columnValues.length)}) RETURNING *;`,
  values: [...columnValues]
})

export const chatResolver = {
  getMessageChannelsForUser: async ({ id }, client) => {
    const getMessageChannelsQuery = buildGetMessageChannelsForUserQuery(id)

    let getMessageChannelsResult

    try {
      getMessageChannelsResult = await client.query(getMessageChannelsQuery)
    } catch (originalError) {
      throw generateQueryError('Query Error', getMessageChannelsQuery, originalError)
    }

    const {
      rows: messageChannelsResponse
    } = getMessageChannelsResult

    if (!messageChannelsResponse.length) {
      return []
    }

    const mappedMessageChannels = mapMessageChannels(messageChannelsResponse)

    const messageChannelIds = mappedMessageChannels
      .map(({ id: messageChannelId }) => messageChannelId)

    const getMessagesQuery = buildGetMessagesForMessageChannelQuery(messageChannelIds)

    let getMessagesResult

    try {
      getMessagesResult = await client.query(getMessagesQuery)
    } catch (originalError) {
      throw generateQueryError('Query Error', getMessagesQuery, originalError)
    }

    const {
      rows: messagesResponse
    } = getMessagesResult

    const mappedMessages = mapMessages(messagesResponse)

    return mapMessageChannelAndMessages(
      mappedMessageChannels,
      mappedMessages
    )
  },

  createMessageChannel: async ({ input }, client) => {
    const {
      messageChannelUsers,
      ...messageChannelInput
    } = input

    const snakeCasedInput = camelCaseToSnakeCase(messageChannelInput)

    const {
      columnNames,
      columnValues
    } = zipInputObject(snakeCasedInput)

    const createMessageChannelQuery = buildCreateMessageChannelQuery(columnNames, columnValues)

    let createMessageChannelResponse

    try {
      createMessageChannelResponse = await client.query(createMessageChannelQuery)
    } catch (originalError) {
      throw generateQueryError('Query Error', createMessageChannelQuery, originalError)
    }

    const {
      rows: [
        {
          id: newMessageChannelId
        }
      ] = [{}]
    } = createMessageChannelResponse

    const messageChannelUsersToCreate = messageChannelUsers.concat(messageChannelInput.owner)

    await Promise.all(messageChannelUsersToCreate.concat().map(async (messageChannelUser) => {
      const createMessageChannelUserQuery = buildCreateMessageChannelUserQuery(
        ['msg_user', 'msg_channel'],
        [messageChannelUser, newMessageChannelId]
      )

      try {
        await client.query(createMessageChannelUserQuery)
      } catch (originalError) {
        throw generateQueryError('Query Error', createMessageChannelUserQuery, originalError)
      }

      return true
    }))

    const getMessageChannelQuery = buildGetMessageChannelByIdQuery(newMessageChannelId)

    let getMessageChannelResult

    try {
      getMessageChannelResult = await client.query(getMessageChannelQuery)
    } catch (originalError) {
      throw generateQueryError('Query Error', getMessageChannelQuery, originalError)
    }

    const {
      rows: messageChannelResponse
    } = getMessageChannelResult

    return mapMessageChannels(messageChannelResponse).pop()
  }
}
