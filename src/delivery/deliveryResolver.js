import { mapDelivery } from './deliveryMapper'

const buildGetDeliveryQuery = (id) => ({
  text: 'SELECT * FROM delivery_view WHERE delivery_id = $1;',
  values: [id]
})

export const deliveryResolver = {
  getDelivery: async ({ deliveryId }, client) => {
    const query = buildGetDeliveryQuery(deliveryId)

    const result = await client.query(query)

    const {
      rows: [
        dbDeliveryObject
      ] = []
    } = result

    return mapDelivery(dbDeliveryObject)
  }
}
