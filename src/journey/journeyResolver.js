import moment from 'moment'
import {
  validateSearchJourney
} from './journeyInputValidator'
import {
  mapJourneySearch,
  mapJourney
} from './journeyMapper'
import {
  generatePlaceholders,
  zipInputObject,
  camelCaseToSnakeCase,
  generateQueryError
} from '../utils'

const buildSearchQuery = ({
  origin: {
    id: originId,
    longitude: originLongitude,
    latitude: originLatitude,
    withinDistance: originWithinDistance
  } = {},
  destination: {
    id: destinationId,
    longitude: destinationLongitude,
    latitude: destinationLatitude,
    withinDistance: destinationWithinDistance
  } = {},
  date,
  dateRange,
  status,
  pagination: {
    limit,
    offset
  } = {}
}) => {
  let fromClause
  let toClause
  let statusClause
  let dateClause
  let limitClause
  let offsetClause
  let nextPlaceholder = 1

  const values = []

  if (date && dateRange) {
    const fromDate = moment(date).subtract(dateRange, 'days').format('YYYY-MM-DD')
    const toDate = moment(date).add(dateRange, 'days').format('YYYY-MM-DD')
    dateClause = `journey_date BETWEEN $${nextPlaceholder++} AND $${nextPlaceholder++}`
    values.push(fromDate, toDate)
  } else if (date) {
    dateClause = `date_trunc('day', journey_date) = $${nextPlaceholder++}`
    values.push(moment(date).format('YYYY-MM-DD'))
  }

  if (originId) {
    fromClause = `origin_id = $${nextPlaceholder++}`
    values.push(originId)
  } else if (originLongitude && originLatitude && originWithinDistance) {
    fromClause = `ST_Distance_Sphere(ST_MAKEPOINT(origin_longitude, origin_latitude), ST_MAKEPOINT($${nextPlaceholder++}, $${nextPlaceholder++})) < $${nextPlaceholder++}`
    values.push(originLongitude, originLatitude, originWithinDistance)
  }

  if (destinationId) {
    toClause = `destination_id = $${nextPlaceholder++}`
    values.push(destinationId)
  } else if (destinationLongitude && destinationLatitude && destinationWithinDistance) {
    toClause = `ST_Distance_Sphere(ST_MAKEPOINT(destination_longitude, destination_latitude), ST_MAKEPOINT($${nextPlaceholder++}, $${nextPlaceholder++})) < $${nextPlaceholder++}`
    values.push(destinationLongitude, destinationLatitude, destinationWithinDistance)
  }

  if (status) {
    statusClause = `journey_status = $${nextPlaceholder++}`
    values.push(status)
  }

  if (limit) {
    limitClause = `LIMIT $${nextPlaceholder++}`
    values.push(limit)
  }

  if (offset) {
    offsetClause = `OFFSET $${nextPlaceholder++}`
    values.push(offset)
  }

  const whereClauseFragments = [
    dateClause,
    fromClause,
    toClause,
    statusClause
  ].filter(Boolean)

  const whereClause = whereClauseFragments.length ? `WHERE ${whereClauseFragments.join(' AND ')}` : ''

  let text = 'SELECT * FROM journey_view'

  if (whereClause) {
    text += ` ${whereClause}`
  }

  if (limitClause) {
    text += ` ${limitClause}`
  }

  if (offsetClause) {
    text += ` ${offsetClause}`
  }

  text += ';'

  return {
    text,
    values
  }
}

const buildCreateJourneyQuery = (columnNames = [], columnValues = []) => ({
  text: `INSERT INTO journey (${columnNames.join(', ')}) VALUES (${generatePlaceholders(columnValues.length)}) RETURNING id;`,
  values: [...columnValues]
})

const buildGetJourneyQuery = id => ({
  text: 'SELECT * FROM journey_view WHERE journey_id = $1;',
  values: [id]
})

const buildUpdateJourneyQuery = (id, columnNames = [], columnValues = []) => ({
  text: `UPDATE journey SET ${columnNames.map((col, ind) => `${col} = $${ind + 2}`).join(', ')} WHERE id = $1;`,
  values: [id, ...columnValues]
})

export const journeyResolver = {
  searchJourney: async ({ input }, client) => {
    const inputValid = validateSearchJourney(input)

    if (!inputValid) {
      throw new Error('updateUser resolver received invalid input')
    }

    const searchQuery = buildSearchQuery(input)

    let searchResult

    try {
      searchResult = await client.query(searchQuery)
    } catch (originalError) {
      throw generateQueryError('Query Error', searchQuery, originalError)
    }

    const {
      rowCount,
      rows
    } = searchResult

    const {
      pagination: {
        offset = 0
      } = {}
    } = input

    const mappedResult = mapJourneySearch({
      rowCount,
      rows
    }, offset)

    return mappedResult
  },

  createJourney: async ({ input }, client) => {
    const snakeCasedInput = camelCaseToSnakeCase(input)

    const {
      columnNames,
      columnValues
    } = zipInputObject(snakeCasedInput)

    const createJourneyQuery = buildCreateJourneyQuery(columnNames, columnValues)

    let createResult

    try {
      createResult = await client.query(createJourneyQuery)
    } catch (originalError) {
      throw generateQueryError('Query Error', createJourneyQuery, originalError)
    }

    const {
      rows: [
        {
          id: newJourneyId
        }
      ]
    } = createResult

    const getQuery = buildGetJourneyQuery(newJourneyId)

    let getJourneyResult

    try {
      getJourneyResult = await client.query(getQuery)
    } catch (originalError) {
      throw generateQueryError('Query Error', getQuery, originalError)
    }

    const {
      rows: [
        dbJourneyObject
      ]
    } = getJourneyResult

    return mapJourney(dbJourneyObject)
  },

  getJourney: async ({ id }, client) => {
    const getQuery = buildGetJourneyQuery(id)

    let getResult

    try {
      getResult = await client.query(getQuery)
    } catch (originalError) {
      throw generateQueryError('Query Error', getQuery, originalError)
    }

    const {
      rows: [
        dbJourneyObject
      ] = []
    } = getResult

    return mapJourney(dbJourneyObject)
  },

  updateJourney: async ({
    input
  }, client) => {
    const {
      id,
      ...updatedFields
    } = input

    const inputValid = Object.keys(updatedFields).length > 0

    if (!inputValid) {
      throw new Error('updateJourney resolver received invalid input')
    }

    const snakeCasedInput = camelCaseToSnakeCase(updatedFields)

    const {
      columnNames,
      columnValues
    } = zipInputObject(snakeCasedInput)

    const updateUserQuery = buildUpdateJourneyQuery(id, columnNames, columnValues)

    try {
      await client.query(updateUserQuery)
    } catch (originalError) {
      throw generateQueryError('Query Error', updateUserQuery, originalError)
    }

    const getQuery = buildGetJourneyQuery(id)

    let updatedJourneyResult

    try {
      updatedJourneyResult = await client.query(getQuery)
    } catch (originalError) {
      throw generateQueryError('Query Error', getQuery, originalError)
    }

    const {
      rows: [
        dbUserObject
      ] = []
    } = updatedJourneyResult

    return mapJourney(dbUserObject)
  }
}
