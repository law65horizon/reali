import { useTheme } from '@/theme/theme';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';

export default function OTPVerificationDemo() {
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const {theme} = useTheme();
  const form = { email: 'user@example.com' };

  const handleVerifyCode = () => {
    setVerifying(true);
    setTimeout(() => setVerifying(false), 2000);
  };

  const handleSendCode = () => {
    setSendingCode(true);
    setTimeout(() => setSendingCode(false), 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.codeContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Enter Verification Code
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          We sent a verification code to{'\n'}
          <Text style={{ fontWeight: '600' }}>{form.email}</Text>
        </Text>

        <OtpInput
          numberOfDigits={6}
          onTextChange={setCode}
          theme={{
            pinCodeContainerStyle: {
              width: 48,
              height: 56,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.backgroundInput,
            },
            pinCodeTextStyle: {
              fontSize: 24,
              fontWeight: '600',
              color: theme.colors.text,
            },
            focusedPinCodeContainerStyle: {
              borderColor: theme.colors.primary,
              borderWidth: 2,
            },
          }}
        />

        <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
          Didn't receive the code?{' '}
          <Text 
            style={[styles.linkText, { color: theme.colors.primary }]}
            onPress={handleSendCode}
          >
            {sendingCode ? 'Sending...' : 'Resend'}
          </Text>
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary },
            (verifying || code.length !== 6) && styles.buttonDisabled,
          ]}
          onPress={handleVerifyCode}
          disabled={verifying || code.length !== 6}
        >
          {verifying ? (
            <ActivityIndicator color={theme.colors.buttonText} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
              Verify & Continue
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => alert('Change email')} style={styles.backButton}>
          <Text style={[styles.linkText, { color: theme.colors.primary }]}>
            Change Email
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  codeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  helperText: {
    fontSize: 14,
    marginTop: 20,
    marginBottom: 32,
    textAlign: 'center',
  },
  linkText: {
    fontWeight: '600',
  },
  button: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 12,
  },
});