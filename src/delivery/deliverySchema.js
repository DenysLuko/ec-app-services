export const deliveryInput = `
  input NewDeliveryInput {
    name: String
    description: String
    journey: Journey!
    weightKg: Int
    widthCm: Int
    heightCm: Int
    depthCm: Int
    currency: String
    value: Float
    sender: User!
    receiver: User
    deliveryStatus: String!
    deliveryRating: Int
    deliveryComment: String
    senderRating: Int
    senderComment: String
    cancelledComment: String
  }

  input ExistingDeliveryInput {
    id: Int!
    name: String
    description: String
    journey: Journey
    weightKg: Int
    widthCm: Int
    heightCm: Int
    depthCm: Int
    currency: String
    value: Float
    sender: User
    receiver: User
    deliveryStatus: String
    deliveryRating: Int
    deliveryComment: String
    senderRating: Int
    senderComment: String
    cancelledComment: String
  }
`

export const deliveryType = `
  type Delivery {
    id: Int!
    name: String
    description: String
    journey: Journey!
    weightKg: Int
    widthCm: Int
    heightCm: Int
    depthCm: Int
    currency: String
    value: Float
    sender: User!
    receiver: User
    deliveryStatus: String!
    deliveryRating: Int
    deliveryComment: String
    senderRating: Int
    senderComment: String
    cancelledComment: String
  }
`

export const deliveryQuery = `
  getDelivery(deliveryId: Int!): Delivery
`

export const deliveryMutation = `

`
