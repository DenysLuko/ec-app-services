import pickBy from 'lodash.pickby'
import isEmpty from 'lodash.isempty'

export const validateUserInput = (input) => {
  const hasInput = !isEmpty(
    pickBy(input, v => v !== undefined && v !== null)
  )

  if (!hasInput) {
    return false
  }

  return true
}
