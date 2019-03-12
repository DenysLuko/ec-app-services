import {
  deliveryResolver,
  // eslint-disable-next-line import/named
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
      id: 1,
      name: 'PS4',
      description: 'console with a few games'
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
      await getDelivery({ id: 1 }, mockClient)

      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'SELECT * FROM delivery_view WHERE delivery_id = $1;',
        values: [1]
      })
    })

    it('should throw an error with the query and the original error from the client if the query fails', async () => {
      const originalError = new Error('Some Error')

      mockClient = {
        query: jest.fn().mockRejectedValue(originalError)
      }

      const expectedError = JSON.stringify({
        type: 'queryError',
        message: 'Query Error',
        query: {
          text: 'SELECT * FROM delivery_view WHERE delivery_id = $1;',
          values: [1]
        },
        originalError
      })

      await expect(getDelivery({ id: 1 }, mockClient)).rejects
        .toEqual(expectedError)
    })

    it('should call delivery mapper with the response', async () => {
      await getDelivery({ id: 1 }, mockClient)

      expect(mockMapDelivery).toHaveBeenCalledWith(mockDeliveryResponse)
    })

    it('should return the result from the mapper', async () => {
      const result = await getDelivery({ id: 1 }, mockClient)

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
        text: 'INSERT INTO delivery (name, description, journey, weight_kg, width_cm, height_cm, depth_cm, currency, value, sender, receiver, delivery_status, delivery_rating, delivery_comment, sender_rating, sender_comment) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id;',
        values: ['PS4', 'console with a few games', 1, 0.5, 50, 10, 40, 'USD', 100, 1, 2, 'fulfilled', 5, 'Delivered as promised, thanks!', 2, 'Late for pick-up, hurry up next time']
      })
    })

    it('should throw an error with the query and the original error from the client if the create query fails', async () => {
      const originalCreateError = new Error('Some Create Error')

      mockClient = {
        query: jest.fn().mockRejectedValue(originalCreateError)
      }

      const expectedError = JSON.stringify({
        type: 'queryError',
        message: 'Query Error',
        query: {
          text: 'INSERT INTO delivery (name) VALUES ($1) RETURNING id;',
          values: ['PS4']
        },
        originalError: originalCreateError
      })

      await expect(createDelivery({ input: { name: 'PS4' } }, mockClient)).rejects
        .toEqual(expectedError)
    })

    it('should call client with the correct get query if the creation was successful', async () => {
      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'SELECT * FROM delivery_view WHERE delivery_id = $1;',
        values: [1]
      })
    })

    it('should throw an error with the query and the original error from the client if the get query fails', async () => {
      const originalGetError = new Error('Some Get Error')

      mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({
            rows: [mockDeliveryResponse]
          })
          .mockRejectedValueOnce(originalGetError)
      }

      const expectedError = JSON.stringify({
        type: 'queryError',
        message: 'Query Error',
        query: {
          text: 'SELECT * FROM delivery_view WHERE delivery_id = $1;',
          values: [1]
        },
        originalError: originalGetError
      })

      await expect(createDelivery({ input: { name: 'PS4' } }, mockClient)).rejects
        .toEqual(expectedError)
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

    it('should call client with the correct query', async () => {
      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'UPDATE delivery SET delivery_rating = $2, delivery_comment = $3 WHERE id = $1;',
        values: [2, 5, 'All good']
      })
    })

    it('should throw an error with the query and the original error from the client if the update query fails', async () => {
      const originalUpdateError = new Error('Some Update Error')

      mockClient = {
        query: jest.fn().mockRejectedValue(originalUpdateError)
      }

      const expectedError = JSON.stringify({
        type: 'queryError',
        message: 'Query Error',
        query: {
          text: 'UPDATE delivery SET delivery_rating = $2 WHERE id = $1;',
          values: [2, 5]
        },
        originalError: originalUpdateError
      })

      await expect(updateDelivery({ input: { id: 2, deliveryRating: 5 } }, mockClient)).rejects
        .toEqual(expectedError)
    })

    it('should call client with the correct get query if the update was successful', () => {
      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'SELECT * FROM delivery_view WHERE delivery_id = $1;',
        values: [2]
      })
    })

    it('should throw an error with the query and the original error from the client if the get query fails', async () => {
      const originalGetError = new Error('Some Get Error')

      mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({
            rows: [mockDeliveryResponse]
          })
          .mockRejectedValueOnce(originalGetError)
      }

      const expectedError = JSON.stringify({
        type: 'queryError',
        message: 'Query Error',
        query: {
          text: 'SELECT * FROM delivery_view WHERE delivery_id = $1;',
          values: [2]
        },
        originalError: originalGetError
      })

      await expect(updateDelivery({
        input: {
          id: 2,
          deliveryRating: 5,
          deliveryComment: 'All good'
        }
      }, mockClient)).rejects.toEqual(expectedError)
    })

    it('should call user mapper with the response', async () => {
      expect(mockMapDelivery).toHaveBeenCalledWith(mockDeliveryResponse)
    })

    it('should return the result from the mapper', async () => {
      expect(result).toEqual(mockMapperResult)
    })
  })
})
