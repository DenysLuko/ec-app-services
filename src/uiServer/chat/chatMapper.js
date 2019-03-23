import {
  mapUser
} from '../user/userMapper'

import {
  mapDate
} from '../shared/mapper/dateMapper'

import {
  snakeCaseToCamelCase
} from '../utils'

export const mapMessageChannel = messageChannelResponse => (
  snakeCaseToCamelCase(messageChannelResponse)
)

export const mapMessage = (messageResponse) => {
  const {
    messageId,
    messageDateSent,
    messageMsgContent,
    messageStatus,
    messageToChannel,
    messageUserId,
    messageUserName,
    messageUserLastName,
    messageUserUsername,
    messageUserEmail,
    messageUserPhoto,
    messageUserBirthday,
    messageUserAge
  } = snakeCaseToCamelCase(messageResponse)

  return {
    id: messageId,
    dateSent({
      format
    }) {
      return mapDate(messageDateSent, format)
    },
    msgContent: messageMsgContent,
    status: messageStatus,
    toChannel: messageToChannel,
    byUser: mapUser({
      id: messageUserId,
      name: messageUserName,
      lastName: messageUserLastName,
      username: messageUserUsername,
      email: messageUserEmail,
      photo: messageUserPhoto,
      birthday: messageUserBirthday,
      age: messageUserAge
    })
  }
}

export const mapMessageChannels = (messageChannelsResponse) => {
  const mappedChannelsWithUsers = messageChannelsResponse.reduce((all, messageChannelRow) => {
    const {
      messageChannelId,
      messageChannelOwner,
      messageChannelName,
      messageChannelBackgroundImg,
      messageChannelUserId,
      messageChannelUserName,
      messageChannelUserLastName,
      messageChannelUserUsername,
      messageChannelUserEmail,
      messageChannelUserPhoto,
      messageChannelUserBirthday,
      messageChannelUserAge
    } = mapMessageChannel(messageChannelRow)

    const mappedUser = mapUser({
      id: messageChannelUserId,
      name: messageChannelUserName,
      lastName: messageChannelUserLastName,
      username: messageChannelUserUsername,
      email: messageChannelUserEmail,
      photo: messageChannelUserPhoto,
      birthday: messageChannelUserBirthday,
      age: messageChannelUserAge
    })

    if (all[messageChannelId]) {
      all[messageChannelId].messageChannelUsers.push(mappedUser)

      return all
    }

    return {
      ...all,
      [messageChannelId]: {
        id: messageChannelId,
        owner: messageChannelOwner,
        name: messageChannelName,
        backgroundImg: messageChannelBackgroundImg,
        messageChannelUsers: [mappedUser]
      }
    }
  }, {})

  return Object.values(mappedChannelsWithUsers)
}

export const mapMessages = messagesResponse => (
  messagesResponse.map(mapMessage)
)

export const mapMessageChannelAndMessages = (mappedMessageChannels, mappedMessages) => {
  const mappedMessagesByToChannelId = mappedMessages.reduce((messagesByChannel, message) => {
    const {
      toChannel,
      ...messageFields
    } = message

    return {
      ...messagesByChannel,
      [toChannel]: {
        ...messageFields
      }
    }
  }, {})

  const expandedMessageChannels = mappedMessageChannels
    .reduce((messageChannels, messageChannel) => {
      const {
        id: messageChannelId,
      } = messageChannel

      const mappedMessage = mappedMessagesByToChannelId[messageChannelId]

      const messages = mappedMessage ? [mappedMessage] : []

      return [
        ...messageChannels,
        {
          ...messageChannel,
          messages
        }
      ]
    }, [])

  return expandedMessageChannels
}
