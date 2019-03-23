import {
  mapMessageChannel,
  mapMessage,
  mapMessageChannels,
  mapMessages,
  mapMessageChannelAndMessages,
  // eslint-disable-next-line import/named
  __RewireAPI__ as chatMapperRewireAPI
} from './chatMapper'

describe('chatMapper', () => {
  let mockMapUser
  let mockMapUserResult

  beforeEach(() => {
    mockMapUserResult = {
      id: 123,
      name: 'some-name'
    }

    mockMapUser = jest.fn(() => mockMapUserResult)

    chatMapperRewireAPI.__Rewire__('mapUser', mockMapUser)
  })

  describe('mapMessageChannels', () => {
    let mockMessageChannelPartA
    let mockMessageChannelPartB

    beforeEach(() => {
      mockMessageChannelPartA = {
        message_channel_id: 1,
        message_channel_owner: 1,
        message_channel_name: 'Chat 1',
        message_channel_background_img: 'blueSky.jpg',
        message_channel_user_id: 1,
        message_channel_user_username: 'denyslu',
        message_channel_user_name: 'Denys',
        message_channel_user_last_name: 'Lutsenko',
        message_channel_user_photo: 'photo.jpg',
        message_channel_user_email: 'denys.lu@gmail.com',
        message_channel_user_birthday: new Date('1989-01-05T00:00:00.000Z'),
        message_channel_user_age: 30
      }

      mockMessageChannelPartB = {
        message_channel_id: 1,
        message_channel_owner: 1,
        message_channel_name: 'Chat 1',
        message_channel_background_img: 'blueSky.jpg',
        message_channel_user_id: 2,
        message_channel_user_username: 'ulchik',
        message_channel_user_name: 'Ulzhan',
        message_channel_user_last_name: 'Seitmurat',
        message_channel_user_photo: 'photo.jpg',
        message_channel_user_email: 'www.ulzhan@gmail.com',
        message_channel_user_birthday: new Date('1991-12-03T00:00:00.000Z'),
        message_channel_user_age: 27
      }
    })

    it('should call mapUser with the correct arguments', () => {
      mapMessageChannels([
        mockMessageChannelPartA,
        mockMessageChannelPartB
      ])

      expect(mockMapUser).toHaveBeenCalledWith({
        id: 1,
        name: 'Denys',
        lastName: 'Lutsenko',
        username: 'denyslu',
        email: 'denys.lu@gmail.com',
        photo: 'photo.jpg',
        birthday: new Date('1989-01-05T00:00:00.000Z'),
        age: 30
      })

      expect(mockMapUser).toHaveBeenCalledWith({
        id: 2,
        name: 'Ulzhan',
        lastName: 'Seitmurat',
        username: 'ulchik',
        email: 'www.ulzhan@gmail.com',
        photo: 'photo.jpg',
        birthday: new Date('1991-12-03T00:00:00.000Z'),
        age: 27
      })
    })

    it('should return all message channels and the associated users', () => {
      expect(mapMessageChannels([
        mockMessageChannelPartA,
        mockMessageChannelPartB
      ])).toEqual([{
        id: 1,
        owner: 1,
        name: 'Chat 1',
        backgroundImg: 'blueSky.jpg',
        messageChannelUsers: [
          mockMapUserResult,
          mockMapUserResult
        ]
      }])
    })
  })

  describe('mapMessageChannel', () => {
    let mockMessageChannelResponse
    let mapperResult

    beforeEach(() => {
      mockMessageChannelResponse = {
        message_channel_id: 1,
        message_channel_name: 'Chat 1',
        message_channel_owner: 1,
        message_channel_background_img: 'background.jpg'
      }

      mapperResult = mapMessageChannel(mockMessageChannelResponse)
    })

    it('should return the messageChannelId', () => {
      expect(mapperResult).toHaveProperty('messageChannelId', 1)
    })

    it('should return the messageChannelOwner', () => {
      expect(mapperResult).toHaveProperty('messageChannelOwner', 1)
    })

    it('should return the messageChannelName', () => {
      expect(mapperResult).toHaveProperty('messageChannelName', 'Chat 1')
    })

    it('should return the messageChannelBackgroundImg', () => {
      expect(mapperResult).toHaveProperty('messageChannelBackgroundImg', 'background.jpg')
    })
  })

  describe('mapMessages', () => {
    let mockMessageA
    let mockMessageB

    beforeEach(() => {
      mockMessageA = {
        message_id: 123,
        message_date_sent: new Date('2018-12-23 10:14:21'),
        message_msg_content: 'Where are you?',
        message_status: 'readable',
        message_to_channel: 1,
        message_user_id: 1,
        message_user_name: 'Denys',
        message_user_last_name: 'Lutsenko',
        message_user_username: 'denyslu',
        message_user_email: 'denys.lu@gmail.com',
        message_user_photo: 'photo.jpg',
        message_user_birthday: new Date('1989-01-05T00:00:00.000Z'),
        message_user_age: 30
      }

      mockMessageB = {
        message_id: 124,
        message_date_sent: new Date('2018-12-23 10:14:22'),
        message_msg_content: 'hello?',
        message_status: 'readable',
        message_to_channel: 1,
        message_user_id: 1,
        message_user_name: 'Denys',
        message_user_last_name: 'Lutsenko',
        message_user_username: 'denyslu',
        message_user_email: 'denys.lu@gmail.com',
        message_user_photo: 'photo.jpg',
        message_user_birthday: new Date('1989-01-05T00:00:00.000Z'),
        message_user_age: 30
      }
    })

    it('should call mapUser with the correct arguments', () => {
      mapMessages([mockMessageA, mockMessageB])

      expect(mockMapUser).toHaveBeenCalledWith({
        id: 1,
        name: 'Denys',
        lastName: 'Lutsenko',
        username: 'denyslu',
        email: 'denys.lu@gmail.com',
        photo: 'photo.jpg',
        birthday: new Date('1989-01-05T00:00:00.000Z'),
        age: 30
      })
    })

    it('should map messages and expand the user field', () => {
      expect(mapMessages([mockMessageA, mockMessageB])).toEqual([
        {
          id: 123,
          dateSent: expect.any(Function),
          msgContent: 'Where are you?',
          status: 'readable',
          toChannel: 1,
          byUser: mockMapUserResult
        },
        {
          id: 124,
          dateSent: expect.any(Function),
          msgContent: 'hello?',
          status: 'readable',
          toChannel: 1,
          byUser: mockMapUserResult
        }
      ])
    })

    it('should allow dates to be formatted', () => {
      const [
        mappedMessageA,
        mappedMessageB
      ] = mapMessages([mockMessageA, mockMessageB])

      expect(mappedMessageA.dateSent({ format: 'YYYY' })).toEqual('2018')
      expect(mappedMessageA.dateSent({ format: 'YYYY MMM DD' })).toEqual('2018 Dec 23')
      expect(mappedMessageA.dateSent({ format: 'DD-MM-YYYY' })).toEqual('23-12-2018')
      expect(mappedMessageB.dateSent({ format: 'YYYY' })).toEqual('2018')
      expect(mappedMessageB.dateSent({ format: 'YYYY MMM DD' })).toEqual('2018 Dec 23')
      expect(mappedMessageB.dateSent({ format: 'DD-MM-YYYY' })).toEqual('23-12-2018')
    })
  })

  describe('mapMessage', () => {
    let mockMessageResponse
    let mapperResult

    beforeEach(() => {
      mockMessageResponse = {
        message_id: 123,
        message_date_sent: new Date('2018-12-23 10:14:21'),
        message_msg_content: 'Where are you?',
        message_status: 'readable',
        message_to_channel: 1,
        message_user_id: 1,
        message_user_name: 'Denys',
        message_user_last_name: 'Lutsenko',
        message_user_username: 'denyslu',
        message_user_email: 'denys.lu@gmail.com',
        message_user_photo: 'photo.jpg',
        message_user_birthday: new Date('1989-01-05T00:00:00.000Z'),
        message_user_age: 30
      }

      mapperResult = mapMessage(mockMessageResponse)
    })

    it('should return the id', () => {
      expect(mapperResult).toHaveProperty('id', 123)
    })

    it('should allow dateSent to be formatted', () => {
      expect(mapperResult.dateSent({ format: 'YYYY' })).toEqual('2018')
      expect(mapperResult.dateSent({ format: 'YYYY MMM DD' })).toEqual('2018 Dec 23')
      expect(mapperResult.dateSent({ format: 'DD-MM-YYYY' })).toEqual('23-12-2018')
    })

    it('should return the msgContent', () => {
      expect(mapperResult).toHaveProperty('msgContent', 'Where are you?')
    })

    it('should return the status', () => {
      expect(mapperResult).toHaveProperty('status', 'readable')
    })

    it('should return the toChannel', () => {
      expect(mapperResult).toHaveProperty('toChannel', 1)
    })

    it('should call mapUser with the correct arguments', () => {
      expect(mockMapUser).toHaveBeenCalledWith({
        id: 1,
        name: 'Denys',
        lastName: 'Lutsenko',
        username: 'denyslu',
        email: 'denys.lu@gmail.com',
        photo: 'photo.jpg',
        birthday: new Date('1989-01-05T00:00:00.000Z'),
        age: 30
      })
    })

    it('should return the expanded byUser field', () => {
      expect(mapperResult).toHaveProperty('byUser', mockMapUserResult)
    })
  })

  describe('mapMessageChannelAndMessages', () => {
    let mockMessageResponse
    let mockMessageChannelPartA
    let mockMessageChannelPartB
    let mapperResult
    let mappedChannelAndMessage

    beforeEach(() => {
      mockMessageChannelPartA = {
        message_channel_id: 1,
        message_channel_owner: 1,
        message_channel_name: 'Chat 1',
        message_channel_background_img: 'blueSky.jpg',
        message_channel_user_id: 1,
        message_channel_user_username: 'denyslu',
        message_channel_user_name: 'Denys',
        message_channel_user_last_name: 'Lutsenko',
        message_channel_user_photo: 'photo.jpg',
        message_channel_user_email: 'denys.lu@gmail.com',
        message_channel_user_birthday: new Date('1989-01-05T00:00:00.000Z'),
        message_channel_user_age: 30
      }

      mockMessageChannelPartB = {
        message_channel_id: 1,
        message_channel_owner: 1,
        message_channel_name: 'Chat 1',
        message_channel_background_img: 'blueSky.jpg',
        message_channel_user_id: 2,
        message_channel_user_username: 'ulchik',
        message_channel_user_name: 'Ulzhan',
        message_channel_user_last_name: 'Seitmurat',
        message_channel_user_photo: 'photo.jpg',
        message_channel_user_email: 'www.ulzhan@gmail.com',
        message_channel_user_birthday: new Date('1991-12-03T00:00:00.000Z'),
        message_channel_user_age: 27
      }

      mockMessageResponse = {
        message_id: 123,
        message_date_sent: new Date('2018-12-23 10:14:21'),
        message_msg_content: 'Where are you?',
        message_status: 'readable',
        message_to_channel: 1,
        message_user_id: 1,
        message_user_name: 'Denys',
        message_user_last_name: 'Lutsenko',
        message_user_username: 'denyslu',
        message_user_email: 'denys.lu@gmail.com',
        message_user_photo: 'photo.jpg',
        message_user_birthday: new Date('1989-01-05T00:00:00.000Z'),
        message_user_age: 30
      }

      mapperResult = mapMessageChannelAndMessages(
        mapMessageChannels([
          mockMessageChannelPartA,
          mockMessageChannelPartB
        ]),
        mapMessages([
          mockMessageResponse
        ])
      )

      mappedChannelAndMessage = mapperResult.pop()
    })

    it('should return the mapped messages and users as part of a channel', () => {
      expect(mappedChannelAndMessage).toEqual({
        id: 1,
        owner: 1,
        name: 'Chat 1',
        backgroundImg: 'blueSky.jpg',
        messageChannelUsers: [
          mockMapUserResult,
          mockMapUserResult
        ],
        messages: [
          {
            id: 123,
            dateSent: expect.any(Function),
            msgContent: 'Where are you?',
            status: 'readable',
            byUser: mockMapUserResult
          }
        ]
      })
    })

    it('should return an empty array if no messages exist', () => {
      mapperResult = mapMessageChannelAndMessages(
        mapMessageChannels([
          mockMessageChannelPartA
        ]),
        []
      )

      mappedChannelAndMessage = mapperResult.pop()

      expect(mappedChannelAndMessage).toHaveProperty('messages', [])
    })
  })
})
