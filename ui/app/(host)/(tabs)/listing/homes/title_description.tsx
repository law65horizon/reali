import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import PreviousNextUI from '@/components/ui/PreviousNextUI'
import { useHomeStore } from '@/stores/homeStore'
import { useTheme } from '@/theme/theme'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
    Dimensions,
    Keyboard,
    KeyboardEvent,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'

const { width, height } = Dimensions.get('screen')

const Description = () => {
  const { theme } = useTheme()
  const { title, description, setField } = useHomeStore()
  const [formData, setFormData] = useState({
    title: title || '',
    description: description || '',
  })

  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  // useEffect(() => {
  //   const onShow = (e: KeyboardEvent) => {
  //     setKeyboardHeight(e.endCoordinates.height)
  //     setIsKeyboardVisible(true)
  //   }

  //   const onHide = () => {
  //     setKeyboardHeight(0)
  //     setIsKeyboardVisible(false)
  //   }

  //   const showSub = Keyboard.addListener('keyboardDidShow', onShow)
  //   const hideSub = Keyboard.addListener('keyboardDidHide', onHide)

  //   return () => {
  //     showSub.remove()
  //     hideSub.remove()
  //   }
  // }, [])

  const onShow = (e: KeyboardEvent) => {
      setIsKeyboardVisible(true)
      setKeyboardHeight(e.endCoordinates.height)
    }

    const onHide = () => {
      setIsKeyboardVisible(false)
      setKeyboardHeight(0)
    }

    Keyboard.addListener('keyboardDidShow', onShow)
    Keyboard.addListener('keyboardDidHide', onHide)

  const handle_navigation = (direction: 'next' | 'prev') => {
    setField('title', formData.title)
    setField('description', formData.description)

    if (direction === 'next') {
      router.push('/listing/homes/amenities')
    } else {
      router.push('/listing/homes/upload_media')
    }
  }

  return (
    <ThemedView
      plain
      secondary
      style={{
        width,
        height,
        gap: 50,
        paddingVertical: 40,
        paddingHorizontal: 22,
      }}
    >
      <View style={{ gap: 20 }}>
        <ThemedText type="subtitle">Title</ThemedText>
        <ThemedText secondary>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat
          magnam illum at libero.
        </ThemedText>
        <TextInput
          value={formData.title}
          onChangeText={(e) => {
            setFormData({ ...formData, title: e })
          }}
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          onSubmitEditing={() => {
            setFormData({...formData, title: formData.title.trim()})
            setIsKeyboardVisible(false)
          }}
        />
      </View>

      <View style={{ gap: 20 }}>
        <ThemedText type="subtitle">Description</ThemedText>
        <ThemedText secondary>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat
          magnam illum at libero.
        </ThemedText>
        <TextInput
          value={formData.description}
          onChangeText={(e) => {
            setFormData({ ...formData, description: e })
          }}
          style={[
            styles.input,
            {
              height: 120,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          multiline={true}
          numberOfLines={4}
          returnKeyType="default"
        />
      </View>

      {/* Done Button Above Keyboard */}
      {isKeyboardVisible && (
        <ThemedView plain secondary
          style={{
            position: 'absolute',
            bottom: keyboardHeight+ 100,
            backgroundColor: theme.colors.background2,
            width,
            height: 40,
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingHorizontal: 30,
          }}
        >
          <TouchableOpacity onPress={() => {
            setFormData({title: formData.title.trim(), description: formData.description.trim()})
            setIsKeyboardVisible(false)
            Keyboard.dismiss()
          }}>
            <ThemedText type='defaultSemiBold' >
              Done
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {/* PreviousNextUI */}
      <PreviousNextUI
        style={{
          position: 'absolute',
          width,
          bottom: 100,
          zIndex: 10,
        }}
        disabled={!formData.description}
        prevFunc={() => handle_navigation('prev')}
        nextFunc={() => handle_navigation('next')}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 15,
    paddingHorizontal: 12,
    fontSize: 16,
  },
})

export default Description