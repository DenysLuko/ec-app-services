import {
  chatResolver
} from './chatResolver'

const {
  getMessageChannelsForUser,
  createMessageChannel
} = chatResolver

describe('chatResolver', () => {
  describe('getMessageChannelsForUser', () => {
    let mockClient
    let mockGetMessageChannelsResponse
    let mockGetMessagesResponse

    beforeEach(() => {
      mockGetMessageChannelsResponse = [
        {
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
        },
        {
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
        },
        {
          message_channel_id: 2,
          message_channel_name: 'Chat 2',
          message_channel_owner: 1,
          message_channel_background_img: null,
          message_channel_user_id: 1,
          message_channel_user_username: 'denyslu',
          message_channel_user_name: 'Denys',
          message_channel_user_last_name: 'Lutsenko',
          message_channel_user_photo: 'photo.jpg',
          message_channel_user_email: 'denys.lu@gmail.com',
          message_channel_user_birthday: new Date('1989-01-05T00:00:00.000Z'),
          message_channel_user_age: 30
        },
        {
          message_channel_id: 2,
          message_channel_name: 'Chat 2',
          message_channel_owner: 1,
          message_channel_background_img: null,
          message_channel_user_id: 1,
          message_channel_user_username: 'D',
          message_channel_user_name: 'Daniel',
          message_channel_user_last_name: 'Drosdow',
          message_channel_user_photo: 'photo_dd.jpg',
          message_channel_user_email: 'daniel@gmail.com',
          message_channel_user_birthday: new Date('2000-03-09T00:00:00.000Z'),
          message_channel_user_age: 19
        }
      ]

      mockGetMessagesResponse = [
        {
          message_id: 123,
          message_date_sent: '2018-12-23 10:14:21',
          message_msg_content: 'Where are you?',
          message_status: 'readable',
          message_to_channel: 1,
          message_user_name: 'Denys',
          message_user_last_name: 'Lutsenko',
          message_user_username: 'denyslu',
          message_user_email: 'denys.lu@mail.com',
          message_user_photo: 'photo.jpg'
        },
        {
          message_id: 32,
          message_date_sent: '2018-12-23 10:15:13',
          message_msg_content: 'not yet',
          message_status: 'readable',
          message_to_channel: 2,
          message_user_name: 'Ula',
          message_user_last_name: 'Seitmurat',
          message_user_username: 'ulchik',
          message_user_email: 'ulala@mail.com',
          message_user_photo: 'ulchik.jpg'
        }
      ]

      mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({
            rowCount: 2,
            rows: mockGetMessageChannelsResponse
          })
          .mockResolvedValueOnce({
            rowCount: 2,
            rows: mockGetMessagesResponse
          })
      }
    })

    it('should call client with the correct query', async () => {
      await getMessageChannelsForUser({ id: 1 }, mockClient)

      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'SELECT * FROM message_channel_view WHERE message_channel_owner = $1;',
        values: [1]
      })
    })

    it('should throw an error with the query and the original error from the client if the get query fails', async () => {
      const originalGetError = new Error('Some Get Error')

      mockClient = {
        query: jest.fn().mockRejectedValue(originalGetError)
      }

      const expectedError = JSON.stringify({
        type: 'queryError',
        message: 'Query Error',
        query: {
          text: 'SELECT * FROM message_channel_view WHERE message_channel_owner = $1;',
          values: [1]
        },
        originalError: originalGetError
      })

      await expect(getMessageChannelsForUser({ id: 1 }, mockClient)).rejects
        .toEqual(expectedError)
    })

    it('should fetch the last message for each message channel', async () => {
      await getMessageChannelsForUser({ id: 1 }, mockClient)

      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'SELECT DISTINCT ON(message_to_channel) * FROM message_view WHERE message_to_channel = $1 OR message_to_channel = $2 ORDER BY message_to_channel, message_date_sent desc;',
        values: [1, 2]
      })
    })

    it('should not fetch the last message for each message channel if there are no message channels in the first response', async () => {
      mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({
            rowCount: 0,
            rows: []
          })
          .mockResolvedValueOnce({
            rowCount: 0,
            rows: []
          })
      }

      const result = await getMessageChannelsForUser({ id: 1 }, mockClient)

      expect(mockClient.query).toHaveBeenCalledTimes(1)
      expect(result).toEqual([])
    })

    it('should throw an error with the query and the original error from the client if the second get query fails', async () => {
      const originalGetError = new Error('Some Get Error')

      mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({
            rowCount: 2,
            rows: mockGetMessageChannelsResponse
          })
          .mockRejectedValueOnce(originalGetError)
      }

      const expectedError = JSON.stringify({
        type: 'queryError',
        message: 'Query Error',
        query: {
          text: 'SELECT DISTINCT ON(message_to_channel) * FROM message_view WHERE message_to_channel = $1 OR message_to_channel = $2 ORDER BY message_to_channel, message_date_sent desc;',
          values: [1, 2]
        },
        originalError: originalGetError
      })

      await expect(getMessageChannelsForUser({ id: 1 }, mockClient)).rejects
        .toEqual(expectedError)
    })

    it('should return the expected result', async () => {
      await expect(getMessageChannelsForUser({ id: 1 }, mockClient))
        .resolves.toEqual([
          {
            backgroundImg: 'blueSky.jpg',
            id: 1,
            messageChannelUsers: [
              {
                age: 30,
                birthday: expect.any(Function),
                email: 'denys.lu@gmail.com',
                id: 1,
                lastName: 'Lutsenko',
                name: 'Denys',
                photo: 'photo.jpg',
                username: 'denyslu'
              },
              {
                age: 27,
                birthday: expect.any(Function),
                email: 'www.ulzhan@gmail.com',
                id: 2,
                lastName: 'Seitmurat',
                name: 'Ulzhan',
                photo: 'photo.jpg',
                username: 'ulchik'
              }
            ],
            messages: [
              {
                byUser: {
                  age: undefined,
                  birthday: expect.any(Function),
                  email: 'denys.lu@mail.com',
                  id: undefined,
                  lastName: 'Lutsenko',
                  name: 'Denys',
                  photo: 'photo.jpg',
                  username: 'denyslu'
                },
                dateSent: expect.any(Function),
                id: 123,
                msgContent: 'Where are you?',
                status: 'readable'
              }
            ],
            name: 'Chat 1',
            owner: 1
          },
          {
            backgroundImg: null,
            id: 2,
            messageChannelUsers: [
              {
                age: 30,
                birthday: expect.any(Function),
                email: 'denys.lu@gmail.com',
                id: 1,
                lastName: 'Lutsenko',
                name: 'Denys',
                photo: 'photo.jpg',
                username: 'denyslu'
              },
              {
                age: 19,
                birthday: expect.any(Function),
                email: 'daniel@gmail.com',
                id: 1,
                lastName: 'Drosdow',
                name: 'Daniel',
                photo: 'photo_dd.jpg',
                username: 'D'
              }
            ],
            messages: [
              {
                byUser: {
                  age: undefined,
                  birthday: expect.any(Function),
                  email: 'ulala@mail.com',
                  id: undefined,
                  lastName: 'Seitmurat',
                  name: 'Ula',
                  photo: 'ulchik.jpg',
                  username: 'ulchik'
                },
                dateSent: expect.any(Function),
                id: 32,
                msgContent: 'not yet',
                status: 'readable'
              }
            ],
            name: 'Chat 2',
            owner: 1
          }
        ])
    })
  })

  describe('createMessageChannel', () => {
    let mockClient
    let mockInput
    let mockCreateMessageChannelResponse
    let mockCreateMessageChannelUserResponseA
    let mockCreateMessageChannelUserResponseB
    let mockCreateMessageChannelUserResponseC
    let mockNewMessagesChannelResponse

    beforeEach(async () => {
      mockInput = {
        owner: 1,
        backgroundImg: 'blueSky.jpeg',
        messageChannelUsers: [2, 3]
      }

      mockCreateMessageChannelResponse = {
        rowCount: 1,
        rows: [
          {
            id: 10,
            backgroundImg: 'blueSky.jpeg'
          }
        ]
      }

      mockCreateMessageChannelUserResponseA = {
        rowCount: 1,
        rows: [
          {
            id: 14,
            msg_channel: 10,
            msg_user: 1
          }
        ]
      }

      mockCreateMessageChannelUserResponseB = {
        rowCount: 1,
        rows: [
          {
            id: 15,
            msg_channel: 10,
            msg_user: 2
          }
        ]
      }

      mockCreateMessageChannelUserResponseC = {
        rowCount: 1,
        rows: [
          {
            id: 16,
            msg_channel: 10,
            msg_user: 3
          }
        ]
      }

      mockNewMessagesChannelResponse = {
        rowCount: 1,
        rows: [
          {
            message_channel_id: 10,
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
          },
          {
            message_channel_id: 10,
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
          },
          {
            message_channel_id: 10,
            message_channel_owner: 1,
            message_channel_name: 'Chat 1',
            message_channel_background_img: 'blueSky.jpg',
            message_channel_user_id: 3,
            message_channel_user_username: 'd',
            message_channel_user_name: 'Daniel',
            message_channel_user_last_name: 'Drosdow',
            message_channel_user_photo: 'photo.jpg',
            message_channel_user_email: 'daniel@gmail.com',
            message_channel_user_birthday: new Date('2000-03-09T00:00:00.000Z'),
            message_channel_user_age: 19
          }
        ]
      }

      mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce(mockCreateMessageChannelResponse)
          .mockResolvedValueOnce(mockCreateMessageChannelUserResponseA)
          .mockResolvedValueOnce(mockCreateMessageChannelUserResponseB)
          .mockResolvedValueOnce(mockCreateMessageChannelUserResponseC)
          .mockResolvedValueOnce(mockNewMessagesChannelResponse)
      }
    })

    it('should call the client with the correct create message channel query', async () => {
      await createMessageChannel({ input: mockInput }, mockClient)

      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'INSERT INTO message_channel (owner, background_img) VALUES ($1, $2) RETURNING *;',
        values: [1, 'blueSky.jpeg']
      })
    })

    it('should throw an error with the query and the original error from the client if the create channel query fails', async () => {
      const originalCreateError = new Error('Some Create Error')

      mockClient = {
        query: jest.fn()
          .mockRejectedValueOnce(originalCreateError)
          .mockResolvedValueOnce(mockCreateMessageChannelUserResponseA)
          .mockResolvedValueOnce(mockCreateMessageChannelUserResponseB)
          .mockResolvedValueOnce(mockCreateMessageChannelUserResponseC)
      }

      const expectedError = JSON.stringify({
        type: 'queryError',
        message: 'Query Error',
        query: {
          text: 'INSERT INTO message_channel (owner, background_img) VALUES ($1, $2) RETURNING *;',
          values: [1, 'blueSky.jpeg']
        },
        originalError: originalCreateError
      })

      await expect(createMessageChannel({ input: mockInput }, mockClient))
        .rejects.toEqual(expectedError)
    })

    it('should create all message channel users with the ids from the input and the create message channel result', async () => {
      await createMessageChannel({ input: mockInput }, mockClient)

      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'INSERT INTO message_channel_user (msg_user, msg_channel) VALUES ($1, $2) RETURNING *;',
        values: [1, 10]
      })

      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'INSERT INTO message_channel_user (msg_user, msg_channel) VALUES ($1, $2) RETURNING *;',
        values: [2, 10]
      })

      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'INSERT INTO message_channel_user (msg_user, msg_channel) VALUES ($1, $2) RETURNING *;',
        values: [3, 10]
      })
    })

    it('should throw an error if a message channel user query fails', async () => {
      const originalCreateError = new Error('Some Create Error')

      mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce(mockCreateMessageChannelResponse)
          .mockResolvedValueOnce(mockCreateMessageChannelUserResponseA)
          .mockRejectedValueOnce(originalCreateError)
          .mockResolvedValueOnce(mockCreateMessageChannelUserResponseC)
      }

      const expectedError = JSON.stringify({
        type: 'queryError',
        message: 'Query Error',
        query: {
          text: 'INSERT INTO message_channel_user (msg_user, msg_channel) VALUES ($1, $2) RETURNING *;',
          values: [3, 10]
        },
        originalError: originalCreateError
      })

      await expect(createMessageChannel({ input: mockInput }, mockClient))
        .rejects.toEqual(expectedError)
    })

    it('should call client with correct get message channel query if all message channel users were created successfully', async () => {
      await createMessageChannel({ input: mockInput }, mockClient)

      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'SELECT * FROM message_channel_view WHERE message_channel_id = $1;',
        values: [10]
      })
    })

    it('should throw an error with the query and the original error from the client if the get query for the new channel fails', async () => {
      const originalGetError = new Error('Some Get Error')

      mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce(mockCreateMessageChannelResponse)
          .mockResolvedValueOnce(mockCreateMessageChannelUserResponseA)
          .mockResolvedValueOnce(mockCreateMessageChannelUserResponseB)
          .mockResolvedValueOnce(mockCreateMessageChannelUserResponseC)
          .mockRejectedValue(originalGetError)
      }

      const expectedError = JSON.stringify({
        type: 'queryError',
        message: 'Query Error',
        query: {
          text: 'SELECT * FROM message_channel_view WHERE message_channel_id = $1;',
          values: [10]
        },
        originalError: originalGetError
      })

      await expect(createMessageChannel({ input: mockInput }, mockClient)).rejects
        .toEqual(expectedError)
    })

    it('shoulg return the correct result', async () => {
      await expect(createMessageChannel({ input: mockInput }, mockClient))
        .resolves.toEqual({
          id: 10,
          name: 'Chat 1',
          owner: 1,
          backgroundImg: 'blueSky.jpg',
          messageChannelUsers: [
            {
              age: 30,
              birthday: expect.any(Function),
              email: 'denys.lu@gmail.com',
              id: 1,
              lastName: 'Lutsenko',
              name: 'Denys',
              photo: 'photo.jpg',
              username: 'denyslu',
            },
            {
              age: 27,
              birthday: expect.any(Function),
              email: 'www.ulzhan@gmail.com',
              id: 2,
              lastName: 'Seitmurat',
              name: 'Ulzhan',
              photo: 'photo.jpg',
              username: 'ulchik',
            },
            {
              age: 19,
              birthday: expect.any(Function),
              email: 'daniel@gmail.com',
              id: 3,
              lastName: 'Drosdow',
              name: 'Daniel',
              photo: 'photo.jpg',
              username: 'd',
            }
          ]
        })
    })
  })
})
