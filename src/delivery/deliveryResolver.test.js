import {
  deliveryResolver,
  __RewireAPI__ as deliveryResolverRewireAPI
} from './deliveryResolver'

const {
  getDelivery
} = deliveryResolver

describe('deliveryResolver', () => {
  describe('getDelivery', () => {
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
})
