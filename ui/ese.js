
// stores/authStore.js (Zustand)
/*
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (accessToken, refreshToken, user) => {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },

  loadAuth: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      
      if (accessToken && refreshToken) {
        set({ accessToken, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
      set({ isLoading: false });
    }
  },

  updateUser: (user) => set({ user }),
}));
*/

// apollo/client.js
/*
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../stores/authStore';

const httpLink = createHttpLink({
  uri: 'http://YOUR_SERVER_IP:4000/graphql', // Change to your server URL
});

const authLink = setContext(async (_, { headers }) => {
  const token = await SecureStore.getItemAsync('accessToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      if (err.message === 'Not authenticated' || err.message.includes('token')) {
        // Try to refresh token
        refreshAccessToken();
      }
    }
  }
});

async function refreshAccessToken() {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  if (!refreshToken) {
    useAuthStore.getState().clearAuth();
    return;
  }

  try {
    const response = await fetch('http://YOUR_SERVER_IP:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation RefreshToken($refreshToken: String!) {
            refreshAccessToken(refreshToken: $refreshToken) {
              accessToken
              refreshToken
              user {
                id
                email
                fullName
                role
              }
            }
          }
        `,
        variables: { refreshToken },
      }),
    });

    const { data } = await response.json();
    if (data?.refreshAccessToken) {
      await useAuthStore.getState().setAuth(
        data.refreshAccessToken.accessToken,
        data.refreshAccessToken.refreshToken,
        data.refreshAccessToken.user
      );
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    useAuthStore.getState().clearAuth();
  }
}

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
*/

// graphql/mutations.js
/*
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
  mutation VerifyCode($email: String!, $code: String!) {
    verifyCode(email: $email, code: $code) {
      accessToken
      refreshToken
      user {
        id
        email
        fullName
        role
        emailVerified
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
      fullName
      phone
    }
  }
`;
*/

// screens/LoginScreen.js
/*
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useMutation } from '@apollo/client';
import { SEND_VERIFICATION_CODE, VERIFY_CODE } from '../graphql/mutations';
import { useAuthStore } from '../stores/authStore';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'code'
  
  const { setAuth } = useAuthStore();
  
  const [sendCode, { loading: sendingCode }] = useMutation(SEND_VERIFICATION_CODE);
  const [verifyCode, { loading: verifying }] = useMutation(VERIFY_CODE);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      const { data } = await sendCode({ variables: { email: email.toLowerCase().trim() } });
      
      if (data.sendVerificationCode.success) {
        setStep('code');
        Alert.alert('Success', data.sendVerificationCode.message);
        
        // Log preview URL in development
        if (data.sendVerificationCode.previewUrl) {
          console.log('Email Preview:', data.sendVerificationCode.previewUrl);
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }

    try {
      const { data } = await verifyCode({ 
        variables: { email: email.toLowerCase().trim(), code } 
      });

      await setAuth(
        data.verifyCode.accessToken,
        data.verifyCode.refreshToken,
        data.verifyCode.user
      );

      // Navigation will be handled by auth state change
    } catch (error) {
      Alert.alert('Error', error.message);
      setCode('');
    }
  };

  if (step === 'email') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Enter your email to get started</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!sendingCode}
        />

        <TouchableOpacity 
          style={[styles.button, sendingCode && styles.buttonDisabled]}
          onPress={handleSendCode}
          disabled={sendingCode}
        >
          {sendingCode ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send Code</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Code</Text>
      <Text style={styles.subtitle}>
        We sent a verification code to{'\n'}{email}
      </Text>
      
      <TextInput
        style={[styles.input, styles.codeInput]}
        placeholder="000000"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        editable={!verifying}
      />

      <TouchableOpacity 
        style={[styles.button, verifying && styles.buttonDisabled]}
        onPress={handleVerifyCode}
        disabled={verifying}
      >
        {verifying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify & Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => setStep('email')}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>Change Email</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={handleSendCode}
        disabled={sendingCode}
      >
        <Text style={styles.resendText}>Resend Code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  codeInput: {
    fontSize: 32,
    letterSpacing: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#2563eb',
    fontSize: 16,
  },
  resendText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});
*/

// .env file template
/*
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=realestate_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
PORT=4000

# Email (for production, use real SMTP)
SMTP_HOST=smtp.ethereal.email
SMTP_USER=your_ethereal_user
SMTP_PASS=your_ethereal_pass
*/