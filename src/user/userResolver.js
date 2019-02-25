import {
  mapUser
} from './userMapper'
import {
  generatePlaceholders,
  zipInputObject,
  camelCaseToSnakeCase
} from '../utils'

const buildGetUserQuery = (id) => ({
  text: 'SELECT * FROM app_user WHERE id = $1;',
  values: [id]
})

const buildCreateUserQuery = (columnNames = [], columnValues = []) => ({
  text: `INSERT INTO app_user (${columnNames.join(', ')}) VALUES (${generatePlaceholders(columnValues.length)}) RETURNING *;`,
  values: [...columnValues]
})

const buildUpdateUserQuery = (id, columnNames = [], columnValues = []) => ({
  text: `UPDATE app_user SET ${columnNames.map((col, ind) => `${col} = $${ind + 2}`).join(', ')} WHERE id = $1 RETURNING *;`,
  values: [id, ...columnValues]
})

export const userResolver = {
  getUser: async ({ id } = {}, client) => {
    const query = buildGetUserQuery(id)

    const result = await client.query(query)

    const {
      rows: [
        dbUserObject
      ] = []
    } = result

    return mapUser(dbUserObject)
  },

  createUser: async ({ input }, client) => {
    const snakeCasedInput = camelCaseToSnakeCase(input)

    const {
      columnNames,
      columnValues
    } = zipInputObject(snakeCasedInput)

    const createUserQuery = buildCreateUserQuery(columnNames, columnValues)

    const result = await client.query(createUserQuery)

    const {
      rows: [
        dbUserObject
      ] = []
    } = result

    return mapUser(dbUserObject)
  },

  updateUser: async ({
    id,
    input
  }, client) => {
    const inputValid = Object.keys(input).length > 0

    if (!inputValid) {
      throw new Error('updateUser resolver received invalid input')
    }

    const snakeCasedInput = camelCaseToSnakeCase(input)

    const {
      columnNames,
      columnValues
    } = zipInputObject(snakeCasedInput)

    const updateUserQuery = buildUpdateUserQuery(id, columnNames, columnValues)

    const result = await client.query(updateUserQuery)

    const {
      rows: [
        dbUserObject
      ] = []
    } = result

    return mapUser(dbUserObject)
  }
}