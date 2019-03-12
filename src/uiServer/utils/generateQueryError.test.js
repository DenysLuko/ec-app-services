import { generateQueryError } from './generateQueryError'

describe('generateQueryError', () => {
  it('should return a JSON string with correct fields', () => {
    expect(generateQueryError('Error Message', 'Query', 'Original Error'))
      .toEqual(JSON.stringify({
        type: 'queryError',
        message: 'Error Message',
        query: 'Query',
        originalError: 'Original Error'
      }))
  })
})
