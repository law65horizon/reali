// SignUpScreen.js
import { ThemedText } from '@/components/ThemedText';
import FormField from '@/components/ui/FormField';
import { useSession } from '@/context/ctx';
import { useTheme } from '@/theme/theme';
import { gql, useMutation } from '@apollo/client';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useNavigation } from 'expo-router';
import React, { useState } from 'react';
// import {} from '@/constants/graphql/'
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { createUser } from '../../../lib/appwrite';

// input UserInput {
//   name: String!
//   email: String!
//   uid: String!
//   password: String!
//   phone: String
//   description: String
// }

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
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation() 
  const {theme} = useTheme()
  const { signIn } = useSession()
  const [createUserData, { data, loading, error }] = useMutation(CREATE_USER)
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

  const onChangeDob = (event:any, selectedDate:any) => {
    setShowDobPicker(Platform.OS === 'ios');
    if (selectedDate) setDob(selectedDate);
  };

  const errors = {
    dob: touched.dob && !dob ? 'Date of birth is required' : '',
    email: touched.email && !email ? 'Email is required' : '',
  };

  const onSubmit = async () => {
    setTouched({ dob: true, email: true });
    if ( !form.email) {
        Alert.alert("Error", "Please fill in all fields");
        return
    }
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
        const username = form.firstName+ ' ' + form.lastName
        const result = await createUser(form.email, form.password, username)

        const response = await createUserData({
          variables: {
            input: {
              name: username,
              email: form.email,
              uid: result.uid,
              password: form.password,
              phone: form.phone || null, // Optional field
            },
          }
        })
        if(error) {
          throw new Error(error.message)
        }

        signIn({uid: result.uid, mode: 'guest'})
        if(navigation.canGoBack()){
          navigation.goBack()
          // navigation.goBack()
          // navigation.pop(2)
        }else router.replace('/(guest)/(tabs)/home/(toptabs)/Homes')
    } catch (error:any) {
        Alert.alert('Error', error.message)
    } finally {
      setIsSubmitting(false)
    }
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.backgroundSec}]}>
      <ScrollView contentContainerStyle={styles.inner}>
        {/* Header */}
        <View style={[styles.header, {marginBottom: 14}]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ThemedText style={styles.backArrow}>‹</ThemedText>
          </TouchableOpacity>
          <View style={{flex: 1, alignItems: 'center'}}>
            <ThemedText type='defaultSemiBold' style={styles.title}>Finish signing up</ThemedText>
          </View>
        </View>

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
        <TouchableOpacity style={[styles.button, {backgroundColor: theme.colors.background}]} onPress={onSubmit}>
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
});
