import pick from 'lodash.pick'

import {
  snakeCaseToCamelCase
} from '../utils'
import {
  mapJourney
} from '../journey';
import {
  mapUser
} from '../user'

export const mapDelivery = (deliveryResponse) => {
  const {
    deliveryId,
    deliveryName,
    deliveryDescription,
    deliveryWeightKg,
    deliveryWidthCm,
    deliveryHeightCm,
    deliveryDepthCm,
    deliveryCurrency,
    deliveryValue,
    deliveryStatus,
    deliveryRating,
    deliveryComment,
    deliverySenderRating,
    deliverySenderComment,
    deliveryCancelledComment
  } = snakeCaseToCamelCase(deliveryResponse)

  const journey = mapJourney(
    pick(deliveryResponse, [
      'journey_id',
      'journey_name',
      'journey_description',
      'journey_date',
      'journey_status',
      'travelling_user_id',
      'travelling_user_name',
      'travelling_user_last_name',
      'travelling_user_username',
      'travelling_user_email',
      'travelling_user_birthday',
      'travelling_user_age',
      'travelling_user_photo',
      'origin_id',
      'origin_name',
      'origin_address',
      'origin_city',
      'origin_country',
      'origin_type',
      'origin_longitude',
      'origin_latitude',
      'destination_id',
      'destination_name',
      'destination_address',
      'destination_city',
      'destination_country',
      'destination_type',
      'destination_longitude',
      'destination_latitude'
    ])
  )

  const {
    sender_id,
    sender_name,
    sender_last_name,
    sender_username,
    sender_email,
    sender_birthday,
    sender_age,
    sender_photo
  } = deliveryResponse

  const sender = mapUser({
    id: sender_id,
    name: sender_name,
    last_name: sender_last_name,
    username: sender_username,
    email: sender_email,
    birthday: sender_birthday,
    age: sender_age,
    photo: sender_photo
  })

  const {
    receiver_id,
    receiver_name,
    receiver_last_name,
    receiver_username,
    receiver_email,
    receiver_birthday,
    receiver_age,
    receiver_photo
  } = deliveryResponse

  const receiver = mapUser({
    id: receiver_id,
    name: receiver_name,
    last_name: receiver_last_name,
    username: receiver_username,
    email: receiver_email,
    birthday: receiver_birthday,
    age: receiver_age,
    photo: receiver_photo
  })

  return {
    deliveryId,
    deliveryName,
    deliveryDescription,
    deliveryWeightKg,
    deliveryWidthCm,
    deliveryHeightCm,
    deliveryDepthCm,
    deliveryCurrency,
    deliveryValue,
    deliveryStatus,
    deliveryRating,
    deliveryComment,
    deliverySenderRating,
    deliverySenderComment,
    deliveryCancelledComment,
    journey,
    sender,
    receiver
  }
}
