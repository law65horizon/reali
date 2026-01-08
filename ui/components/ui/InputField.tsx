import { useTheme } from '@/theme/theme'
import React from 'react'
import { Button, Dimensions, InputAccessoryView, Keyboard, KeyboardType, StyleProp, TextInput, TextStyle, View } from 'react-native'
import { ThemedText } from '../ThemedText'

interface InputFieldProps {
    inputStyle?: StyleProp<TextStyle>,
    placeholder?: string
    value?: string
    title?: string
    handleChangeText: (e:any) => void
    multiline?: boolean
    titleStyle?: TextStyle
    numberOfLines?: number
    hideTitle?: boolean
    showTitle?: boolean
    keyboardType?: KeyboardType
}

const {width, height} = Dimensions.get('screen')


const InputField = ({
    inputStyle, placeholder, value, title, handleChangeText, multiline, titleStyle, numberOfLines, showTitle, keyboardType
}:InputFieldProps) => {
    const {theme} = useTheme()
    const inputAccessoryViewID = `${title?.slice(0,5)}`;

    return (
    <>
        {showTitle &&<ThemedText style={titleStyle}> {title} </ThemedText>}
        <TextInput
            style={inputStyle}
            value={value}
            inputAccessoryViewID={inputAccessoryViewID}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            multiline={multiline}
            numberOfLines={numberOfLines}
            onSubmitEditing={() => {
                handleChangeText(value?.trim())
            }}
            keyboardType={keyboardType || 'default'}
        />

        {title && <InputAccessoryView nativeID={inputAccessoryViewID} >
            <View style={{alignItems:'flex-end', paddingRight: 10, }}>
                <Button onPress={() => {
                    Keyboard.dismiss(); console.log('isois'); handleChangeText(value?.trim())
                }} title='Done' />
            </View>
        </InputAccessoryView>}

    </>
            
    )
}

export default InputField