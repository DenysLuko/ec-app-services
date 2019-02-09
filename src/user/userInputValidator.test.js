import {
  validateUserInput
} from './userInputValidator'

describe('validateUserInput', () => {
  it('should return false if all values are undefined of null', () => {
    expect(validateUserInput({
      name: null,
      email: undefined
    })).toEqual(false)
  })

  it('should return true otherwise', () => {
    expect(validateUserInput({
      name: 'Deny',
      username: 'Fox'
    })).toEqual(true)
  })
})
