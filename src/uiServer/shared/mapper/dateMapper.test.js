import { mapDate } from './dateMapper'

describe('mapDate', () => {
  it('returns the original date if no format is provided', () => {
    const date = new Date()
    expect(mapDate(date)).toEqual(date)
  })

  it('returns the formatted date if a format is provided', () => {
    const date = new Date('1995-01-12')
    expect(mapDate(date, 'YYYY')).toEqual('1995')
  })
})
