const { validateSearchJourney } = require('./journeyInputValidator')

describe('validateSearchJourney', () => {
  let baseInput

  beforeEach(() => {
    baseInput = {
      date: '2020-12-12'
    }
  })

  it('should reject input if origin latitude is set, but origin longitude and origin withinDistance are missing', () => {
    expect(validateSearchJourney({
      ...baseInput,
      origin: {
        latitude: 1
      }
    })).toEqual(false)
  })

  it('should reject input if origin longitude is set, but origin latitude and origin withinDistance are missing', () => {
    expect(validateSearchJourney({
      ...baseInput,
      origin: {
        longitude: 1
      }
    })).toEqual(false)
  })

  it('should reject input if origin withinDistance is set, but origin longitude and origin latitude are missing', () => {
    expect(validateSearchJourney({
      ...baseInput,
      origin: {
        withinDistance: 100
      }
    })).toEqual(false)
  })

  it('should reject input if origin latitude and origin longitude are set, but origin withinDistance is missing', () => {
    expect(validateSearchJourney({
      ...baseInput,
      origin: {
        latitude: 2,
        longitude: 3
      }
    })).toEqual(false)
  })

  it('should reject input if origin longitude and origin withinDistance are set, but origin latitude is missing', () => {
    expect(validateSearchJourney({
      ...baseInput,
      origin: {
        longitude: 3,
        withinDistance: 100
      }
    })).toEqual(false)
  })

  it('should reject input if origin latitude and origin withinDistance are set, but origin longitude is missing', () => {
    expect(validateSearchJourney({
      ...baseInput,
      origin: {
        latitude: 2,
        withinDistance: 100
      }
    })).toEqual(false)
  })

  it('should return true if origin latitude, origin longitude and origin withinDistance are all set', () => {
    expect(validateSearchJourney({
      ...baseInput,
      origin: {
        latitude: 2,
        longitude: 3,
        withinDistance: 100
      }
    })).toEqual(true)
  })

  it('should reject input if destination latitude is set, but destination longitude and destination withinDistance are missing', () => {
    expect(validateSearchJourney({
      ...baseInput,
      destination: {
        latitude: 1
      }
    })).toEqual(false)
  })

  it('should reject input if destination longitude is set, but destination latitude and destination withinDistance are missing', () => {
    expect(validateSearchJourney({
      ...baseInput,
      destination: {
        longitude: 1
      }
    })).toEqual(false)
  })

  it('should reject input if destination withinDistance is set, but destination longitude and destination latitude are missing', () => {
    expect(validateSearchJourney({
      ...baseInput,
      destination: {
        withinDistance: 100
      }
    })).toEqual(false)
  })

  it('should reject input if destination latitude and destination longitude are set, but destination withinDistance is missing', () => {
    expect(validateSearchJourney({
      ...baseInput,
      destination: {
        latitude: 2,
        longitude: 3
      }
    })).toEqual(false)
  })

  it('should reject input if destination longitude and destination withinDistance are set, but destination latitude is missing', () => {
    expect(validateSearchJourney({
      ...baseInput,
      destination: {
        longitude: 3,
        withinDistance: 100
      }
    })).toEqual(false)
  })

  it('should reject input if destination latitude and destination withinDistance are set, but destination longitude is missing', () => {
    expect(validateSearchJourney({
      ...baseInput,
      destination: {
        latitude: 2,
        withinDistance: 100
      }
    })).toEqual(false)
  })

  it('should return true if destination latitude, destination longitude and destination withinDistance are all set', () => {
    expect(validateSearchJourney({
      ...baseInput,
      destination: {
        latitude: 2,
        longitude: 3,
        withinDistance: 100
      }
    })).toEqual(true)
  })

  it('should return true if none of destination latitude, destination longitude and destination withinDistance are set', () => {
    expect(validateSearchJourney({
      ...baseInput
    })).toEqual(true)
  })
})
