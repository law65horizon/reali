import { useTheme } from '@/theme/theme'
import { Eye, EyeOff } from 'lucide-react-native'
import React from 'react'
import { KeyboardType, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { ThemedText } from '../ThemedText'

interface FormPromps {
  title?: string
  value: string
  placeholder?: string
  handleChangeText: (e:any) => void
  otherStyles?: any,
  onPress?: any
  keyboardType?: KeyboardType
  onBlur?: () => void
  accessibilityLabel?: string
  type?: 'password'
  showPassword?: boolean,
  switchShowPassword?: () => void;
}
const FormField = ({title, value, placeholder, handleChangeText, otherStyles, onPress, keyboardType, onBlur, accessibilityLabel, type, showPassword, switchShowPassword} : FormPromps) => {
  const { theme } = useTheme()
  
  return (
    <>
      <View style={styles.nameField}>
        <ThemedText secondary style={title == 'First Name' || title == 'Last Name' ? styles.smallLabel : styles.label}> {title} </ThemedText>
          <View style={[{
            flexDirection:'row', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border,
            borderRadius: 8, backgroundColor: theme.colors.backgroundInput,
          }, ]}>
            <TextInput
              onPress={onPress}
              style={[
                {
                  // paddingHorizontal: 12,
                  // paddingVertical: 10,
                  fontSize: 16,
                  // backgroundColor: theme.colors.backgroundSec,
                  color: theme.colors.text,
                  fontFamily: 'ROBOTO',
                  borderWidth: 0
                },
                otherStyles
              ]}
              value={value}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.textSecondary}
              onChangeText={handleChangeText }
              keyboardType={keyboardType || "default"}
              onBlur={onBlur}
              accessibilityLabel={accessibilityLabel}
              secureTextEntry={type === 'password' && !showPassword}
              textContentType={type === 'password' ? 'password': 'none'}
              autoComplete={type === 'password' ? 'password': 'off'}
            />

            {type === 'password' && (
              <TouchableOpacity onPress={switchShowPassword} style={{paddingRight: 10}}>
                {showPassword ? <Eye />: <EyeOff />}
              </TouchableOpacity>
            )}
          </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  nameField: { flex: 1, marginRight: 8 },
  smallLabel: { fontSize: 15, marginBottom: 4 },
  label: { fontSize: 16, fontWeight: '500', marginTop: 24 },
})

export default FormField