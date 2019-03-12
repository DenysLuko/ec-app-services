import uuid from 'uuid/v4'
import cloneDeep from 'lodash.clonedeep'

import { mapMessage } from './messageMapper'

export const webSocketIdKey = Symbol('webSocketIdKey')
export const webSocketIsAliveKey = Symbol('webSocketIsAlive')

/**
 * {
 *   [uuid]: messageChannelId
 * }
 */
const messageChannelByOpenWebSocket = {

}

/**
 * {
 *   [messageChannelId]: [
 *     {
 *        userId: Int,
 *        webSocket: WebSocket
 *     }
 *   ]
 * }
 */
const openWebSocketsForMessageChannel = {

}

export const getMessageChannelByOpenWebSocketCopy = () => cloneDeep(messageChannelByOpenWebSocket)

export const getOpenWebSocketsForMessageChannelCopy = () => (
  cloneDeep(openWebSocketsForMessageChannel)
)

export const addWebSocket = (userId, messageChannelId, webSocket) => {
  const openSockets = openWebSocketsForMessageChannel[messageChannelId]

  if (openSockets) {
    const userAlreadyExists = openSockets.some(socket => socket.userId === userId)

    if (userAlreadyExists) {
      return false
    }
    openSockets.push({
      userId,
      webSocket
    })
  } else {
    openWebSocketsForMessageChannel[messageChannelId] = [
      {
        userId,
        webSocket
      }
    ]
  }

  const socketUUID = uuid()
  // eslint-disable-next-line no-param-reassign
  webSocket[webSocketIdKey] = socketUUID
  messageChannelByOpenWebSocket[socketUUID] = messageChannelId

  return true
}

export const getOpenWebSockets = (userId, messageChannelId) => {
  const openSockets = openWebSocketsForMessageChannel[messageChannelId]

  if (!openSockets) {
    return false
  }

  const otherUsersSockets = openSockets
    .filter(channel => channel.userId !== userId)
    .map(channel => channel.webSocket)

  if (!otherUsersSockets.length) {
    return false
  }

  return otherUsersSockets
}

export const removeOpenWebSocket = (webSocket) => {
  const webSocketUUID = webSocket[webSocketIdKey]

  const messageChannelId = messageChannelByOpenWebSocket[webSocketUUID]

  if (!messageChannelId) {
    return false
  }

  const openSockets = openWebSocketsForMessageChannel[messageChannelId]
    .filter(channel => channel.webSocket !== webSocket)

  if (!openSockets.length) {
    delete openWebSocketsForMessageChannel[messageChannelId]
  } else {
    openWebSocketsForMessageChannel[messageChannelId] = openSockets
  }

  delete messageChannelByOpenWebSocket[webSocketUUID]

  return true
}

export const saveMessageToDB = async (dateSent, msgContent, byUser, toChannel, dbClient) => {
  const saveQuery = {
    text: 'INSERT INTO message (date_sent, msg_content, by_user, to_channel) VALUES ($1,$2,$3,$4) RETURNING *;',
    values: [dateSent, msgContent, byUser, toChannel]
  }

  let saveResult

  try {
    saveResult = await dbClient.query(saveQuery)
  } catch (e) {
    // Log error
    return false
  }

  const {
    rows: [
      messageResponse
    ]
  } = saveResult

  return mapMessage(messageResponse)
}

export const checkForBrokenConnections = webSocketServerInstance => (
  setInterval(() => webSocketServerInstance.clients.forEach((webSocket) => {
    if (!webSocket[webSocketIsAliveKey]) {
      removeOpenWebSocket(webSocket)
      webSocket.terminate()
      return
    }

    // eslint-disable-next-line no-param-reassign
    webSocket[webSocketIsAliveKey] = false

    webSocket.ping()
  }), 1000 * 60)
)
