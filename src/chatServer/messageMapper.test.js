import {
  mapMessage
} from './messageMapper'

describe('mapMessage', () => {
  it('should return all fields snakeCased', () => {
    expect(mapMessage({
      id: 1,
      date_sent: '2019-03-10T17:10:53.556Z',
      msg_content: 'Some message',
      by_user: 1,
      to_channel: 2
    })).toEqual({
      id: 1,
      dateSent: '2019-03-10T17:10:53.556Z',
      msgContent: 'Some message',
      byUser: 1,
      toChannel: 2
    })
  })
})
