const { validateDeliveryInput } = require('./deliveryInputValidator')

describe('validateDeliveryInput', () => {
  it('should return true', () => {
    expect(validateDeliveryInput()).toEqual(true)
  })
})
