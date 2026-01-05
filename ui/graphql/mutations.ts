// graphql/mutations.js

import { gql } from '@apollo/client';

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