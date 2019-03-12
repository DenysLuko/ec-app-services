import WebSocket from 'ws'

import {
  webSocketIsAliveKey,
  checkForBrokenConnections,
  addWebSocket,
  saveMessageToDB,
  getOpenWebSockets,
  removeOpenWebSocket
} from './messageHandler'

export const startChatServer = (httpServer, dbClient) => {
  const webSocketServer = new WebSocket.Server({ server: httpServer })

  checkForBrokenConnections(webSocketServer)

  webSocketServer.on('connection', (webSocket) => {
    // eslint-disable-next-line no-param-reassign
    webSocket[webSocketIsAliveKey] = true

    /**
     * message: {
     *   type: 'JOIN',
     *   body: {
     *     byUser: Int,
     *     toChannel: Int
     *   },
     *   accessToken: JSONWebToken
     * }
     *
     * message: {
     *   type: 'NEW_MESSAGE',
     *   body: {
     *     byUser: Int,
     *     toChannel: Int,
     *     dateSent: ISODate,
     *     msgContent: String
     *   },
     *   accessToken: JSONWebToken
     * }
     *
     * message: {
     *   type: 'MESSAGE',
     *   body: {
     *     id: Int,
     *     byUser: Int,
     *     toChannel: Int,
     *     dateSent: ISODate,
     *     msgContent: String,
     *     status: String
     *   }
     * }
     */
    webSocket.on('message', async (data) => {
      let parsedMessage

      try {
        parsedMessage = JSON.parse(data)
      } catch (e) {
        // TODO: log error
      }

      const {
        type,
        body
      } = parsedMessage

      if (type === 'JOIN') {
        const {
          byUser,
          toChannel
        } = body

        addWebSocket(byUser, toChannel, webSocket)
      } else if (type === 'NEW_MESSAGE') {
        const {
          byUser,
          toChannel,
          content,
          dateSent
        } = body

        const savedMessage = await saveMessageToDB(dateSent, content, byUser, toChannel, dbClient)
        // console.log(messages)
        const openReceiverSocketsInThisChannel = getOpenWebSockets(byUser, toChannel)

        if (openReceiverSocketsInThisChannel) {
          openReceiverSocketsInThisChannel.forEach((receiverWebSocket) => {
            receiverWebSocket.send(JSON.stringify({
              type: 'MESSAGE',
              body: {
                ...savedMessage
              }
            }))
          })
        } else {
          // TODO: Send out notifications
        }
      }
    })

    webSocket.on('close', () => {
      removeOpenWebSocket(webSocket)
    })

    webSocket.on('error', () => {
      removeOpenWebSocket(webSocket)
      // TODO: Log error
    })

    webSocket.on('pong', () => {
      // eslint-disable-next-line no-param-reassign
      webSocket[webSocketIsAliveKey] = true
    })
  })
}
