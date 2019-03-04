export const generateQueryError = (message, query, originalError) => (JSON.stringify({
  type: 'queryError',
  message,
  query,
  originalError
}))
