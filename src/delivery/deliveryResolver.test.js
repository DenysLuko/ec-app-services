import {
  deliveryResolver,
  __RewireAPI__ as deliveryResolverRewireAPI
} from './deliveryResolver'

const {
  getDelivery,
  createDelivery,
  updateDelivery
} = deliveryResolver

describe('deliveryResolver', () => {
  let mockClient
  let mockDeliveryResponse
  let mockMapDelivery
  let mockMapperResult

  beforeEach(() => {
    mockMapperResult = 'mapper-result'

    mockMapDelivery = jest.fn(() => mockMapperResult)

    mockDeliveryResponse = {
      delivery_id: 1,
      delivery_name: 'PS4',
      delivery_description: 'console with a few games'
    }

    mockClient = {
      query: jest.fn().mockResolvedValue({
        rows: [mockDeliveryResponse]
      })
    }

    deliveryResolverRewireAPI.__Rewire__('mapDelivery', mockMapDelivery)
  })

  describe('getDelivery', () => {
    it('should call client with the correct query', async () => {
      await getDelivery({ deliveryId: 1 }, mockClient)

      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'SELECT * FROM delivery_view WHERE delivery_id = $1;',
        values: [1]
      })
    })

    it('should call delivery mapper with the response', async () => {
      await getDelivery({ deliveryId: 1 }, mockClient)

      expect(mockMapDelivery).toHaveBeenCalledWith(mockDeliveryResponse)
    })

    it('should return the result from the mapper', async () => {
      const result = await getDelivery({ deliveryId: 1 }, mockClient)

      expect(result).toEqual(mockMapperResult)
    })
  })

  describe('createDelivery', () => {
    let result

    beforeEach(async () => {
      result = await createDelivery({
        input: {
          name: 'PS4',
          description: 'console with a few games',
          journey: 1,
          weightKg: 0.5,
          widthCm: 50,
          heightCm: 10,
          depthCm: 40,
          currency: 'USD',
          value: 100,
          sender: 1,
          receiver: 2,
          deliveryStatus: 'fulfilled',
          deliveryRating: 5,
          deliveryComment: 'Delivered as promised, thanks!',
          senderRating: 2,
          senderComment: 'Late for pick-up, hurry up next time'
        }
      }, mockClient)
    })

    it('should call client with the correct query if all fields are present', async () => {
      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'INSERT INTO delivery (name, description, journey, weight_kg, width_cm, height_cm, depth_cm, currency, value, sender, receiver, delivery_status, delivery_rating, delivery_comment, sender_rating, sender_comment) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *;',
        values: ['PS4', 'console with a few games', 1, 0.5, 50, 10, 40, 'USD', 100, 1, 2, 'fulfilled', 5, 'Delivered as promised, thanks!', 2, 'Late for pick-up, hurry up next time']
      })
    })

    it('should call user mapper with the response', async () => {
      expect(mockMapDelivery).toHaveBeenCalledWith(mockDeliveryResponse)
    })

    it('should return the result from the mapper', async () => {
      expect(result).toEqual(mockMapperResult)
    })
  })

  describe('updateDelivery', () => {
    let result

    beforeEach(async () => {
      result = await updateDelivery({
        input: {
          id: 2,
          deliveryRating: 5,
          deliveryComment: 'All good'
        }
      }, mockClient)
    })

    xit('should throw an error if the input is invalid', async () => {
      await expect(updateDelivery({id: 1, input: {}}, mockClient)).rejects.toThrowError(Error)
    })

    it('should call client with the correct query', async () => {
      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'UPDATE delivery SET delivery_rating = $2, delivery_comment = $3 WHERE id = $1 RETURNING *;',
        values: [2, 5, 'All good']
      })
    })

    it('should call user mapper with the response', async () => {
      expect(mockMapDelivery).toHaveBeenCalledWith(mockDeliveryResponse)
    })

    it('should return the result from the mapper', async () => {
      expect(result).toEqual(mockMapperResult)
    })
  })
})
