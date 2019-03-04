import {
  userResolver,
  __RewireAPI__ as userResolverRewireAPI
} from './userResolver'

const {
  getUser,
  createUser,
  updateUser
} = userResolver

describe('userResolver', () => {
  let mockClient
  let mockUserResponse
  let mockMapUser
  let mockMapperResult

  beforeEach(() => {
    mockMapperResult = {
      id: 1,
      username: 'mockUser'
    }

    mockMapUser = jest.fn(() => mockMapperResult)

    mockUserResponse = {
      id: 1,
      name: 'Jack',
      last_name: 'Black',
      username: 'jb',
      email: 'jb@email.com',
      birthday: new Date('1989-01-05T00:00:00.000Z'),
      age: 30,
      photo: 'somephoto.jpg'
    }

    mockClient = {
      query: jest.fn().mockResolvedValue({
        rows: [mockUserResponse]
      })
    }

    userResolverRewireAPI.__Rewire__('mapUser', mockMapUser)
  })

  describe('getUser', () => {
    it('should call client with the correct query', async () => {
      await getUser({ id: 1 }, mockClient)

      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'SELECT * FROM app_user WHERE id = $1;',
        values: [1]
      })
    })

    it('should throw an error with the query and the original error from the client if the get query fails', async () => {
      const originalGetError = new Error('Some Get Error')

      mockClient = {
        query: jest.fn().mockRejectedValueOnce(originalGetError)
      }

      const expectedError = JSON.stringify({
        type: 'queryError',
        message: 'Query Error',
        query: {
          text: 'SELECT * FROM app_user WHERE id = $1;',
          values: [14]
        },
        originalError: originalGetError
      })

      await expect(getUser({ id: 14 }, mockClient)).rejects.toEqual(expectedError)
    })

    it('should call user mapper with the response', async () => {
      await getUser({ id: 1 }, mockClient)
      expect(mockMapUser).toHaveBeenCalledWith(mockUserResponse)
    })

    it('should return the result from the mapper', async () => {
      const result = await getUser({ id: 1 }, mockClient)
      expect(result).toEqual({
        id: 1,
        username: 'mockUser'
      })
    })

    it('should propagate the error towards the client if something goes wrong', () => {
      userResolverRewireAPI.__Rewire__('mapUser', () => {
        throw new Error('Some Error')
      })

      expect(getUser({ id: 1 }, mockClient)).rejects.toThrow('Some Error')
    })
  })

  describe('createUser', () => {
    let result

    beforeEach(async () => {
      result = await createUser({ input: {
          name: 'AnotherJack',
          lastName: 'AnotherBlack',
          birthday: '1991-12-03',
          photo: 'anotherphoto.jpg',
          username: 'misterBlack',
          email: 'ajbj@email.com',
          password: 'abcdefg'
        }
      }, mockClient)
    })

    it('should call client with the correct query if all fields are present', async () => {
      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'INSERT INTO app_user (name, last_name, birthday, photo, username, email, password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;',
        values: ['AnotherJack', 'AnotherBlack', '1991-12-03', 'anotherphoto.jpg', 'misterBlack', 'ajbj@email.com', 'abcdefg']
      })
    })

    it('should throw an error with the query and the original error from the client if the create query fails', async () => {
      const originalCreateError = new Error('Some Create Error')

      mockClient = {
        query: jest.fn().mockRejectedValueOnce(originalCreateError)
      }

      const expectedError = JSON.stringify({
        type: 'queryError',
        message: 'Query Error',
        query: {
          text: 'INSERT INTO app_user (name) VALUES ($1) RETURNING *;',
          values: ['AnotherJack']
        },
        originalError: originalCreateError
      })

      await expect(createUser({
        input: {
          name: 'AnotherJack'
        }
      }, mockClient)).rejects.toEqual(expectedError)
    })

    it('should call user mapper with the response', async () => {
      expect(mockMapUser).toHaveBeenCalledWith(mockUserResponse)
    })

    it('should return the result from the mapper', async () => {
      expect(result).toEqual(mockMapperResult)
    })
  })

  describe('updateUser', () => {
    it('should throw an error if the input is invalid', async () => {
      await expect(updateUser({id: 1, input: {}}, mockClient)).rejects.toThrowError(Error)
    })

    it('should call client with the correct query if all fields are present', async () => {
      await updateUser({
        input: {
          id: 5,
          name: 'notSoJack',
          lastName: 'notSoBlack'
        }
      }, mockClient)

      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'UPDATE app_user SET name = $2, last_name = $3 WHERE id = $1 RETURNING *;',
        values: [5, 'notSoJack', 'notSoBlack']
      })
    })

    it('should throw an error with the query and the original error from the client if the update query fails', async () => {
      const originalUpdateError = new Error('Some Update Error')

      mockClient = {
        query: jest.fn().mockRejectedValueOnce(originalUpdateError)
      }

      const expectedError = JSON.stringify({
        type: 'queryError',
        message: 'Query Error',
        query: {
          text: 'UPDATE app_user SET name = $2, last_name = $3 WHERE id = $1 RETURNING *;',
          values: [5, 'notSoJack', 'notSoBlack']
        },
        originalError: originalUpdateError
      })

      await expect(updateUser({
        input: {
          id: 5,
          name: 'notSoJack',
          lastName: 'notSoBlack'
        }
      }, mockClient)).rejects.toEqual(expectedError)
    })

    it('should call user mapper with the response', async () => {
      await updateUser({
        input: {
          id: 5,
          name: 'notSoJack',
          lastName: 'notSoBlack'
        }
      }, mockClient)

      expect(mockMapUser).toHaveBeenCalledWith(mockUserResponse)
    })

    it('should return the result from the mapper', async () => {
      const result = await updateUser({
        input: {
          id: 5,
          name: 'notSoJack',
          lastName: 'notSoBlack'
        }
      }, mockClient)

      expect(result).toEqual(mockMapperResult)
    })
  })
})
