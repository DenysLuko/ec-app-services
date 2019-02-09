import { generatePlaceholders } from './generateQueryPlaceholders'

describe('generatePlaceholders', () => {
  it('should return a string with comma separated placeholders', () => {
    expect(generatePlaceholders(3)).toEqual('$1, $2, $3')
  })
})