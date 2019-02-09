import {
  userResolver,
  __RewireAPI__ as userResolverRewireAPI
} from './userResolver'

const {
  user,
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

  describe('user', () => {
    it('should call client with the correct query', async () => {
      await user({ id: 1 }, mockClient)

      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'SELECT * FROM app_user WHERE id = $1;',
        values: [1]
      })
    })

    it('should call user mapper with the response', async () => {
      await user({ id: 1 }, mockClient)
      expect(mockMapUser).toHaveBeenCalledWith(mockUserResponse)
    })

    it('should return the result from the mapper', async () => {
      const result = await user({ id: 1 }, mockClient)
      expect(result).toEqual({
        id: 1,
        username: 'mockUser'
      })
    })

    it('should propagate the error towards the client if something goes wrong', () => {
      userResolverRewireAPI.__Rewire__('mapUser', () => {
        throw new Error('Some Error')
      })

      expect(user({ id: 1 }, mockClient)).rejects.toThrow('Some Error')
    })
  })

  describe('createUser', () => {
    it('should call client with the correct query if all fields are present', async () => {
      await createUser({ input: {
          name: 'AnotherJack',
          lastName: 'AnotherBlack',
          birthday: '1991-12-03',
          photo: 'anotherphoto.jpg',
          username: 'misterBlack',
          email: 'ajbj@email.com',
          password: 'abcdefg'
        }
      }, mockClient)

      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'INSERT INTO app_user (name, last_name, birthday, photo, username, email, password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;',
        values: ['AnotherJack', 'AnotherBlack', '1991-12-03', 'anotherphoto.jpg', 'misterBlack', 'ajbj@email.com', 'abcdefg']
      })
    })

    it('should call user mapper with the response', async () => {
      await user({ id: 1 }, mockClient)
      expect(mockMapUser).toHaveBeenCalledWith(mockUserResponse)
    })

    it('should return the result from the mapper', async () => {
      const result = await user({ id: 1 }, mockClient)
      expect(result).toEqual(mockMapperResult)
    })
  })

  describe('updateUser', () => {
    it('should throw an error if the input is invalid', async () => {
      await expect(updateUser({id: 1, input: {}}, mockClient)).rejects.toThrowError(Error)
    })

    it('should call client with the correct query if all fields are present', async () => {
      await updateUser({
        id: 5,
        input: {
          name: 'notSoJack',
          lastName: 'notSoBlack'
        }
      }, mockClient)

      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'UPDATE app_user SET name = $2, last_name = $3 WHERE id = $1 RETURNING *;',
        values: [5, 'notSoJack', 'notSoBlack']
      })
    })

    it('should call user mapper with the response', async () => {
      await updateUser({
        id: 5,
        input: {
          name: 'notSoJack',
          lastName: 'notSoBlack'
        }
      }, mockClient)

      expect(mockMapUser).toHaveBeenCalledWith(mockUserResponse)
    })

    it('should return the result from the mapper', async () => {
      const result = await updateUser({
        id: 5,
        input: {
          name: 'notSoJack',
          lastName: 'notSoBlack'
        }
      }, mockClient)

      expect(result).toEqual(mockMapperResult)
    })
  })
})
