// SignUpScreen.js
import { ThemedText } from '@/components/ThemedText';
import FormField from '@/components/ui/FormField';
import { useTheme } from '@/theme/theme';
import { router, useNavigation } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { signIn } from '../../../lib/appwrite';

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation() 
  const {theme} = useTheme()
  const [form, setForm] = useState({
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
        const result = await signIn(form.email, form.password)
        // setSession(result)
        if(navigation.canGoBack()){
            navigation.goBack()
            navigation.goBack()
        }else router.replace('/(guest)/(tabs)/home/(toptabs)/Homes')
    } catch (error:any) {
        Alert.alert('Error', error.message)
    }
  };

  return (
    // <View style={styles.container}>
      <ScrollView style={{backgroundColor: theme.colors.backgroundSec}} contentContainerStyle={styles.inner}>
        {/* Header */}
        <View style={[styles.header,]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ThemedText style={styles.backArrow}>‹</ThemedText>
          </TouchableOpacity>
          <View style={{flex: 1, alignItems: 'center'}}>
            <ThemedText style={styles.title}>Finish signing In</ThemedText>
          </View>
        </View>
        
        {/* <View style={{ justifyContent:'center', height:}}> */}
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
        

        {/* Button */}
        <TouchableOpacity style={[styles.button, {backgroundColor: theme.colors.background}]} onPress={onSubmit}>
          <ThemedText type='defaultSemiBold'>Agree and continue</ThemedText>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          Airbnb will send you members-only deals, inspiration, marketing emails,
          and push notifications. You can opt out of receiving these at any time in
          your account settings or directly from the messages.
        </Text>
        {/* </View> */}
      </ScrollView>
    // </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 16, paddingBottom: 40, },
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
    // backgroundColor: '#000',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  // buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  footer: { fontSize: 12, color: '#777', marginTop: 24, lineHeight: 18 },
});
