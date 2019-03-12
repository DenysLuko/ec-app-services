import {
  webSocketIdKey,
  webSocketIsAliveKey,
  checkForBrokenConnections,
  addWebSocket,
  saveMessageToDB,
  getOpenWebSockets,
  removeOpenWebSocket,
  getMessageChannelByOpenWebSocketCopy,
  getOpenWebSocketsForMessageChannelCopy,
  // eslint-disable-next-line import/named
  __RewireAPI__ as messageHandlerRewireAPI
} from './messageHandler'

describe('messageHandler', () => {
  const mockSocketA = {
    id: 'socket-a'
  }
  const mockSocketB = {
    id: 'socket-b'
  }
  const mockSocketC = {
    id: 'socket-c'
  }

  beforeEach(() => {
    messageHandlerRewireAPI.__Rewire__('messageChannelByOpenWebSocket', {})
    messageHandlerRewireAPI.__Rewire__('openWebSocketsForMessageChannel', {})
  })

  describe('addWebSocket', () => {
    it('adds the correct entry to the openWebSocketsForMessageChannel and returns true', () => {
      expect(addWebSocket(1, 2, mockSocketA)).toEqual(true)
      expect(getOpenWebSocketsForMessageChannelCopy()).toHaveProperty('2', [
        {
          userId: 1,
          webSocket: expect.objectContaining(mockSocketA)
        }
      ])
    })

    it('adds no second entry to the openWebSocketsForMessageChannel and returns false if a given user already has one', () => {
      expect(addWebSocket(1, 2, mockSocketA)).toEqual(true)
      expect(addWebSocket(1, 2, mockSocketA)).toEqual(false)
      expect(getOpenWebSocketsForMessageChannelCopy()).toHaveProperty('2', [
        {
          userId: 1,
          webSocket: expect.objectContaining(mockSocketA)
        }
      ])
    })

    it('adds a second entry to the openWebSocketsForMessageChannel and returns true if a given user has no entry', () => {
      expect(addWebSocket(1, 2, mockSocketA)).toEqual(true)
      expect(addWebSocket(2, 2, mockSocketB)).toEqual(true)
      expect(getOpenWebSocketsForMessageChannelCopy()).toHaveProperty('2', [
        {
          userId: 1,
          webSocket: expect.objectContaining(mockSocketA)
        },
        {
          userId: 2,
          webSocket: expect.objectContaining(mockSocketB)
        }
      ])
    })

    it('assigns a uuid to websocket instance', () => {
      expect(addWebSocket(1, 2, mockSocketA)).toEqual(true)
      expect(mockSocketA[webSocketIdKey]).toEqual(expect.any(String))
    })

    it('assigns a mapping between socket uuid and message channel', () => {
      expect(addWebSocket(1, 2, mockSocketA)).toEqual(true)

      const uuid = mockSocketA[webSocketIdKey]

      expect(getMessageChannelByOpenWebSocketCopy()).toEqual({
        [uuid]: 2
      })
    })
  })

  describe('getOpenWebSockets', () => {
    it('returns false if there are no open websockets for a given message channel', () => {
      expect(getOpenWebSockets(1, 2)).toEqual(false)
    })

    it('returns false if there a given users socket is the only open socket for a given channel', () => {
      addWebSocket(1, 2, mockSocketA)

      expect(getOpenWebSockets(1, 2)).toEqual(false)
    })

    it('returns an array of open sockets for a given channel with different user ids', () => {
      addWebSocket(1, 2, mockSocketA)
      addWebSocket(2, 2, mockSocketB)
      addWebSocket(3, 2, mockSocketC)

      expect(getOpenWebSockets(1, 2)).toEqual([
        expect.objectContaining(mockSocketB),
        expect.objectContaining(mockSocketC)
      ])
    })
  })

  describe('removeOpenWebSocket', () => {
    it('should return false if the websocket has already been removed', () => {
      addWebSocket(1, 2, mockSocketA)
      removeOpenWebSocket(mockSocketA)

      expect(removeOpenWebSocket(mockSocketA)).toEqual(false)
    })

    it('should delete openWebSocketsForMessageChannel entry if the removed websocket was the last', () => {
      addWebSocket(1, 2, mockSocketA)
      removeOpenWebSocket(mockSocketA)

      expect(getOpenWebSocketsForMessageChannelCopy()).not.toHaveProperty('2')
    })

    it('should remove the websocket from the openWebSocketsForMessageChannel but leave other websocket', () => {
      addWebSocket(1, 2, mockSocketA)
      addWebSocket(2, 2, mockSocketB)
      removeOpenWebSocket(mockSocketB)

      expect(getOpenWebSocketsForMessageChannelCopy()).toHaveProperty('2', [
        {
          userId: 1,
          webSocket: expect.objectContaining(mockSocketA)
        }
      ])
    })

    it('should remove the messageChannelByOpenWebSocket entry', () => {
      addWebSocket(1, 2, mockSocketA)
      addWebSocket(2, 2, mockSocketB)
      removeOpenWebSocket(mockSocketA)

      expect(getMessageChannelByOpenWebSocketCopy()).not.toHaveProperty(mockSocketA[webSocketIdKey])
    })
  })

  describe('saveMessageToDB', () => {
    const mockSaveMessage = {
      id: 1,
      date_sent: '2019-03-10T17:10:53.556Z',
      msg_content: 'Some message',
      by_user: 1,
      to_channel: 2
    }

    const mapperResult = {
      id: 1,
      dateSent: '2019-03-10T17:10:53.556Z',
      msgContent: 'Some message',
      byUser: 1,
      toChannel: 2
    }

    const mockClient = {
      query: jest.fn(() => ({
        rows: [
          mockSaveMessage
        ]
      }))
    }

    const mockMapper = jest.fn(() => mapperResult)

    beforeAll(() => {
      messageHandlerRewireAPI.__Rewire__('mapMessage', mockMapper)
    })

    afterAll(() => {
      messageHandlerRewireAPI.__ResetDependency__('mapMessage')
    })

    it('should call the dbClient with the correct query', async () => {
      await saveMessageToDB('2019-03-10T17:10:53.556Z', 'Some message', 1, 2, mockClient)

      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'INSERT INTO message (date_sent, msg_content, by_user, to_channel) VALUES ($1,$2,$3,$4) RETURNING *;',
        values: ['2019-03-10T17:10:53.556Z', 'Some message', 1, 2]
      })
    })

    it('should return false if the query fails', () => {
      mockClient.query.mockRejectedValueOnce(new Error('Some error'))

      expect(saveMessageToDB('2019-03-10T17:10:53.556Z', 'Some message', 1, 2, mockClient))
        .resolves.toEqual(false)
    })

    it('should call the mapper with the response', async () => {
      await saveMessageToDB('2019-03-10T17:10:53.556Z', 'Some message', 1, 2, mockClient)

      expect(mockMapper).toHaveBeenCalledWith(mockSaveMessage)
    })

    it('should return the mapped result', () => {
      expect(saveMessageToDB('2019-03-10T17:10:53.556Z', 'Some message', 1, 2, mockClient))
        .resolves.toEqual(mapperResult)
    })
  })

  describe('checkForBrokenConnections', () => {
    let mockWebSocketA
    let mockWebSocketB
    let mockWebSockerServerInstance

    beforeEach(() => {
      jest.useFakeTimers()
      mockWebSocketA = {
        terminate: jest.fn(),
        ping: jest.fn(),
        [webSocketIsAliveKey]: true
      }
      mockWebSocketB = {
        terminate: jest.fn(),
        ping: jest.fn(),
        [webSocketIsAliveKey]: true
      }
      mockWebSockerServerInstance = {
        clients: [
          mockWebSocketA,
          mockWebSocketB
        ]
      }
      addWebSocket(1, 2, mockWebSocketA)
      addWebSocket(2, 2, mockWebSocketB)
    })

    it('should periodically set webSocketIsAliveKey property to false if it is initially true and then call ping', () => {
      checkForBrokenConnections(mockWebSockerServerInstance)

      jest.advanceTimersByTime(60001)

      expect(mockWebSocketA[webSocketIsAliveKey]).toEqual(false)
      expect(mockWebSocketB[webSocketIsAliveKey]).toEqual(false)
      expect(mockWebSocketA.ping).toHaveBeenCalled()
      expect(mockWebSocketB.ping).toHaveBeenCalled()
    })

    it('should remove websockets from internal store and call terminate if the webSocketIsAliveKey property is initially false', () => {
      mockWebSocketA[webSocketIsAliveKey] = false

      checkForBrokenConnections(mockWebSockerServerInstance)

      jest.advanceTimersByTime(60000)

      expect(getOpenWebSocketsForMessageChannelCopy()).toHaveProperty('2', [
        {
          userId: 2,
          webSocket: expect.objectContaining(mockWebSocketB)
        }
      ])
      expect(getMessageChannelByOpenWebSocketCopy())
        .not.toHaveProperty(mockWebSocketA[webSocketIdKey])
      expect(mockWebSocketA.terminate).toHaveBeenCalled()
    })

    it('should not ping a terminated socket', () => {
      mockWebSocketA[webSocketIsAliveKey] = false

      checkForBrokenConnections(mockWebSockerServerInstance)

      jest.advanceTimersByTime(60000)

      expect(mockWebSocketA.ping).not.toHaveBeenCalled()
    })
  })
})
