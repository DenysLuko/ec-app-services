import { mapDelivery } from './deliveryMapper'
import {
  generatePlaceholders,
  zipInputObject,
  camelCaseToSnakeCase
} from '../utils'

const buildGetDeliveryQuery = (id) => ({
  text: 'SELECT * FROM delivery_view WHERE delivery_id = $1;',
  values: [id]
})

const buildCreateDeliveryQuery = (columnNames = [], columnValues = []) => ({
  text: `INSERT INTO delivery (${columnNames.join(', ')}) VALUES (${generatePlaceholders(columnValues.length)}) RETURNING *;`,
  values: [...columnValues]
})

const buildUpdateDeliveryQuery = (id, columnNames = [], columnValues = []) => ({
  text: `UPDATE delivery SET ${columnNames.map((col, ind) => `${col} = $${ind + 2}`).join(', ')} WHERE id = $1 RETURNING *;`,
  values: [id, ...columnValues]
})

export const deliveryResolver = {
  getDelivery: async ({ deliveryId }, client) => {
    const query = buildGetDeliveryQuery(deliveryId)

    const result = await client.query(query)

    const {
      rows: [
        dbDeliveryObject
      ] = []
    } = result

    return mapDelivery(dbDeliveryObject)
  },

  createDelivery: async ({ input }, client) => {
    const snakeCasedInput = camelCaseToSnakeCase(input)

    const {
      columnNames,
      columnValues
    } = zipInputObject(snakeCasedInput)

    const createDeliveryQuery = buildCreateDeliveryQuery(columnNames, columnValues)

    const result = await client.query(createDeliveryQuery)

    const {
      rows: [
        dbUserObject
      ] = []
    } = result

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

    const result = await client.query(updateDeliveryQuery)

    const {
      rows: [
        dbUserObject
      ] = []
    } = result

    return mapDelivery(dbUserObject)
  }
}
