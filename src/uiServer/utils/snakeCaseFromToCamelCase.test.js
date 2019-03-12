import {
  camelCaseToSnakeCase,
  snakeCaseToCamelCase
} from './snakeCaseFromToCamelCase'

describe('snakeCaseFromToCamelCase', () => {
  describe('snakeCaseToCamelCase', () => {
    it('should format all keys to camel case', () => {
      expect(snakeCaseToCamelCase({
        some_key: 'someValue',
        another_key: 'AnotherValue'
      })).toEqual({
        someKey: 'someValue',
        anotherKey: 'AnotherValue'
      })
    })
  })

  describe('camelCaseToSnakeCase', () => {
    it('should format all keys to camel case', () => {
      expect(camelCaseToSnakeCase({
        someKey: 'someValue',
        anotherKey: 'AnotherValue'
      })).toEqual({
        some_key: 'someValue',
        another_key: 'AnotherValue'
      })
    })
  })
})
