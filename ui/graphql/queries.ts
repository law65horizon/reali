import { gql } from "@apollo/client";

//  export const GET_PROPERTIES = gql`
//   query GetProperties($first: Int!, $after: String) {
//     getProperties(first: $first, after: $after) {
//       totalCount
//       edges {
//         cursor
//         node {
//           id
//           realtor_id
//           address_id
//           title
//           speciality
//           amenities
//           price
//           description
//           created_at
//           updated_at
//           images {
//             id
//             url
//           }
//           address {
//             id
//             street
//             city
//             country
//           }
//         }
//       }
//       pageInfo {
//         hasNextPage
//         endCursor
//       }
//     }
//   }
// `;

// export const GET_PROPERTY = gql`
//   query GetProperty($id: ID!) {
//     getProperty(id: $id) {
//       id
//       address_id
//       title
//       speciality
//       amenities
//       price
//       description
//       status
//       created_at
//       property_type
//       updated_at
//       realtor {
//           name
//           id
//           created_at
//           description
//       }
//       reviews {
//           id
//           property_id
//           user_id
//           rating
//           comment
//           created_at
//       }
//       address {
//           city
//           country
//       }
//       images {
//         url
//       }
//       essentials {
//         bedrooms
//         bathrooms
//       }
//     }
//   }
// `

export const GET_ROOM_TYPE = gql`
  query GetRoomType($id: ID!) {
    getRoomType(id: $id) {
      id
      property_id
      name
      description
      capacity
      bedCount
      bathroomCount
      sizeSqft
      basePrice
      currency
      amenities
      property {
        id
        realtor_id
        address_id
        property_type
        address {
          id
          street
          city
          postal_code
          country
          latitude
          longitude
        }
        realtor {
          id
          name
          email
          description
          created_at
        }
      }
    }
  }
`

// export const SEARCH_PROPERTIES = gql`
//   query SearchProperties($input: PropertySearchInput, $first: Int!, $after: String) {
//     searchProperties(input: $input, first: $first, after: $after) {
//       edges {
//         node {
//           id
//           title
//           price
//           description
//           status
//           amenities
//           speciality
//           address {
//             id
//             street
//             city
//             postal_code
//             country
//             latitude
//             longitude
//           }
//           realtor {
//             id
//             name
//             email
//             phone
//           }
//           images {
//             id
//             url
//             caption
//           }
//           created_at
//           updated_at
//         }
//         cursor
//       }
//       pageInfo {
//         hasNextPage
//         endCursor
//       }
//       totalCount
//     }
//   }
// `;

export const SearchRoomTypes = gql`
  query SearchRoomTypes($input: SearchRoomsInput) {
    searchRoomTypes(input: $input) {
        totalCount
        edges {
            node {
                id
                bedCount
                bathroomCount
                sizeSqft
                basePrice
                availableUnits
                images {
                    id
                    url
                    meta_data
                    caption
                }
                property {
                    id
                    realtor_id
                    address_id
                    property_type
                    created_at
                    updated_at
                    address {
                        id
                        street
                        city
                        postal_code
                        country
                    }
                }
            }
        }
        pageInfo {
            hasNextPage
            endCursor
        }
    }
}
`

