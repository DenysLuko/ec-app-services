import {
  mapDelivery,
  // eslint-disable-next-line import/named
  __RewireAPI__ as mapDeliveryRewireAPI
} from './deliveryMapper'

describe('deliveryMapper', () => {
  describe('mapDelivery', () => {
    let mockDeliveryResponse
    let mockMapUser
    let mockMapJourney
    let result
    let mockMapJourneyResult
    let mockMapUserResult

    beforeEach(() => {
      mockDeliveryResponse = {
        delivery_id: 1,
        delivery_name: 'PS4',
        delivery_description: 'console with a few games',
        delivery_weight_kg: 0.5,
        delivery_width_cm: null,
        delivery_height_cm: null,
        delivery_depth_cm: null,
        delivery_currency: 'USD',
        delivery_value: 150,
        delivery_status: 'fulfilled',
        delivery_rating: 5,
        delivery_comment: 'Everything went as planned. Thank you!',
        delivery_sender_rating: 5,
        delivery_sender_comment: 'Picked up as agreed',
        delivery_cancelled_comment: null,
        journey_id: 1,
        journey_name: null,
        journey_description: null,
        journey_date: new Date('2018-12-19T04:05:06.000Z'),
        journey_status: 'complete',
        travelling_user_id: 1,
        travelling_user_name: 'Denys',
        travelling_user_last_name: 'Lutsenko',
        travelling_user_username: 'denyslu',
        travelling_user_email: 'denys.luko@gmail.com',
        travelling_user_birthday: new Date('1989-01-05T00:00:00.000Z'),
        travelling_user_age: null,
        travelling_user_photo: 'somefile.jpg',
        origin_id: 1,
        origin_name: 'Heathrow Airport (LHR)',
        origin_address: null,
        origin_city: 'London',
        origin_country: 'United Kingdom',
        origin_type: 'airport',
        origin_longitude: 51.47,
        origin_latitude: -0.3812,
        destination_id: 6,
        destination_name: 'John F Kennedy Airport (JFK)',
        destination_address: null,
        destination_city: 'New York',
        destination_country: 'USA',
        destination_type: 'airport',
        destination_longitude: 40.6413,
        destination_latitude: -73.7781,
        sender_id: 2,
        sender_name: 'Ula',
        sender_last_name: 'Seitmurat',
        sender_username: 'ulchik',
        sender_email: 'www.ulzhan@gmail.com',
        sender_birthday: new Date('1991-12-03T00:00:00.000Z'),
        sender_age: null,
        sender_photo: 'somefile.jpg',
        receiver_id: 3,
        receiver_name: 'Daniel',
        receiver_last_name: 'Drosdow',
        receiver_username: 'ddro',
        receiver_email: 'daniel.dro@gmail.com',
        receiver_birthday: new Date('2000-03-22T00:00:00.000Z'),
        receiver_age: null,
        receiver_photo: 'image.jpg'
      }

      mockMapJourneyResult = 'journey'
      mockMapUserResult = 'user'

      mockMapJourney = jest.fn(() => mockMapJourneyResult)
      mockMapUser = jest.fn(({ id }) => mockMapUserResult + id)

      mapDeliveryRewireAPI.__Rewire__('mapJourney', mockMapJourney)
      mapDeliveryRewireAPI.__Rewire__('mapUser', mockMapUser)

      result = mapDelivery(mockDeliveryResponse)
    })

    it('should return the id', () => {
      expect(result).toHaveProperty('id', 1)
    })

    it('should return the name', () => {
      expect(result).toHaveProperty('name', 'PS4')
    })

    it('should return the description', () => {
      expect(result).toHaveProperty('description', 'console with a few games')
    })

    it('should return the weightKg', () => {
      expect(result).toHaveProperty('weightKg', 0.5)
    })

    it('should return the widthCm', () => {
      expect(result).toHaveProperty('widthCm', null)
    })

    it('should return the heightCm', () => {
      expect(result).toHaveProperty('heightCm', null)
    })

    it('should return the depthCm', () => {
      expect(result).toHaveProperty('depthCm', null)
    })

    it('should return the currency', () => {
      expect(result).toHaveProperty('currency', 'USD')
    })

    it('should return the value', () => {
      expect(result).toHaveProperty('value', 150)
    })

    it('should return the deliveryStatus', () => {
      expect(result).toHaveProperty('deliveryStatus', 'fulfilled')
    })

    it('should return the deliveryRating', () => {
      expect(result).toHaveProperty('deliveryRating', 5)
    })

    it('should return the deliveryComment', () => {
      expect(result).toHaveProperty('deliveryComment', 'Everything went as planned. Thank you!')
    })

    it('should return the senderRating', () => {
      expect(result).toHaveProperty('senderRating', 5)
    })

    it('should return the senderComment', () => {
      expect(result).toHaveProperty('senderComment', 'Picked up as agreed')
    })

    it('should return the cancelledComment', () => {
      expect(result).toHaveProperty('cancelledComment', null)
    })

    it('should call mapJourney with the correct arguments', () => {
      expect(mockMapJourney).toHaveBeenCalledWith({
        journey_id: 1,
        journey_name: null,
        journey_description: null,
        journey_date: new Date('2018-12-19T04:05:06.000Z'),
        journey_status: 'complete',
        travelling_user_id: 1,
        travelling_user_name: 'Denys',
        travelling_user_last_name: 'Lutsenko',
        travelling_user_username: 'denyslu',
        travelling_user_email: 'denys.luko@gmail.com',
        travelling_user_birthday: new Date('1989-01-05T00:00:00.000Z'),
        travelling_user_age: null,
        travelling_user_photo: 'somefile.jpg',
        origin_id: 1,
        origin_name: 'Heathrow Airport (LHR)',
        origin_address: null,
        origin_city: 'London',
        origin_country: 'United Kingdom',
        origin_type: 'airport',
        origin_longitude: 51.47,
        origin_latitude: -0.3812,
        destination_id: 6,
        destination_name: 'John F Kennedy Airport (JFK)',
        destination_address: null,
        destination_city: 'New York',
        destination_country: 'USA',
        destination_type: 'airport',
        destination_longitude: 40.6413,
        destination_latitude: -73.7781
      })
    })

    it('should return the journey', () => {
      expect(result).toHaveProperty('journey', mockMapJourneyResult)
    })

    it('should call mapUser with the correct arguments for the sender', () => {
      expect(mockMapUser).toHaveBeenCalledWith({
        id: 2,
        name: 'Ula',
        last_name: 'Seitmurat',
        username: 'ulchik',
        email: 'www.ulzhan@gmail.com',
        birthday: new Date('1991-12-03T00:00:00.000Z'),
        age: null,
        photo: 'somefile.jpg'
      })
    })

    it('should return the sender', () => {
      expect(result).toHaveProperty('sender', mockMapUserResult + mockDeliveryResponse.sender_id.toString())
    })

    it('should call mapUser with the correct arguments for the receiver', () => {
      expect(mockMapUser).toHaveBeenCalledWith({
        id: 3,
        name: 'Daniel',
        last_name: 'Drosdow',
        username: 'ddro',
        email: 'daniel.dro@gmail.com',
        birthday: new Date('2000-03-22T00:00:00.000Z'),
        age: null,
        photo: 'image.jpg'
      })
    })

    it('should return the receiver', () => {
      expect(result).toHaveProperty('receiver', mockMapUserResult + mockDeliveryResponse.receiver_id.toString())
    })
  })
})
