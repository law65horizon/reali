// SignUpScreen.js
import { ThemedText } from '@/components/ThemedText';
import FormField from '@/components/ui/FormField';
import { useTheme } from '@/theme/theme';
import { gql, useMutation } from '@apollo/client';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useNavigation } from 'expo-router';
import React, { useState } from 'react';
// import {} from '@/constants/graphql/'
import { SEND_VERIFICATION_CODE, VERIFY_CODE } from '@/graphql/mutations';
import { useAuthStore } from '@/stores/authStore';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function SignUpScreen() {
  const CREATE_USER = gql`
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState<any>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [emaile, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation() 
  const {theme} = useTheme()
  // const [createUserData, { data, loading, error }] = useMutation(CREATE_USER)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: null,
    email: '',
    password: '',
    phone: ''
  })
  const [touched, setTouched] = useState({
    dob: false,
    email: false,
  });

  const [step, setStep] = useState('email');
  const [code, setCode] = useState('');


  const { setAuth } = useAuthStore();
    
    const [sendCode, { loading: sendingCode }] = useMutation(SEND_VERIFICATION_CODE);
    const [verifyCode, { loading: verifying }] = useMutation(VERIFY_CODE);
  
    const handleSendCode = async () => {
      if (!form.email.trim()) {
        Alert.alert('Error', 'Please enter your form.');
        return;
      }
  
      try {
        const { data } = await sendCode({ variables: { email: form.email.toLowerCase().trim() } });
        
        if (data.sendVerificationCode.success) {
          setStep('code');
          Alert.alert('Success', data.sendVerificationCode.message);
          
          // Log preview URL in development
          if (data.sendVerificationCode.previewUrl) {
            console.log('Email Preview:', data.sendVerificationCode.previewUrl);
          }
        }
      } catch (error:any) {
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
          variables: { input: 
            {email: form.email.toLowerCase().trim(), code, } 
          } 
        });
  
        await setAuth(
          data.verifyCode.accessToken,
          data.verifyCode.refreshToken,
          data.verifyCode.user,
          'guest'
        );

        router.dismissAll()
  
        // Navigation will be handled by auth state change
      } catch (error:any) {
        Alert.alert('Error', error.message);
        setCode('');
      }
    };

  const onChangeDob = (event:any, selectedDate:any) => {
    setShowDobPicker(Platform.OS === 'ios');
    if (selectedDate) setDob(selectedDate);
  };

  const errors = {
    dob: touched.dob && !dob ? 'Date of birth is required' : '',
    email: touched.email && !form.email ? 'Email is required' : '',
  };

  if (step === 'code') {
    return (
        <View style={styles.container}>
          <Text style={styles.title}>Enter Code</Text>
          <Text style={styles.subtitle}>
            We sent a verification code to{'\n'}{form.email}
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

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.backgroundSec}]}>
      {/* Header */}
        <View style={[styles.header, {paddingHorizontal: 16, paddingTop: 20}]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ThemedText style={styles.backArrow}>‹</ThemedText>
          </TouchableOpacity>
          <View style={{flex: 1, alignItems: 'center'}}>
            <ThemedText type='defaultSemiBold' style={styles.title}>Finish signing up</ThemedText>
          </View>
        </View>
      <ScrollView contentContainerStyle={styles.inner}>
        

        {/* Legal name */}
        <ThemedText style={styles.label}>Legal name</ThemedText>
        <View style={styles.nameRow}>
          <FormField 
            title='First Name'
            handleChangeText={(e) => setForm({ ...form, firstName: e })}
            value={form.firstName}
            otherStyles={styles.input}
          />
          <FormField 
            title='Last Name'
            handleChangeText={(e) => setForm({ ...form, lastName: e })}
            value={form.lastName}
            otherStyles={styles.input}
          />
        </View>
        <ThemedText secondary style={styles.hint}>
          Make sure this matches the name on your government ID. If you go by
          another name, you can add a{' '} preferred first name
          {/* <ThemedText style={[styles.link, styles.hint]}>preferred first name</ThemedText>. */}
        </ThemedText>

        {/* Date of birth */}
        <ThemedText style={[styles.label, { marginTop: 24 }]}>Date of birth</ThemedText>
        <TouchableOpacity
          style={[
            styles.pickerButton,
            errors.dob ? styles.errorBorder : null,
          ]}
          onPress={() => {
            setTouched(t => ({ ...t, dob: true }));
            setShowDobPicker(true);
          }}>
          <ThemedText style={dob ? styles.pickerText : styles.pickerPlaceholder}>
            {dob
              ? dob.toLocaleDateString()
              : 'Date of birth'}
          </ThemedText>
        </TouchableOpacity>
        {errors.dob ? (
          <Text style={styles.errorText}>{errors.dob}</Text>
        ) : null}

        {showDobPicker && (
          <DateTimePicker
            value={dob || new Date(2000, 0, 1)}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            onChange={onChangeDob}
          />
        )}

        {/* <View style={{backgroundColor: 'red'}}> */}
          {/* Email */}
        <FormField 
          onPress={() => setShowDobPicker(false)}
          title='Email'
          otherStyles={[
            styles.input ,
            errors.email ? styles.errorBorder: null   
          ]}
          placeholder='Email'
          value={form.email}
          handleChangeText={v => {
            setForm({...form, email: v});
            if (touched.email) setTouched(t => ({ ...t, email: true }));
          }}
        />
        {/* <ThemedText style={[{  }]}>Email</ThemedText> */}

        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}
        {/* </View> */}


        {/* <Text style={[styles.label, { marginTop: 24 }]}>Password</Text> */}
        <FormField 
          onPress={() => setShowDobPicker(false)}
          title='Password'
          otherStyles={[
            styles.input ,
            errors.email ? styles.errorBorder: null   
          ]}
          placeholder='Password'
          value={form.password}
          handleChangeText={v => {
            setForm({...form, password: v});
            if (touched.email) setTouched(t => ({ ...t, email: true }));
          }}
        />
        {/* <TextInput
        onPress={() => setShowDobPicker(false)}
          style={[
            styles.input,
            errors.email ? styles.errorBorder : null,
          ]}
          placeholder="password"
          keyboardType="email-address"
          value={form.password}
          onChangeText={v => {
            setForm({...form, password: v});
            if (touched.email) setTouched(t => ({ ...t, email: true }));
          }}
          onBlur={() => setTouched(t => ({ ...t, email: true }))}
        /> */}

        {/* Terms */}
        <Text style={styles.terms}>
          By selecting <Text style={{ fontWeight: '600' }}>Agree and continue</Text>, I agree to Airbnb’s{' '}
          <Text style={styles.link}>Terms of Service</Text>,{' '}
          <Text style={styles.link}>Payments Terms of Service</Text> and{' '}
          <Text style={styles.link}>Nondiscrimination Policy</Text> and acknowledge the{' '}
          <Text style={styles.link}>Privacy Policy</Text>.
        </Text>

        {/* Button */}
        <TouchableOpacity style={[styles.button, {backgroundColor: theme.colors.background}]} onPress={handleSendCode}>
          {!isSubmitting ?
            <ThemedText type='defaultSemiBold' >Agree and continue</ThemedText>
            : <ActivityIndicator 
              animating={isSubmitting}
              color={theme.colors.text}
              size={'small'}
            />
          }
        </TouchableOpacity>

        {/* Footer */}
        <ThemedText style={styles.footer}>
          Airbnb will send you members-only deals, inspiration, marketing emails,
          and push notifications. You can opt out of receiving these at any time in
          your account settings or directly from the messages.
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center' },
  backArrow: { fontSize: 28, marginRight: 8 },
  title: { fontSize: 20, fontWeight: '600' },
  label: { fontSize: 16, fontWeight: '500', marginVertical: 10, },
  smallLabel: { fontSize: 12, color: '#555', marginBottom: 4 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between' },
  nameField: { flex: 1, marginRight: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  pickerText: { fontSize: 16, color: '#000' },
  pickerPlaceholder: { fontSize: 16, color: '#999' },
  hint: { fontSize: 12, color: '#555', marginTop: 8 },
  link: { color: '#007aff' },
  errorText: { color: '#D32F2F', fontSize: 12, marginTop: 4 },
  errorBorder: { borderColor: '#D32F2F' },
  terms: { fontSize: 12, color: '#555', marginTop: 32, lineHeight: 18 },
  button: {
    marginTop: 24,
    backgroundColor: '#000',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  // buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  footer: { fontSize: 12, color: '#777', marginTop: 24, lineHeight: 18 },

  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
  },
  codeInput: {
    fontSize: 32,
    letterSpacing: 10,
    textAlign: 'center',
    fontWeight: 'bold',
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

