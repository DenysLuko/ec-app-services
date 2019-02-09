import snakeCase from 'lodash.snakecase'
import camelCase from 'lodash.camelcase'
import reduce from 'lodash.reduce'

export const snakeCaseToCamelCase = (object) => (
  reduce(object, (acc, value, key) => {
    const newKey = camelCase(key)
    return {
      ...acc,
      [newKey]: value
    }
  }, {})
)

export const camelCaseToSnakeCase = (object) => (
  reduce(object, (acc, value, key) => {
    const newKey = snakeCase(key)
    return {
      ...acc,
      [newKey]: value
    }
  }, {})
)
