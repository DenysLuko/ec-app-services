import { zipInputObject } from './zipInputObject'

describe('zipInputObject', () => {
  it('should return two arrays with keys and values', () => {
    expect(zipInputObject({
      a: 1,
      b: 2
    })).toEqual({
      columnNames: ['a', 'b'],
      columnValues: [1, 2]
    })
  })
})
