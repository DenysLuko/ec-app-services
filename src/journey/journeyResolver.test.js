import {
  journeyResolver,
  __RewireAPI__ as journeyResolverRewireAPI
} from './journeyResolver'

const {
  searchJourney,
  createJourney,
  getJourney,
  updateJourney
} = journeyResolver

describe('journeyResolver', () => {
  describe('createJourney', () => {
    let mockClient
    let mockMapJourney
    let mockMapperResult
    let mockCreateResult
    let createJourneyResolverResult

    beforeEach(async () => {
      mockMapperResult = 'mapResult'
      mockCreateResult = 'clientResult'

      mockMapJourney = jest.fn(() => mockMapperResult)

      mockClient = {
        query: jest.fn().mockResolvedValue({
          rowCount: 1,
          rows: [mockCreateResult]
        })
      }

      journeyResolverRewireAPI.__Rewire__('mapJourney', mockMapJourney)

      createJourneyResolverResult = await createJourney({ input: {
          name: 'LHR -> Moon',
          description: 'Take whatever you want',
          date: '2044-11-03',
          user: 1,
          origin: 1,
          destination: 9
        }
      }, mockClient)
    })

    it('should call client with the correct query', async () => {
      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'INSERT INTO journey (name, description, date, user, origin, destination) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
        values: ['LHR -> Moon', 'Take whatever you want', '2044-11-03', 1, 1, 9]
      })
    })

    it('should call journey mapper with the response', async () => {
      expect(mockMapJourney).toHaveBeenCalledWith(mockCreateResult)
    })

    it('should return the result from the mapper', async () => {
      expect(createJourneyResolverResult).toEqual(mockMapperResult)
    })
  })

  describe('updateJourney', () => {
    let mockClient
    let mockMapJourney
    let mockMapperResult
    let mockUpdateResult
    let updateJourneyResolverResult

    beforeEach(async () => {
      mockMapperResult = 'mapResult'
      mockUpdateResult = 'clientResult'

      mockMapJourney = jest.fn(() => mockMapperResult)

      mockClient = {
        query: jest.fn().mockResolvedValue({
          rowCount: 1,
          rows: [mockUpdateResult]
        })
      }

      journeyResolverRewireAPI.__Rewire__('mapJourney', mockMapJourney)

      updateJourneyResolverResult = await updateJourney({
        id: 14,
        input: {
          name: 'newName',
          destination: 2
        }
      }, mockClient)
    })

    it('should throw an error if the input is empty', async () => {
      await expect(updateJourney({id: 1, input: {}}, mockClient)).rejects.toThrowError(Error)
    })

    it('should call client with the correct query', async () => {
      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'UPDATE journey SET name = $2, destination = $3 WHERE id = $1 RETURNING *;',
        values: [14, 'newName', 2]
      })
    })

    it('should call journeyMapper with the result returned from the client', () => {
      expect(mockMapJourney).toHaveBeenCalledWith(mockUpdateResult)
    })

    it('should return the mapper result', () => {
      expect(updateJourneyResolverResult).toEqual(mockMapperResult)
    })
  })

  describe('getJourney', () => {
    let mockClient
    let mockMapJourney
    let mockMapperResult
    let mockGetResult
    let getJourneyResolverResult

    beforeEach(async () => {
      mockMapperResult = 'mapResult'
      mockGetResult = 'clientResult'

      mockMapJourney = jest.fn(() => mockMapperResult)

      mockClient = {
        query: jest.fn().mockResolvedValue({
          rowCount: 1,
          rows: [mockGetResult]
        })
      }

      journeyResolverRewireAPI.__Rewire__('mapJourney', mockMapJourney)

      getJourneyResolverResult = await getJourney({ id: 44 }, mockClient)
    })

    it('should call client with the correct query', async () => {
      expect(mockClient.query).toHaveBeenCalledWith({
        text: 'SELECT * FROM journey_view WHERE id = $1;',
        values: [44]
      })
    })

    it('should call journey mapper with the response', async () => {
      expect(mockMapJourney).toHaveBeenCalledWith(mockGetResult)
    })

    it('should return the result from the mapper', async () => {
      expect(getJourneyResolverResult).toEqual(mockMapperResult)
    })
  })

  describe('searchJourney', () => {
    let mockClient
    let mockMapJourneySearch
    let mockMapperResult

    beforeEach(() => {
      mockMapperResult = 'mapResult'

      mockMapJourneySearch = jest.fn(() => mockMapperResult)

      mockClient = {
        query: jest.fn().mockResolvedValue({
          rowCount: 2,
          rows: [1, 2]
        })
      }

      journeyResolverRewireAPI.__Rewire__('mapJourneySearch', mockMapJourneySearch)
    })

    it('should throw an error if the input is invalid', async () => {
      await expect(searchJourney({input: { origin: { longitude: 50 } }}, mockClient)).rejects.toThrowError(Error)
    })

    describe('queries', () => {
      it('should build a simple query without clauses', async () => {
        await searchJourney({
          input: {}
        }, mockClient)

        expect(mockClient.query).toHaveBeenCalledWith({
          text: 'SELECT * FROM journey_view;',
          values: []
        })
      })

      it('should build a full query with all clauses', async () => {
        await searchJourney({
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
          text: `SELECT * FROM journey_view WHERE ${dateClause} AND ${expectedFromLocationClause} AND ${expectedToLocationClause} ${limitClause} ${offsetClause};`,
          values: ['2019-01-30', '2019-02-03', 50, 50, 10, 51, 49, 5, 10, 10]
        })
      })

      describe('limit/offset', () => {
        it('should apply a limit and an offset', async () => {
          await searchJourney({
            input: {
              pagination: {
                limit: 10,
                offset: 10
              }
            }
          }, mockClient)

          expect(mockClient.query).toHaveBeenCalledWith({
            text: 'SELECT * FROM journey_view LIMIT $1 OFFSET $2;',
            values: [10, 10]
          })
        })
      })

      describe('date', () => {
        it('should call client with the correct date clause without date range', async () => {
          await searchJourney({
            input: {
              date: '2019-02-01'
            }
          }, mockClient)

          expect(mockClient.query).toHaveBeenCalledWith({
            text: 'SELECT * FROM journey_view WHERE date_trunc(\'day\', journey_date) = $1;',
            values: ['2019-02-01']
          })
        })

        it('should call client with the correct date clause with date range', async () => {
          await searchJourney({
            input: {
              date: '2019-02-01',
              dateRange: 2
            }
          }, mockClient)

          expect(mockClient.query).toHaveBeenCalledWith({
            text: 'SELECT * FROM journey_view WHERE journey_date BETWEEN $1 AND $2;',
            values: ['2019-01-30', '2019-02-03']
          })
        })
      })

      describe('status', () => {
        it('should call client with the correct status', async () => {
          await searchJourney({
            input: {
              status: 'upcoming'
            }
          }, mockClient)

          expect(mockClient.query).toHaveBeenCalledWith({
            text: 'SELECT * FROM journey_view WHERE journey_status = $1;',
            values: ['upcoming']
          })
        })
      })

      describe('locations', () => {
        it('should call client with the correct query if both locations are exact', async () => {
          await searchJourney({
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
            text: 'SELECT * FROM journey_view WHERE origin_id = $1 AND destination_id = $2;',
            values: [1, 2]
          })
        })

        it('should call client with the correct query if both locations are approximate', async () => {
          await searchJourney({
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
            text: `SELECT * FROM journey_view WHERE ${expectedFromLocationClause} AND ${expectedToLocationClause};`,
            values: [50, 50, 10, 51, 49, 5]
          })
        })

        it('should call client with the correct query if one location is exact and the other approximate', async () => {
          await searchJourney({
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
            text: `SELECT * FROM journey_view WHERE ${expectedFromLocationClause} AND ${expectedToLocationClause};`,
            values: [50, 50, 10, 2]
          })
        })

        it('should call client with the correct query if one location is exact and the other approximate and the date is a range', async () => {
          await searchJourney({
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
            text: `SELECT * FROM journey_view WHERE ${expectedFromLocationClause} AND ${expectedToLocationClause};`,
            values: [50, 50, 10, 2]
          })
        })
      })
    })

    it('should call MapJourneySearch with the result and the offset', async () => {
      await searchJourney({
        input: {
          pagination: {
            limit: 10,
            offset: 10
          }
        }
      }, mockClient)

      expect(mockMapJourneySearch).toHaveBeenCalledWith({
        rowCount: 2,
        rows: [1, 2]
      }, 10)
    })

    it('should call MapJourneySearch with the result and offset set to 0 if no pagination was given', async () => {
      await searchJourney({
        input: {}
      }, mockClient)

      expect(mockMapJourneySearch).toHaveBeenCalledWith({
        rowCount: 2,
        rows: [1, 2]
      }, 0)
    })

    it('should return the result from MapJourneySearch', async () => {
      const result = await searchJourney({
        input: {}
      }, mockClient)

      expect(result).toEqual(mockMapperResult)
    })
  })
})
