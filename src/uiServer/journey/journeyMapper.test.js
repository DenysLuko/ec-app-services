import {
  mapJourneySearch,
  mapJourney,
  // eslint-disable-next-line import/named
  __RewireAPI__ as mapJourneySearchRewireAPI
} from './journeyMapper'

const mockSearchResponse = {
  rowCount: 3,
  rows: [
    {
      journey_id: 1,
      journey_name: 'London -> New York',
      journey_description: 'Can take anything you like',
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
    },
    {
      journey_id: 2,
      journey_name: 'London -> New York',
      journey_description: null,
      journey_date: new Date('2019-01-19T00:00:00.000Z'),
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
    },
    {
      journey_id: 4,
      journey_name: 'London -> New York',
      journey_description: 'Able to take documents only',
      journey_date: new Date('2018-12-19T17:15:00.000Z'),
      journey_status: 'upcoming',
      travelling_user_id: 4,
      travelling_user_name: 'Yerke',
      travelling_user_last_name: 'Seitmurat',
      travelling_user_username: 'Yerkeeeeey',
      travelling_user_email: 'yerke_girl@gmail.com',
      travelling_user_birthday: null,
      travelling_user_age: null,
      travelling_user_photo: 'yerke.jpg',
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
    }
  ]
}

describe('journeyMapper', () => {
  describe('mapJourney', () => {
    let mapperResult
    let mockMapUser

    beforeEach(() => {
      mockMapUser = jest.fn(({ id }) => `user${id}`)
      mapJourneySearchRewireAPI.__Rewire__('mapUser', mockMapUser)
      mapperResult = mapJourney(mockSearchResponse.rows[0])
    })

    it('should return the correct id', () => {
      expect(mapperResult).toHaveProperty('id', 1)
    })

    it('should return the correct name', () => {
      expect(mapperResult).toHaveProperty('name', 'London -> New York')
    })

    it('should return the correct descriptions', () => {
      expect(mapperResult).toHaveProperty('description', 'Can take anything you like')
    })

    it('should return the correct status', () => {
      expect(mapperResult).toHaveProperty('status', 'complete')
    })

    it('should call mapUser with the correct arguments', () => {
      expect(mockMapUser).toHaveBeenCalledWith({
        id: 1,
        name: 'Denys',
        last_name: 'Lutsenko',
        username: 'denyslu',
        email: 'denys.luko@gmail.com',
        birthday: mockSearchResponse.rows[0].travelling_user_birthday,
        age: null,
        photo: 'somefile.jpg',
      })
    })

    it('should attach the result from mapUser to the searchResult', () => {
      expect(mapperResult).toHaveProperty('travellingUser', 'user1')
    })

    it('should return the correct origin', () => {
      expect(mapperResult).toHaveProperty('origin', {
        longitude: 51.47,
        latitude: -0.3812,
        locationName: 'Heathrow Airport (LHR)',
        locationAddress: null,
        cityName: 'London',
        countryName: 'United Kingdom'
      })
    })

    it('should return the correct destination', () => {
      expect(mapperResult).toHaveProperty('destination', {
        longitude: 40.6413,
        latitude: -73.7781,
        locationName: 'John F Kennedy Airport (JFK)',
        locationAddress: null,
        cityName: 'New York',
        countryName: 'USA'
      })
    })
  })

  describe('mapJourneySearch', () => {
    it('should return the resultCount', () => {
      expect(mapJourneySearch(mockSearchResponse)).toHaveProperty('resultCount', 3)
    })

    it('should return the offset', () => {
      expect(mapJourneySearch(mockSearchResponse, 0)).toHaveProperty('offset', 0)
    })

    describe('results', () => {
      let firstResult
      let secondResult
      let thirdResult

      beforeEach(() => {
        const {
          results: [
            resultOne,
            resultTwo,
            resultThree
          ]
        } = mapJourneySearch(mockSearchResponse, 0)

        firstResult = resultOne
        secondResult = resultTwo
        thirdResult = resultThree
      })

      it('should return the correct ids', () => {
        expect(firstResult).toHaveProperty('id', 1)
        expect(secondResult).toHaveProperty('id', 2)
        expect(thirdResult).toHaveProperty('id', 4)
      })

      it('should return the correct names', () => {
        expect(firstResult).toHaveProperty('name', 'London -> New York')
        expect(secondResult).toHaveProperty('name', 'London -> New York')
        expect(thirdResult).toHaveProperty('name', 'London -> New York')
      })

      it('should return the correct descriptions', () => {
        expect(firstResult).toHaveProperty('description', 'Can take anything you like')
        expect(secondResult).toHaveProperty('description', null)
        expect(thirdResult).toHaveProperty('description', 'Able to take documents only')
      })

      it('should return the correct statuses', () => {
        expect(firstResult).toHaveProperty('status', 'complete')
        expect(secondResult).toHaveProperty('status', 'complete')
        expect(thirdResult).toHaveProperty('status', 'upcoming')
      })

      describe('travellingUser', () => {
        let mockMapUser

        beforeEach(() => {
          mockMapUser = jest.fn(({ id }) => `user${id}`)
          mapJourneySearchRewireAPI.__Rewire__('mapUser', mockMapUser)
          mapJourneySearch(mockSearchResponse, 0)
        })

        it('should call mapUser with the first user', () => {
          expect(mockMapUser).toHaveBeenCalledWith({
            id: 1,
            name: 'Denys',
            last_name: 'Lutsenko',
            username: 'denyslu',
            email: 'denys.luko@gmail.com',
            birthday: mockSearchResponse.rows[0].travelling_user_birthday,
            age: null,
            photo: 'somefile.jpg',
          })
        })

        it('should call mapUser with the second user', () => {
          expect(mockMapUser).toHaveBeenCalledWith({
            id: 1,
            name: 'Denys',
            last_name: 'Lutsenko',
            username: 'denyslu',
            email: 'denys.luko@gmail.com',
            birthday: mockSearchResponse.rows[1].travelling_user_birthday,
            age: null,
            photo: 'somefile.jpg',
          })
        })

        it('should call mapUser with the third user', () => {
          expect(mockMapUser).toHaveBeenCalledWith({
            id: 4,
            name: 'Yerke',
            last_name: 'Seitmurat',
            username: 'Yerkeeeeey',
            email: 'yerke_girl@gmail.com',
            birthday: mockSearchResponse.rows[2].travelling_user_birthday,
            age: null,
            photo: 'yerke.jpg',
          })
        })

        it('should attach the result from mapUser to the searchResult', () => {
          expect(firstResult.travellingUser).toEqual('user1')
          expect(secondResult.travellingUser).toEqual('user1')
          expect(thirdResult.travellingUser).toEqual('user4')
        })
      })

      describe('date formatting', () => {
        it('should return the correct format if requested', () => {
          expect(firstResult.date({ format: 'YYYY' })).toEqual('2018')
          expect(secondResult.date({ format: 'YYYY MMM DD' })).toEqual('2019 Jan 19')
          expect(thirdResult.date({ format: 'DD-MM-YYYY' })).toEqual('19-12-2018')
        })

        it('should return the date object if no format is passed', () => {
          expect(firstResult.date({})).toEqual(mockSearchResponse.rows[0].journey_date)
        })
      })

      describe('location', () => {
        it('should return the correct origin', () => {
          expect(firstResult).toHaveProperty('origin', {
            longitude: 51.47,
            latitude: -0.3812,
            locationName: 'Heathrow Airport (LHR)',
            locationAddress: null,
            cityName: 'London',
            countryName: 'United Kingdom'
          })

          expect(secondResult).toHaveProperty('origin', {
            longitude: 51.47,
            latitude: -0.3812,
            locationName: 'Heathrow Airport (LHR)',
            locationAddress: null,
            cityName: 'London',
            countryName: 'United Kingdom'
          })

          expect(thirdResult).toHaveProperty('origin', {
            longitude: 51.47,
            latitude: -0.3812,
            locationName: 'Heathrow Airport (LHR)',
            locationAddress: null,
            cityName: 'London',
            countryName: 'United Kingdom'
          })
        })

        it('should return the correct destination', () => {
          expect(firstResult).toHaveProperty('destination', {
            longitude: 40.6413,
            latitude: -73.7781,
            locationName: 'John F Kennedy Airport (JFK)',
            locationAddress: null,
            cityName: 'New York',
            countryName: 'USA'
          })

          expect(secondResult).toHaveProperty('destination', {
            longitude: 40.6413,
            latitude: -73.7781,
            locationName: 'John F Kennedy Airport (JFK)',
            locationAddress: null,
            cityName: 'New York',
            countryName: 'USA'
          })

          expect(thirdResult).toHaveProperty('destination', {
            longitude: 40.6413,
            latitude: -73.7781,
            locationName: 'John F Kennedy Airport (JFK)',
            locationAddress: null,
            cityName: 'New York',
            countryName: 'USA'
          })
        })
      })
    })
  })
})
