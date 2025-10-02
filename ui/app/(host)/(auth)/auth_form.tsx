// SignUpScreen.js
import FormField from '@/components/ui/FormField';
import { useSession } from '@/context/ctx';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useNavigation } from 'expo-router';
import React, { useState } from 'react';
import {
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

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation() 
  const { signIn } = useSession()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: null,
    email: '',
    password: '',
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
    setIsSubmitting(true)
    try {
        const username = form.firstName+ ' ' + form.lastName
        const result = await createUser(form.email, form.password, username)
        signIn(result)
        if(navigation.canGoBack()){
          navigation.goBack()
        }else router.replace('/(tabs)/home/')
    } catch (error:any) {
        Alert.alert('Error', error.message)
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        {/* Header */}
        <View style={[styles.header,]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={{flex: 1, alignItems: 'center'}}>
            <Text style={styles.title}>Finish signing up</Text>
          </View>
        </View>

        {/* Legal name */}
        <Text style={styles.label}>Legal name</Text>
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
        <Text style={styles.hint}>
          Make sure this matches the name on your government ID. If you go by
          another name, you can add a{' '}
          <Text style={styles.link}>preferred first name</Text>.
        </Text>

        {/* Date of birth */}
        <Text style={[styles.label, { marginTop: 24 }]}>Date of birth</Text>
        <TouchableOpacity
          style={[
            styles.pickerButton,
            errors.dob ? styles.errorBorder : null,
          ]}
          onPress={() => {
            setTouched(t => ({ ...t, dob: true }));
            setShowDobPicker(true);
          }}>
          <Text style={dob ? styles.pickerText : styles.pickerPlaceholder}>
            {dob
              ? dob.toLocaleDateString()
              : 'Date of birth'}
          </Text>
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

        {/* Email */}
        {/* <Text style={[styles.label, { marginTop: 24 }]}>Email</Text> */}
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
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}


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
        <TouchableOpacity style={styles.button} onPress={onSubmit}>
          <Text style={styles.buttonText}>Agree and continue</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          Airbnb will send you members-only deals, inspiration, marketing emails,
          and push notifications. You can opt out of receiving these at any time in
          your account settings or directly from the messages.
        </Text>
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
  label: { fontSize: 16, fontWeight: '500', marginTop: 24 },
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
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  footer: { fontSize: 12, color: '#777', marginTop: 24, lineHeight: 18 },
});
