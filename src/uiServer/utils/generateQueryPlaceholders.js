export const generatePlaceholders = (amount = 0) => {
  const placeholders = []

  for (let i = 1; i <= amount; i++) {
    placeholders.push(`$${i}`)
  }

  return placeholders.join(', ')
}
