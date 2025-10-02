import gql from 'graphql-tag';

export const GET_EXPERIENCES_PAGINATED = gql`
  query SearchExperiences($input: ExperienceSearchInput, $first: Int!, $after: String) {
  searchExperiences(input: $input, first: $first, after: $after) {
    totalCount
    edges {
      cursor
      node {
        id
        title
        brief_bio
        category
        years_of_experience
        professional_title
        price
        group_size_min
        group_size_max
        duration_minutes
        experience_overview
        cancellation_policy
        status
        created_at
        updated_at
        host {
          id
          name
          email
          description
        }
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
          id
          url
          caption
        }
        reviews {
          id
          rating
          comment
          created_at
          user {
            id
            name
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
`;

// export const GET_EXPERIENCES_PAGINATED = gql`
//   query GetExperiencesPaginated($first: Int!, $after: String, $input: ExperienceSearchInput) {
//     getExperiencesPaginated(first: $first, after: $after, input: $input) {
//       totalCount
//       edges {
//         cursor
//         node {
//           id
//           title
//           price
//           category
//           address {
//             city
//             country
//           }
//           images {
//             url
//           }
//           reviews {
//             rating
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