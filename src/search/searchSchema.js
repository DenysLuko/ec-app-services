export const searchInput = `
  input SearchPagination {
    limit: Int!
    offset: Int!
  }

  input LocationInput {
    id: Int
    longitude: Float
    latitude: Float
    withinDistance: Int
  }

  input SearchInput {
    date: String!
    dateRange: Int
    origin: LocationInput!
    destination: LocationInput
    status: String
    pagination: SearchPagination!
  }
`

export const searchType = `
  type Location {
    longitude: Float!
    latitude: Float!
    locationName: String!
    locationAddress: String
    cityName: String
    countryName: String
  }

  type Journey {
    journeyName: String!
    journeyDescription: String
    travellingUser: User!
    journeyDate(format: String): String
    journeyStatus: String!
    origin: Location!
    destination: Location!
  }

  type SearchResult {
    offset: Int!
    resultCount: Int!
    results: [Journey!]!
  }
`

export const searchQuery = `
  search(input: SearchInput!): SearchResult!
`
