import zip from 'lodash.zip'

export const zipInputObject = (input) => {
  const [columnNames, columnValues] = zip(...Object.entries(input))

  return {
    columnNames,
    columnValues
  }
}
