// SignUpScreen.js
import { ThemedText } from '@/components/ThemedText';
import FormField from '@/components/ui/FormField';
import { REGISTER, SEND_VERIFICATION_CODE, VERIFY_CODE } from '@/graphql/mutations';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/theme/theme';
import { useMutation } from '@apollo/client';
import { router, useNavigation } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: null as Date | null,
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    dob: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });

  const [step, setStep] = useState<'details' | 'code'>('details');
  const [code, setCode] = useState('');
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [sendCode, { loading: sendingCode }] = useMutation(SEND_VERIFICATION_CODE);
  const [verifyCode, { loading: verifying }] = useMutation(VERIFY_CODE);
  const [register, {loading: registering}] = useMutation(REGISTER);

  interface FormErrors {
    firstName?: string;
    lastName?: string;
    dob?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string
  }

  const validateForm = useCallback((): FormErrors => {
    const errors: FormErrors = {};

    if (!form.firstName.trim()) errors.firstName = 'First name iss required';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required';

    // if (!form.dob) {
    //   errors.dob = 'Date of birth is required';
    // } else {
    //   const age = (Date.now() - form.dob.getTime()) / (1000 * 3600 * 24 * 365.25);
    //   if (age < 18) errors.dob = 'You must be at least 18 years old';
    // }

    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Invalid email format';
    }

    if (!form.phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(form.phone.replace(/\s/g, ''))) {
      errors.phone = 'Invalid phone format (E.164 recommended)';
    }

    if(form.password.trim() !== form.confirmPassword.trim()) {
      errors.confirmPassword = 'Password does not match'
    }

    return errors;
  }, [form]);

  const handleSignUp = async() => {
    setTouched({
      firstName: true,
      lastName: true,
      dob: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true
    });

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      Alert.alert('Validation Error', Object.values(errors).join('\n'));
      return;
    }

    try {
      const {data} = await register({
        variables: {
          input: {
            email: form.email.toLocaleLowerCase().trim(),
            name: `${form.firstName.trim()} ${form.lastName.trim()}`,
            phone: form.phone.trim(),
            password: form.password.trim(),
            uid: '2222'
          }
        }
      })

      if (data.register.success) {
        await handleSendCode()
      }
    } catch (error) {
      
    }
  }

  const handleSendCode = useCallback(async () => {
    console.log('wowo')
    
    try {
      const { data } = await sendCode({
        variables: { email: form.email.toLocaleLowerCase().trim() },
      });

      if (data.sendVerificationCode.success) {
        setStep('code');
        Alert.alert('Success', data.sendVerificationCode.message);

        if (__DEV__ && data.sendVerificationCode.previewUrl) {
          console.log('Email Preview:', data.sendVerificationCode.previewUrl);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  }, [form, sendCode, validateForm]);

  const handleVerifyCode = useCallback(async () => {
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }

    try {
      const { data } = await verifyCode({
        variables: {
          input: {
            email: form.email.toLowerCase().trim(),
            code,
            // firstName: form.firstName.trim(),
            // lastName: form.lastName.trim(),
            // dob: form.dob?.toISOString() ?? null,
            // phone: form.phone.trim(),
          },
        },
      });

      await setAuth(
        data.verifyCode.accessToken,
        data.verifyCode.refreshToken,
        data.verifyCode.user,
        data.verifyCode.user.role || 'guest'
      );

      router.dismissAll();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Verification failed');
      setCode('');
    }
  }, [code, form, setAuth, verifyCode]);

  const onChangeDob = (event: any, selectedDate?: Date) => {
    setShowDobPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setForm({ ...form, dob: selectedDate });
    }
  };

  const errors = validateForm();

  if (step === 'code') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: 20, paddingHorizontal: 20 }]}>
        <ThemedText type='subtitle' >
            Enter Verification Code
          </ThemedText>
          
          <ThemedText type='body' style={{marginVertical: 10}}>
            We sent a verification code to{'\n'}
            <ThemedText style={{ fontWeight: '600' }}>{form.email}</ThemedText>
          </ThemedText>
        <View style={styles.codeContainer}>        
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
              { backgroundColor: theme.colors.primary, justifyContent: 'flex-end' },
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
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundSec }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ThemedText style={styles.backArrow}>‹</ThemedText>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <ThemedText type="defaultSemiBold" >
            Finish signing up
          </ThemedText>
        </View>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.inner}>
        <ThemedText style={styles.label}>Legal name</ThemedText>
        <View style={styles.nameRow}>
          <FormField
            title="First Name"
            value={form.firstName}
            handleChangeText={(text) => setForm({ ...form, firstName: text })}
            otherStyles={[
              styles.input,
              touched.firstName && errors.firstName ? styles.errorBorder : null,
            ]}
            onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
          />
          <FormField
            title="Last Name"
            value={form.lastName}
            handleChangeText={(text) => setForm({ ...form, lastName: text })}
            otherStyles={[
              styles.input,
              touched.lastName && errors.lastName ? styles.errorBorder : null,
            ]}
            onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
          />
        </View>
        {(touched.firstName && errors.firstName) || (touched.lastName && errors.lastName) ? (
          <Text style={styles.errorText}>
            {errors.firstName || errors.lastName}
          </Text>
        ) : null}

        <ThemedText secondary style={styles.hint}>
          Make sure this matches the name on your government ID.
        </ThemedText>

        {/* <ThemedText style={[styles.label, { marginTop: 24 }]}>Date of birth</ThemedText>
        <TouchableOpacity
          style={[
            styles.pickerButton,
            {
              backgroundColor: theme.colors.backgroundInput ?? '#FAFAFA',
              borderColor: theme.colors.border,
            },
            touched.dob && errors.dob ? styles.errorBorder : null,
          ]}
          onPress={() => {
            setTouched((t) => ({ ...t, dob: true }));
            setShowDobPicker(true);
          }}
        >
          <ThemedText style={form.dob ? styles.pickerText : styles.pickerPlaceholder}>
            {form.dob ? form.dob.toLocaleDateString() : 'Date of birth'}
          </ThemedText>
        </TouchableOpacity>
        {touched.dob && errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

        {showDobPicker && (
          <DateTimePicker
            value={form.dob ?? new Date(2000, 0, 1)}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            onChange={onChangeDob}
          />
        )} */}

        <FormField
          title="Email"
          value={form.email}
          handleChangeText={(text) => setForm({ ...form, email: text })}
          keyboardType="email-address"
          otherStyles={[
            styles.input,
            touched.email && errors.email ? styles.errorBorder : null,
          ]}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        />
        {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <FormField
          title="Phone"
          value={form.phone}
          handleChangeText={(text) => setForm({ ...form, phone: text })}
          keyboardType="phone-pad"
          placeholder="e.g. +1234567890"
          otherStyles={[
            styles.input,
            touched.phone && errors.phone ? styles.errorBorder : null,
          ]}
          onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
        />
        {touched.phone && errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        <FormField 
          title='Password'
          type='password'
          value={form.password}
          handleChangeText={(text) => setForm({...form, password: text})}
          otherStyles={[
            styles.input,
          ]}
          onBlur={() => setTouched((t) => ({...t, password: true}))}
          showPassword={showPassword}
          switchShowPassword={() => setShowPassword(!showPassword)}
        />

        {touched.password && (<>
          <FormField 
            type='password'
            title='Confirm Password'
            value={form.confirmPassword}
            handleChangeText={(text) => setForm({...form, confirmPassword: text})}
            otherStyles={[
              styles.input,
              touched.confirmPassword && errors.confirmPassword ? styles.errorBorder : null,
            ]}
            onBlur={() => setTouched((t) => ({...t, confirmPassword: true}))}
            showPassword={showPassword}
            switchShowPassword={() => setShowPassword(!showPassword)}
          />
          {touched.confirmPassword && errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </>)}

        <Text style={[styles.terms, { color: theme.colors.textSecondary }]}>
          By selecting <Text style={{ fontWeight: '600' }}>Agree and continue</Text>, I agree to Airbnb’s{' '}
          <Text style={styles.link} onPress={() => Linking.openURL('https://www.airbnb.com/terms')}>
            Terms of Service
          </Text>
          ,{' '}
          <Text style={styles.link} onPress={() => Linking.openURL('https://www.airbnb.com/legal/payments-terms')}>
            Payments Terms of Service
          </Text>{' '}
          and{' '}
          <Text style={styles.link} onPress={() => Linking.openURL('https://www.airbnb.com/help/article/2868')}>
            Nondiscrimination Policy
          </Text>{' '}
          and acknowledge the{' '}
          <Text style={styles.link} onPress={() => Linking.openURL('https://www.airbnb.com/help/article/2855')}>
            Privacy Policy
          </Text>
          .
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={handleSignUp}
          disabled={registering}
        >
          {sendingCode ? (
            <ActivityIndicator animating={registering}  color={theme.colors.buttonText ?? '#FFFFFF'} />
          ) : (
            <ThemedText type="defaultSemiBold" style={{ color: theme.colors.buttonText ?? '#FFFFFF' }}>
              Agree and continue
            </ThemedText>
          )}
        </TouchableOpacity>

        <ThemedText style={[styles.footer, { color: theme.colors.textSecondary }]}>
          Airbnb will send you members-only deals, inspiration, marketing emails, and push notifications. You can opt out at any time.
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  helperText: {
    fontSize: 14,
    marginTop: 20,
    marginBottom: 32,
  },
  linkText: {
    fontWeight: '600',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  container: { flex: 1 },
  codeContainer: { flex: 1, },
  inner: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20 },
  backArrow: { fontSize: 28 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 8, marginTop: 16 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  input: {
    flex: 1,
    borderWidth: 0,
    // borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  pickerText: { fontSize: 16, color: '#000000' },
  pickerPlaceholder: { fontSize: 16, color: '#999999' },
  hint: { fontSize: 13, marginTop: 8, lineHeight: 18 },
  link: { color: '#007AFF', textDecorationLine: 'underline' },
  errorText: { color: '#EF4444', fontSize: 13, marginTop: 6 },
  errorBorder: { borderColor: '#EF4444' },
  terms: { fontSize: 13, marginTop: 32, lineHeight: 19 },
  button: {
    marginTop: 24,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  footer: { fontSize: 13, marginTop: 24, lineHeight: 19, textAlign: 'center' },
  codeInput: {
    fontSize: 32,
    letterSpacing: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 30,
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  backButton: { marginTop: 30 },
});