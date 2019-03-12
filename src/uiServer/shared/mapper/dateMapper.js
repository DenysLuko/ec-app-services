import moment from 'moment'

export const mapDate = (date, format) => {
  if (date && format) {
    return moment(date).format(format)
  }

  return date
}
