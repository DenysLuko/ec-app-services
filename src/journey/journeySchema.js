export const journeyInput = `
  input SearchPaginationInput {
    limit: Int!
    offset: Int!
  }

  input SearchLocationInput {
    id: Int
    longitude: Float
    latitude: Float
    withinDistance: Int
  }

  input SearchInput {
    date: String!
    dateRange: Int
    origin: SearchLocationInput!
    destination: SearchLocationInput
    status: String
    pagination: SearchPaginationInput!
  }

  input CreateJourneyInput {
    name: String
    description: String
    date: Int!
    user: Int!
    origin: Int!
    destination: Int!
  }

  input UpdateJourneyInput {
    name: String
    description: String
    date: Int
    user: Int
    origin: Int
    destination: Int
  }
`

export const journeyType = `
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

export const journeyQuery = `
  searchJourney(input: SearchInput!): SearchResult!
  getJourney(id: Int!): Journey
`

export const journeyMutation = `
  createJourney(input: CreateJourneyInput!): Journey
  updateJourney(id: Int!, input: UpdateJourneyInput!): Journey
`
