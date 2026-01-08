import { gql } from "@apollo/client"

export const CREATE_USER = gql`
   mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
        id
        name
        email
        phone
        description
        uid
    }
  }
`