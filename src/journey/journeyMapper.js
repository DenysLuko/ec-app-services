import {
  mapUser
} from '../user'

import {
  mapDate
} from '../shared/mapper/dateMapper'

import {
  snakeCaseToCamelCase
} from '../utils/snakeCaseFromToCamelCase'

export const mapJourney = ({
  travelling_user_id,
  travelling_user_name,
  travelling_user_last_name,
  travelling_user_username,
  travelling_user_email,
  travelling_user_birthday,
  travelling_user_age,
  travelling_user_photo,
  origin_id,
  origin_name,
  origin_address,
  origin_city,
  origin_country,
  origin_type,
  origin_longitude,
  origin_latitude,
  destination_id,
  destination_name,
  destination_address,
  destination_city,
  destination_country,
  destination_type,
  destination_longitude,
  destination_latitude,
  ...rest
}) => {
  const {
    journeyId,
    journeyName,
    journeyDescription,
    journeyDate,
    journeyStatus
  } = snakeCaseToCamelCase(rest)

  const travellingUser = mapUser({
    id: travelling_user_id,
    name: travelling_user_name,
    last_name: travelling_user_last_name,
    username: travelling_user_username,
    email: travelling_user_email,
    birthday: travelling_user_birthday,
    age: travelling_user_age,
    photo: travelling_user_photo
  })

  const origin = {
    longitude: origin_longitude,
    latitude: origin_latitude,
    locationName: origin_name,
    locationAddress: origin_address,
    cityName: origin_city,
    countryName: origin_country
  }

  const destination = {
    longitude: destination_longitude,
    latitude: destination_latitude,
    locationName: destination_name,
    locationAddress: destination_address,
    cityName: destination_city,
    countryName: destination_country
  }

  return {
    journeyId,
    journeyName,
    journeyDescription,
    journeyStatus,
    travellingUser,
    origin,
    destination,
    journeyDate({
      format
    }) {
      return mapDate(journeyDate, format)
    }
  }
}

export const mapJourneySearch = ({
  rowCount = 0,
  rows = []
}, offset) => {
  const results = rows.map(mapJourney)

  return {
    resultCount: rowCount,
    offset,
    results
  }
}
