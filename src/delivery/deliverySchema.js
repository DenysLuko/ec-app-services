export const deliveryInput = `

`

export const deliveryType = `
  type Delivery {
    deliveryId: Int!
    deliveryName: String
    deliveryDescription: String
    journey: Journey
    deliveryWeightKg: Int
    deliveryWidthCm: Int
    deliveryHeightCm: Int
    deliveryDepthCm: Int
    deliveryCurrency: String
    deliveryValue: Float
    sender: User!
    receiver: User
    deliveryStatus: String!
    deliveryRating: Int
    deliveryComment: String
    deliverySenderRating: Int
    deliverySenderComent: String
    deliveryCancelledComment: String
  }
`

export const deliveryQuery = `
  getDelivery(deliveryId: Int!): Delivery
`

export const deliveryMutation = `

`
