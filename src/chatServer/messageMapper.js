export const mapMessage = ({
  id,
  date_sent: dateSent,
  msg_content: msgContent,
  by_user: byUser,
  to_channel: toChannel,
  status
}) => ({
  id,
  dateSent,
  msgContent,
  byUser,
  toChannel,
  status
})
