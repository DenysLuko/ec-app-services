export const validateSearch = ({
  origin: {
    longitude: originLongitude,
    latitude: originLatitude,
    withinDistance: originWithinDistance
  } = {},
  destination: {
    longitude: destinationLongitude,
    latitude: destinationLatitude,
    withinDistance: destinationWithinDistance
  } = {}
}) => {
  if (originLongitude && (!originLatitude || !originWithinDistance)) {
    return false
  }

  if (originLatitude && (!originLongitude || !originWithinDistance)) {
    return false
  }

  if (originWithinDistance && (!originLongitude || !originLatitude)) {
    return false
  }

  if (destinationLongitude && (!destinationLatitude || !destinationWithinDistance)) {
    return false
  }

  if (destinationLatitude && (!destinationLongitude || !destinationWithinDistance)) {
    return false
  }

  if (destinationWithinDistance && (!destinationLongitude || !destinationLatitude)) {
    return false
  }

  return true
}
