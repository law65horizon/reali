// graphql/mutations.js

import { gql } from '@apollo/client';

export const REGISTER = gql`
  mutation Register($input: UserInput!) {
    register(input: $input) {
      success
      message
      user {
        id
        email
      }
    }
  }
`

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!, $deviceInfo: String) {
    login(email: $email, password: $password, deviceInfo: $deviceInfo) {
      success
      message
      user {
        id
        email
      }
    }
  }
`

export const SEND_VERIFICATION_CODE = gql`
  mutation SendVerificationCode($email: String!) {
    sendVerificationCode(email: $email) {
      success
      message
      previewUrl
    }
  }
`;

export const VERIFY_CODE = gql`
  mutation VerifyCode($input: VerifyCodeInput!) {
    verifyCode(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        name
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken)
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($fullName: String, $phone: String) {
    updateProfile(fullName: $fullName, phone: $phone) {
      id
      email
      name
      phone
    }
  }
`;