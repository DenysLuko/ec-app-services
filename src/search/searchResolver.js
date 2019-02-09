import moment from 'moment'
import {
  validateSearch
} from './searchInputValidator'
import {
  mapSearch
} from './searchMapper'
import {
  zipInputObject,
  camelCaseToSnakeCase
} from '../utils/zipInputObject'

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
  let values = []

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

  let text = 'SELECT * FROM search_view'

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

export const searchResolver = {
  search: async ({ input }, client) => {
    const inputValid = validateSearch(input)

    if (!inputValid) {
      throw new Error('updateUser resolver received invalid input')
    }

    const searchQuery = buildSearchQuery(input)

    const result = await client.query(searchQuery)

    const {
      rowCount,
      rows
    } = result

    const {
      pagination: {
        offset = 0
      } = {}
    } = input

    const mappedResult = mapSearch({
      rowCount,
      rows
    }, offset)

    return mappedResult
  }
}