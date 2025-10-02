import { useTheme } from '@/theme/theme'
import React from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { ThemedText } from '../ThemedText'

interface FormPromps {
    title?: string
    value: string
    placeholder?: string
    handleChangeText: (e:any) => void
    otherStyles?: any,
    onPress?: any
}
const FormField = ({title, value, placeholder, handleChangeText, otherStyles, onPress} : FormPromps) => {
  const { theme } = useTheme()
  
  return (
    <>
        <View style={styles.nameField}>
            <ThemedText secondary style={title == 'First Name' || title == 'Last Name' ? styles.smallLabel : styles.label}> {title} </ThemedText>
            <TextInput
                onPress={onPress}
                style={[
                  {
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 16,
                    backgroundColor: theme.colors.backgroundSec,
                    color: theme.colors.text,
                    fontFamily: 'ROBOTO',
                  },
                  otherStyles
                ]}
                value={value}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textSecondary}
                onChangeText={handleChangeText }
            />
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