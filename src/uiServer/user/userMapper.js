import {
  mapDate
} from '../shared/mapper/dateMapper'
import {
  snakeCaseToCamelCase
} from '../utils/snakeCaseFromToCamelCase'

export const mapUser = ({
  birthday,
  ...otherFields
}) => {
  const {
    id,
    name,
    lastName,
    username,
    email,
    age,
    photo
  } = snakeCaseToCamelCase(otherFields)

  return {
    id,
    name,
    lastName,
    username,
    email,
    age,
    photo,
    birthday({
      format
    }) {
      return mapDate(birthday, format)
    }
  }
}
