import { mapDelivery } from './deliveryMapper'
import {
  generatePlaceholders,
  zipInputObject,
  camelCaseToSnakeCase,
  generateQueryError
} from '../utils'

const buildGetDeliveryQuery = (id) => ({
  text: 'SELECT * FROM delivery_view WHERE delivery_id = $1;',
  values: [id]
})

const buildCreateDeliveryQuery = (columnNames = [], columnValues = []) => ({
  text: `INSERT INTO delivery (${columnNames.join(', ')}) VALUES (${generatePlaceholders(columnValues.length)}) RETURNING id;`,
  values: [...columnValues]
})

const buildUpdateDeliveryQuery = (id, columnNames = [], columnValues = []) => ({
  text: `UPDATE delivery SET ${columnNames.map((col, ind) => `${col} = $${ind + 2}`).join(', ')} WHERE id = $1;`,
  values: [id, ...columnValues]
})

export const deliveryResolver = {
  getDelivery: async ({ id }, client) => {
    const query = buildGetDeliveryQuery(id)

    let getResult

    try {
      getResult = await client.query(query)
    } catch (originalError) {
      throw generateQueryError('Query Error', query, originalError)
    }

    const {
      rows: [
        dbDeliveryObject
      ] = []
    } = getResult

    return mapDelivery(dbDeliveryObject)
  },

  createDelivery: async ({ input }, client) => {
    const snakeCasedInput = camelCaseToSnakeCase(input)

    const {
      columnNames,
      columnValues
    } = zipInputObject(snakeCasedInput)

    const createDeliveryQuery = buildCreateDeliveryQuery(columnNames, columnValues)

    let createResult

    try {
      createResult = await client.query(createDeliveryQuery)
    } catch (originalError) {
      throw generateQueryError('Query Error', createDeliveryQuery, originalError)
    }

    const {
      rows: [
        {
          id: newDeliveryId
        }
      ]
    } = createResult

    const getQuery = buildGetDeliveryQuery(newDeliveryId)

    let getResult

    try {
      getResult = await client.query(getQuery)
    } catch (originalError) {
      throw generateQueryError('Query Error', getQuery, originalError)
    }

    const {
      rows: [
        dbUserObject
      ]
    } = getResult

    return mapDelivery(dbUserObject)
  },

  updateDelivery: async ({ input }, client) => {
    const {
      id,
      ...rest
    } = input

    const snakeCasedInput = camelCaseToSnakeCase(rest)

    const {
      columnNames,
      columnValues
    } = zipInputObject(snakeCasedInput)

    const updateDeliveryQuery = buildUpdateDeliveryQuery(id, columnNames, columnValues)

    try {
      await client.query(updateDeliveryQuery)
    } catch (originalError) {
      throw generateQueryError('Query Error', updateDeliveryQuery, originalError)
    }

    const getQuery = buildGetDeliveryQuery(id)

    let getResult

    try {
      getResult = await client.query(getQuery)
    } catch (originalError) {
      throw generateQueryError('Query Error', getQuery, originalError)
    }

    const {
      rows: [
        dbUserObject
      ]
    } = getResult

    return mapDelivery(dbUserObject)
  }
}
