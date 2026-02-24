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
      bed_count
      bathroom_count
      size_sqft
      base_price
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
      avg_rating
      totalReviews 
      reviews {
        comment
        rating
        created_at
        user {
          id
          name
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
                bed_count
                bathroom_count
                size_sqft
                base_price
                availableUnits
                images {
                  id
                  cdn_url
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
                        latitude
                        longitude
                    }
                    images {
                      cdn_url
                      id
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
// graphql/messages.queries.ts

export const CONVERSATIONS_QUERY = gql`
  query Conversations($first: Int, $after: String, $filter: ConversationFilter) {
    conversations(first: $first, after: $after, filter: $filter) {
      edges {
        node {
          id
          property {
            id
            title
          }
          host {
            id
            name 
            email
          }
          guest {
            id
            name
            email
          }
          booking {
            id
            check_in
            check_out
          }
          last_message_at
          unreadCount
          lastMessage {
            id
            content
            created_at
            sender {
              id
              name
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const CONVERSATION_QUERY = gql`
  query Conversation($conversationId: ID, $recipient: ID, $limit: Int, $offset: Int) {
    conversation(conversationId: $conversationId, recipient: $recipient) {
      id
      property {
        id
        title
      }
      host {
        id
        name
        email
      }
      guest {
        id
        name
        email
      }
      booking {
        id
        check_in
        check_out
        status
      }
      messages(limit: $limit, offset: $offset) {
        id
        content
        created_at
        read_at
        message_type
        sender {
          id
          name
        }
      }
      last_message_at
      unreadCount
    }
  }
`;

export const MESSAGES_QUERY = gql`
  query Messages($conversationId: ID!, $limit: Int, $offset: Int) {
    messages(conversationId: $conversationId, limit: $limit, offset: $offset) {
      id
      content
      created_at
      read_at
      message_type
      sender {
        id
        name
      }
    }
  }
`;

export const TOTAL_UNREAD_COUNT_QUERY = gql`
  query TotalUnreadCount {
    totalUnreadCount
  }
`;

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($input: MessageInput!) {
    sendMessage(input: $input) {
      id
      content
      created_at
      read_at
      message_type
      sender {
        id
        name
      }
    }
  }
`;

export const CREATE_CONVERSATION_MUTATION = gql`
  mutation CreateConversation($input: CreateConversationInput!) {
    createConversation(input: $input) {
      id
      property {
        id
        title
      }
      host {
        id
        name
      }
      guest {
        id
        name
      }
    }
  }
`;

export const MARK_MESSAGES_AS_READ = gql`
  mutation MarkMessagesAsRead($conversationId: ID!) {
    markMessagesAsRead(conversationId: $conversationId)
  }
`;

export const MARK_ALL_AS_READ = gql`
  mutation MarkAllAsRead {
    markAllAsRead
  }
`;

export const MESSAGE_READ_SUBSCRIPTION = gql`
  subscription MessageRead($conversationId: ID!) {
    messageRead(conversationId: $conversationId) {
      id
      read_at
    }
  }
`;

export const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription MessageAdded($conversationId: ID!) {
    messageAdded(conversationId: $conversationId) {
      id
      content
      created_at
      read_at
      message_type
      sender {
        id
        name
      }
    }
  }
`;

export const CONVERSATION_UPDATED_SUBSCRIPTION = gql`
  subscription ConversationUpdated($userId: ID!) {
    conversationUpdated(userId: $userId) {
      id
      last_message_at
      unreadCount
      lastMessage {
        id
        content
        created_at
        sender {
          id
          name
        }
      }
      guest {id name}
      host {id name}
    }
  }
`;
