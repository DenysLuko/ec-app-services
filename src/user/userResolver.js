import {
  mapUser
} from './userMapper'
import {
  generatePlaceholders,
  zipInputObject,
  camelCaseToSnakeCase,
  generateQueryError
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
    const getQuery = buildGetUserQuery(id)

    let getResult

    try {
      getResult = await client.query(getQuery)
    } catch(originalError) {
      throw generateQueryError('Query Error', getQuery, originalError)
    }

    const {
      rows: [
        dbUserObject
      ] = []
    } = getResult

    return mapUser(dbUserObject)
  },

  createUser: async ({ input }, client) => {
    const snakeCasedInput = camelCaseToSnakeCase(input)

    const {
      columnNames,
      columnValues
    } = zipInputObject(snakeCasedInput)

    const createUserQuery = buildCreateUserQuery(columnNames, columnValues)

    let createResult

    try {
      createResult = await client.query(createUserQuery)
    } catch (originalError) {
      throw generateQueryError('Query Error', createUserQuery, originalError)
    }

    const {
      rows: [
        dbUserObject
      ] = []
    } = createResult

    return mapUser(dbUserObject)
  },

  updateUser: async ({ input }, client) => {
    const {
      id,
      ...updatedFields
    } = input

    const inputValid = Object.keys(updatedFields).length > 0

    if (!inputValid) {
      throw new Error('updateUser resolver received invalid input')
    }

    const snakeCasedInput = camelCaseToSnakeCase(updatedFields)

    const {
      columnNames,
      columnValues
    } = zipInputObject(snakeCasedInput)

    const updateUserQuery = buildUpdateUserQuery(id, columnNames, columnValues)

    let updateResult

    try {
      updateResult = await client.query(updateUserQuery)
    } catch (originalError) {
      throw generateQueryError('Query Error', updateUserQuery, originalError)
    }

    const {
      rows: [
        dbUserObject
      ] = []
    } = updateResult

    return mapUser(dbUserObject)
  }
}