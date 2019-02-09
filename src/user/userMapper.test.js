import {
  mapUser
} from './userMapper'

const mockUser = {
  id: 1,
  name: 'Jack',
  last_name: 'Black',
  username: 'jb',
  email: 'jb@email.com',
  birthday: new Date('1989-01-05T00:00:00.000Z'),
  age: 30,
  photo: 'somephoto.jpg'
}

describe('mapUser', () => {
  it('should return the id', () => {
    expect(mapUser(mockUser)).toHaveProperty('id', 1)
  })

  it('should return the name', () => {
    expect(mapUser(mockUser)).toHaveProperty('name', 'Jack')
  })

  it('should return the lastName', () => {
    expect(mapUser(mockUser)).toHaveProperty('lastName', 'Black')
  })

  it('should return the username', () => {
    expect(mapUser(mockUser)).toHaveProperty('username', 'jb')
  })

  it('should return the email', () => {
    expect(mapUser(mockUser)).toHaveProperty('email', 'jb@email.com')
  })

  it('should return the age', () => {
    expect(mapUser(mockUser)).toHaveProperty('age', 30)
  })

  it('should return the photo', () => {
    expect(mapUser(mockUser)).toHaveProperty('photo', 'somephoto.jpg')
  })

  describe('birthday', () => {
    let mappedUser

    beforeEach(() => {
      mappedUser = mapUser(mockUser)
    })

    it('should return the correct format if requested', () => {
      expect(mappedUser.birthday({ format: 'YYYY' })).toEqual('1989')
      expect(mappedUser.birthday({ format: 'YYYY MMM DD' })).toEqual('1989 Jan 05')
      expect(mappedUser.birthday({ format: 'DD-MM-YYYY' })).toEqual('05-01-1989')
    })

    it('should return the date object if no format is passed', () => {
      expect(mappedUser.birthday({})).toEqual(mockUser.birthday)
    })
  })
})
