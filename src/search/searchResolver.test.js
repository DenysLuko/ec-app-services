import {
  searchResolver,
  __RewireAPI__ as searchResolverRewireAPI
} from './searchResolver'

const {
  search
} = searchResolver

describe('searchResolver', () => {
  let mockClient
  let mockMapSearch
  let mockMapperResult

  beforeEach(() => {
    mockMapperResult = 'mapResult'

    mockMapSearch = jest.fn(() => mockMapperResult)

    mockClient = {
      query: jest.fn().mockResolvedValue({
        rowCount: 2,
        rows: [1, 2]
      })
    }

    searchResolverRewireAPI.__Rewire__('mapSearch', mockMapSearch)
  })

  describe('search', () => {
    it('should throw an error if the input is invalid', async () => {
      await expect(search({input: { origin: { longitude: 50 } }}, mockClient)).rejects.toThrowError(Error)
    })

    describe('queries', () => {
      it('should build a simple query without clauses', async () => {
        await search({
          input: {}
        }, mockClient)

        expect(mockClient.query).toHaveBeenCalledWith({
          text: 'SELECT * FROM search_view;',
          values: []
        })
      })

      it('should build a full query with all clauses', async () => {
        await search({
          input: {
            origin: {
              longitude: 50,
              latitude: 50,
              withinDistance: 10
            },
            destination: {
              longitude: 51,
              latitude: 49,
              withinDistance: 5
            },
            date: '2019-02-01',
            dateRange: 2,
            pagination: {
              limit: 10,
              offset: 10
            }
          }
        }, mockClient)

        let dateClause = 'journey_date BETWEEN $1 AND $2'
        let expectedFromLocationClause = 'ST_Distance_Sphere(ST_MAKEPOINT(origin_longitude, origin_latitude), ST_MAKEPOINT($3, $4)) < $5'
        let expectedToLocationClause = 'ST_Distance_Sphere(ST_MAKEPOINT(destination_longitude, destination_latitude), ST_MAKEPOINT($6, $7)) < $8'
        let limitClause = 'LIMIT $9'
        let offsetClause = 'OFFSET $10'

        expect(mockClient.query).toHaveBeenCalledWith({
          text: `SELECT * FROM search_view WHERE ${dateClause} AND ${expectedFromLocationClause} AND ${expectedToLocationClause} ${limitClause} ${offsetClause};`,
          values: ['2019-01-30', '2019-02-03', 50, 50, 10, 51, 49, 5, 10, 10]
        })
      })

      describe('limit/offset', () => {
        it('should apply a limit and an offset', async () => {
          await search({
            input: {
              pagination: {
                limit: 10,
                offset: 10
              }
            }
          }, mockClient)

          expect(mockClient.query).toHaveBeenCalledWith({
            text: 'SELECT * FROM search_view LIMIT $1 OFFSET $2;',
            values: [10, 10]
          })
        })
      })

      describe('date', () => {
        it('should call client with the correct date clause without date range', async () => {
          await search({
            input: {
              date: '2019-02-01'
            }
          }, mockClient)

          expect(mockClient.query).toHaveBeenCalledWith({
            text: 'SELECT * FROM search_view WHERE date_trunc(\'day\', journey_date) = $1;',
            values: ['2019-02-01']
          })
        })

        it('should call client with the correct date clause with date range', async () => {
          await search({
            input: {
              date: '2019-02-01',
              dateRange: 2
            }
          }, mockClient)

          expect(mockClient.query).toHaveBeenCalledWith({
            text: 'SELECT * FROM search_view WHERE journey_date BETWEEN $1 AND $2;',
            values: ['2019-01-30', '2019-02-03']
          })
        })
      })

      describe('status', () => {
        it('should call client with the correct status', async () => {
          await search({
            input: {
              status: 'upcoming'
            }
          }, mockClient)

          expect(mockClient.query).toHaveBeenCalledWith({
            text: 'SELECT * FROM search_view WHERE journey_status = $1;',
            values: ['upcoming']
          })
        })
      })

      describe('locations', () => {
        it('should call client with the correct query if both locations are exact', async () => {
          await search({
            input: {
              origin: {
                id: 1
              },
              destination: {
                id: 2
              }
            }
          }, mockClient)

          expect(mockClient.query).toHaveBeenCalledWith({
            text: 'SELECT * FROM search_view WHERE origin_id = $1 AND destination_id = $2;',
            values: [1, 2]
          })
        })

        it('should call client with the correct query if both locations are approximate', async () => {
          await search({
            input: {
              origin: {
                longitude: 50,
                latitude: 50,
                withinDistance: 10
              },
              destination: {
                longitude: 51,
                latitude: 49,
                withinDistance: 5
              }
            }
          }, mockClient)

          let expectedFromLocationClause = 'ST_Distance_Sphere(ST_MAKEPOINT(origin_longitude, origin_latitude), ST_MAKEPOINT($1, $2)) < $3'
          let expectedToLocationClause = 'ST_Distance_Sphere(ST_MAKEPOINT(destination_longitude, destination_latitude), ST_MAKEPOINT($4, $5)) < $6'

          expect(mockClient.query).toHaveBeenCalledWith({
            text: `SELECT * FROM search_view WHERE ${expectedFromLocationClause} AND ${expectedToLocationClause};`,
            values: [50, 50, 10, 51, 49, 5]
          })
        })

        it('should call client with the correct query if one location is exact and the other approximate', async () => {
          await search({
            input: {
              origin: {
                longitude: 50,
                latitude: 50,
                withinDistance: 10
              },
              destination: {
                id: 2
              }
            }
          }, mockClient)

          let expectedFromLocationClause = 'ST_Distance_Sphere(ST_MAKEPOINT(origin_longitude, origin_latitude), ST_MAKEPOINT($1, $2)) < $3'
          let expectedToLocationClause = 'destination_id = $4'

          expect(mockClient.query).toHaveBeenCalledWith({
            text: `SELECT * FROM search_view WHERE ${expectedFromLocationClause} AND ${expectedToLocationClause};`,
            values: [50, 50, 10, 2]
          })
        })

        it('should call client with the correct query if one location is exact and the other approximate and the date is a range', async () => {
          await search({
            input: {
              origin: {
                longitude: 50,
                latitude: 50,
                withinDistance: 10
              },
              destination: {
                id: 2
              }
            }
          }, mockClient)

          let expectedFromLocationClause = 'ST_Distance_Sphere(ST_MAKEPOINT(origin_longitude, origin_latitude), ST_MAKEPOINT($1, $2)) < $3'
          let expectedToLocationClause = 'destination_id = $4'

          expect(mockClient.query).toHaveBeenCalledWith({
            text: `SELECT * FROM search_view WHERE ${expectedFromLocationClause} AND ${expectedToLocationClause};`,
            values: [50, 50, 10, 2]
          })
        })
      })
    })

    it('should call mapSearch with the result and the offset', async () => {
      await search({
        input: {
          pagination: {
            limit: 10,
            offset: 10
          }
        }
      }, mockClient)

      expect(mockMapSearch).toHaveBeenCalledWith({
        rowCount: 2,
        rows: [1, 2]
      }, 10)
    })

    it('should call mapSearch with the result and offset set to 0 if no pagination was given', async () => {
      await search({
        input: {}
      }, mockClient)

      expect(mockMapSearch).toHaveBeenCalledWith({
        rowCount: 2,
        rows: [1, 2]
      }, 0)
    })

    it('should return the result from mapSearch', async () => {
      const result = await search({
        input: {}
      }, mockClient)

      expect(result).toEqual(mockMapperResult)
    })
  })
})
