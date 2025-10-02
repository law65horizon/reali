import { gql } from '@apollo/client';

// export const GET_PROPERTIES = gql`
//   query GetProperties {
//     getProperties {
//       id
//       price
//       images {
//         id
//         image_url
//       }
//     }
//   }
// `;

export const GET_PROPERTIES = gql`
  query GetProperties {
    getProperties {
        id
        title
        amenities
        price
        description
        created_at
        updated_at
        images {
            id
            url
        }
    }
}
`;