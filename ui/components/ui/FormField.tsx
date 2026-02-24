import { useTheme } from '@/theme/theme'
import { Eye, EyeOff } from 'lucide-react-native'
import React from 'react'
import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native'
import { ThemedText } from '../ThemedText'

interface FormPromps extends TextInputProps {
  title?: string
  type?: 'password'
  showPassword?: boolean,
  switchShowPassword?: () => void;
}
const FormField = React.forwardRef<TextInput, FormPromps>(
   (
    {
      title,
      type = 'text',
      showPassword,
      switchShowPassword,
      style,
      ...props // 🔥 EVERYTHING ELSE (autofill, keyboardType, etc.)
    },
    ref
  ) => {
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
              ref={ref}
              style={[
                {
                  // paddingHorizontal: 12,
                  // paddingVertical: 10,
                  fontSize: 16,
                  // backgroundColor: theme.colors.backgroundSec,
                  color: theme.colors.text,
                  fontFamily: 'ROBOTO',
                  borderWidth: 0,
                },
                style
              ]}
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry={type === 'password' && !showPassword}
              {...props}
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
)

const styles = StyleSheet.create({
  nameField: { flex: 1, marginRight: 8 },
  smallLabel: { fontSize: 15, marginBottom: 4 },
  label: { fontSize: 16, fontWeight: '500', marginTop: 24 },
})

export default FormField