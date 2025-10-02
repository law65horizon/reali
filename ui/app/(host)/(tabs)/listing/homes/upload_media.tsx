// import { ThemedText } from '@/components/ThemedText'
// import { ThemedView } from '@/components/ThemedView'
// import PreviousNextUI from '@/components/ui/PreviousNextUI'
// import { useFormStore } from '@/store/formStore'
// import { useTheme } from '@/theme/theme'
// import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons'
// import * as DocumentPicker from 'expo-document-picker'
// import { Image } from 'expo-image'
// import * as ImagePicker from 'expo-image-picker'
// import { router } from 'expo-router'
// import React, { memo, useCallback, useState } from 'react'
// import { ActivityIndicator, Dimensions, Modal, Pressable, TouchableOpacity, View } from 'react-native'

// const { width, height } = Dimensions.get('screen')

// export interface ImageProps {
//   uri: string
//   filename: string
// }

// interface ImageItemProps {
//   uri: string
//   filename: string
//   onRemove: (filename: string) => void
//   theme: any
// }

// // Memoized ImageItem component to prevent unnecessary re-renders
// const ImageItem = memo(({ uri, filename, onRemove, theme }: ImageItemProps) => {
//   const [loading, setLoading] = useState(true)

//   return (
//     <View style={{ width: 80, height: 80 }}>
//       {loading && (
//         <View style={{ 
//           position: 'absolute', 
//           width: 80, 
//           height: 80, 
//           justifyContent: 'center', 
//           alignItems: 'center',
//           backgroundColor: theme.colors.background2,
//           borderRadius: 5,
//         }}>
//           <ActivityIndicator size="small" color={theme.colors.textSecondary} />
//         </View>
//       )}
//       <Image 
//         source={{ uri }} 
//         style={{ width: 80, height: 80, borderRadius: 5 }} 
//         onLoad={() => setLoading(false)}
//         cachePolicy="memory-disk"
//       />
//       <Pressable 
//         onPress={() => onRemove(filename)} 
//         style={{ 
//           position: 'absolute', 
//           right: 0, 
//           top: 0, 
//           zIndex: 2, 
//           backgroundColor: 'black',
//           borderRadius: 10,
//           padding: 2,
//         }}
//       >
//         <Entypo name="cross" size={20} color="white" />
//       </Pressable>
//     </View>
//   )
// })

// const UploadMedia = () => {
//   const { theme } = useTheme()
//   const { addImage, images: imgs, removeImage, setField } = useFormStore()
//   const [images, setImages] = useState<ImageProps[]>(imgs || [])
//   const [modalVisible, setModalVisible] = useState(false)

//   const handleNavigation = useCallback((direction: 'next' | 'prev') => {
//     if (direction === 'next') {
//       setField('images', images)
//       router.push('/listing/homes/title_description')
//     } else {
//       router.push('/listing/homes/location')
//     }
//   }, [images, setField])

//   const pickImage = useCallback(async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         quality: 0.8, // Slightly reduced quality for faster loading
//         allowsMultipleSelection: true,
//         selectionLimit: 10,
//       })

//       if (!result.canceled) {
//         const newImages = result.assets.map(asset => ({
//           filename: asset.fileName || `image-${Date.now()}`,
//           uri: asset.uri,
//         }))
//         setImages(prev => [...prev, ...newImages])
//         addImage(newImages)
//       }
//     } catch (error) {
//       console.error('Error picking images:', error)
//     } finally {
//       setModalVisible(false)
//     }
//   }, [addImage])

//   const takePhoto = useCallback(async () => {
//     try {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync()
//       if (status !== 'granted') {
//         alert('Camera permission is required to take photos.')
//         return
//       }

//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         quality: 0.8,
//       })

//       if (!result.canceled) {
//         const newImage = {
//           filename: `photo-${Date.now()}`,
//           uri: result.assets[0].uri,
//         }
//         setImages(prev => [...prev, newImage])
//         addImage([newImage])
//       }
//     } catch (error) {
//       console.error('Error taking photo:', error)
//     } finally {
//       setModalVisible(false)
//     }
//   }, [addImage])

//   const pickDocument = useCallback(async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: ['application/pdf', 'image/*'],
//         multiple: true,
//       })

//       if (!result.canceled) {
//         const newDocument = {
//           filename: result.assets[0].name,
//           uri: result.assets[0].uri,
//         }
//         setImages(prev => [...prev, newDocument])
//         addImage([newDocument])
//       }
//     } catch (error) {
//       console.error('Error picking document:', error)
//     } finally {
//       setModalVisible(false)
//     }
//   }, [addImage])

//   const handleRemoveImage = useCallback((filename: string) => {
//     setImages(prev => prev.filter(img => img.filename !== filename))
//     removeImage(filename)
//   }, [removeImage])

//   return (
//     <ThemedView 
//       plain 
//       secondary 
//       style={{ width, height, gap: 10, paddingVertical: 40, paddingHorizontal: 22 }}
//     >
//       <ThemedText type="subtitle">Create a new Project</ThemedText>
//       <ThemedText secondary>
//         Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate id eum, accusamus impedit exercitationem unde?
//       </ThemedText>
//       <View style={{ gap: 10 }}>
//         <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
//           {images.map((img, index) => (
//             <ImageItem 
//               key={`${img.filename}-${index}`} 
//               uri={img.uri} 
//               filename={img.filename} 
//               onRemove={handleRemoveImage} 
//               theme={theme} 
//             />
//           ))}
//         </View>
//         <TouchableOpacity 
//           onPress={() => setModalVisible(true)} 
//           style={{
//             alignItems: 'center', 
//             justifyContent: 'center', 
//             backgroundColor: theme.colors.tint, 
//             opacity: 0.3, 
//             width: 80, 
//             height: 80, 
//             borderRadius: 10,
//           }}
//         >
//           <MaterialCommunityIcons name="camera" size={40} color={theme.colors.textSecondary} />
//           <ThemedText type="defaultSemiBold" style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
//             Upload
//           </ThemedText>
//         </TouchableOpacity>
//       </View>

//       <Modal
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//         transparent={true}
//         animationType="slide"
//       >
//         <Pressable 
//           onPress={() => setModalVisible(false)} 
//           style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
//         />
//         <View style={{ 
//           width, 
//           height: 280, 
//           alignItems: 'center', 
//           gap: 5, 
//           position: 'absolute', 
//           bottom: 0,
//           backgroundColor: 'transparent',
//         }}>
//           <ThemedView 
//             plain 
//             style={{ 
//               borderRadius: 10, 
//               width: '90%', 
//               backgroundColor: theme.colors.background,
//               overflow: 'hidden',
//             }}
//           >
//             <TouchableOpacity 
//               onPress={takePhoto} 
//               style={{ 
//                 justifyContent: 'center', 
//                 alignItems: 'center', 
//                 padding: 20, 
//                 borderBottomWidth: 0.5,
//                 borderColor: theme.colors.background2 
//               }}
//             >
//               <ThemedText>Camera</ThemedText>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               onPress={pickImage} 
//               style={{ 
//                 justifyContent: 'center', 
//                 alignItems: 'center', 
//                 padding: 20, 
//                 borderBottomWidth: 0.5,
//                 borderColor: theme.colors.background2 
//               }}
//             >
//               <ThemedText>Photo Library</ThemedText>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               onPress={pickDocument} 
//               style={{ 
//                 justifyContent: 'center', 
//                 alignItems: 'center', 
//                 padding: 20 
//               }}
//             >
//               <ThemedText>Documents</ThemedText>
//             </TouchableOpacity>
//           </ThemedView>
//           <ThemedView 
//             plain 
//             style={{ 
//               borderRadius: 10, 
//               width: '90%', 
//               backgroundColor: theme.colors.background 
//             }}
//           >
//             <TouchableOpacity 
//               onPress={() => setModalVisible(false)} 
//               style={{ 
//                 justifyContent: 'center', 
//                 alignItems: 'center', 
//                 padding: 20 
//               }}
//             >
//               <ThemedText>Cancel</ThemedText>
//             </TouchableOpacity>
//           </ThemedView>
//         </View>
//       </Modal>

//       <PreviousNextUI
//         style={{ position: 'absolute', width, bottom: 100, zIndex: 1 }}
//         disabled={images.length < 5}
//         prevFunc={() => handleNavigation('prev')}
//         nextFunc={() => handleNavigation('next')}
//       />
//     </ThemedView>
//   )
// }

// export default UploadMedia

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import PreviousNextUI from '@/components/ui/PreviousNextUI'
import { useHomeStore } from '@/store/homeStore'
import { useTheme } from '@/theme/theme'
import { ImageProps } from '@/types/type'
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { Animated, Dimensions, Modal, Pressable, TouchableOpacity, View } from 'react-native'

const { width, height } = Dimensions.get('screen')

interface ImageItemProps {
  uri: string
  filename: string
  onRemove: (filename: string) => void
  theme: any
}

// Memoized ImageItem component with glowing loader
const ImageItem = memo(({ uri, filename, onRemove, theme }: ImageItemProps) => {
  const [loading, setLoading] = useState(true)
  const fadeAnim = useState(new Animated.Value(0.3))[0] // Initial opacity for glowing effect

  useEffect(() => {
    // Glowing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [fadeAnim])

  return (
    <View style={{ width: 80, height: 80 }}>
      {loading && (
        <Animated.View
          style={{
            position: 'absolute',
            width: 80,
            height: 80,
            backgroundColor: theme.colors.background2,
            opacity: fadeAnim,
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
            Loading
          </ThemedText>
        </Animated.View>
      )}
      <Image
        source={{ uri }}
        style={{ width: 80, height: 80, borderRadius: 5 }}
        onLoad={() => setLoading(false)}
        cachePolicy="memory-disk"
      />
      <Pressable
        onPress={() => onRemove(filename)}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          zIndex: 2,
          backgroundColor: 'black',
          borderRadius: 10,
          padding: 2,
        }}
      >
        <Entypo name="cross" size={20} color="white" />
      </Pressable>
    </View>
  )
})

const UploadMedia = () => {
  const { theme } = useTheme()
  const { addImage, images: imgs, removeImage, setField } = useHomeStore()
  const [images, setImages] = useState<ImageProps[]>(imgs || [])
  const [modalVisible, setModalVisible] = useState(false)

  const handleNavigation = useCallback((direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setField('images', images)
      router.push('/listing/homes/title_description')
    } else {
      router.push('/listing/homes/location')
    }
  }, [images, setField])

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images',],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 10,
      })

      if (!result.canceled) {
        const newImages = result.assets.map(asset => ({
          filename: asset.fileName || `image-${Date.now()}`,
          uri: asset.uri,
        }))
        setImages(prev => [...prev, ...newImages])
        addImage(newImages)
      }
    } catch (error) {
      console.error('Error picking images:', error)
    } finally {
      setModalVisible(false)
    }
  }, [addImage])

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        alert('Camera permission is required to take photos.')
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      })

      if (!result.canceled) {
        const newImage = {
          filename: `photo-${Date.now()}`,
          uri: result.assets[0].uri,
        }
        setImages(prev => [...prev, newImage])
        addImage([newImage])
      }
    } catch (error) {
      console.error('Error taking photo:', error)
    } finally {
      setModalVisible(false)
    }
  }, [addImage])

  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        multiple: true,
      })

      if (!result.canceled) {
        const newDocument = {
          filename: result.assets[0].name,
          uri: result.assets[0].uri,
        }
        setImages(prev => [...prev, newDocument])
        addImage([newDocument])
      }
    } catch (error) {
      console.error('Error picking document:', error)
    } finally {
      setModalVisible(false)
    }
  }, [addImage])

  const handleRemoveImage = useCallback((filename: string) => {
    setImages(prev => prev.filter(img => img.filename !== filename))
    removeImage(filename)
  }, [removeImage])

  return (
    <ThemedView
      plain
      secondary
      style={{ width, height, gap: 10, paddingVertical: 40, paddingHorizontal: 22 }}
    >
      <ThemedText type="subtitle">Create a new Project</ThemedText>
      <ThemedText secondary>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate id eum, accusamus impedit exercitationem unde?
      </ThemedText>
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
          {images.map((img, index) => (
            <ImageItem
              key={`${img.filename}-${index}`}
              uri={img.uri}
              filename={img.filename}
              onRemove={handleRemoveImage}
              theme={theme}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.tint,
            opacity: 0.3,
            width: 80,
            height: 80,
            borderRadius: 10,
          }}
        >
          <MaterialCommunityIcons name="camera" size={40} color={theme.colors.textSecondary} />
          <ThemedText type="defaultSemiBold" style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
            Upload
          </ThemedText>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        transparent={true}
        animationType="slide"
      >
        <Pressable
          onPress={() => setModalVisible(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        />
        <View style={{
          width,
          height: 280,
          alignItems: 'center',
          gap: 5,
          position: 'absolute',
          bottom: 0,
          backgroundColor: 'transparent',
        }}>
          <ThemedView
            plain
            style={{
              borderRadius: 10,
              width: '90%',
              backgroundColor: theme.colors.background,
              overflow: 'hidden',
            }}
          >
            <TouchableOpacity
              onPress={takePhoto}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.background2,
              }}
            >
              <ThemedText>Camera</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickImage}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.background2,
              }}
            >
              <ThemedText>Photo Library</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickDocument}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
              }}
            >
              <ThemedText>Documents</ThemedText>
            </TouchableOpacity>
          </ThemedView>
          <ThemedView
            plain
            style={{
              borderRadius: 10,
              width: '90%',
              backgroundColor: theme.colors.background,
            }}
          >
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
              }}
            >
              <ThemedText>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>

      <PreviousNextUI
        style={{ position: 'absolute', width, bottom: 100, zIndex: 1 }}
        disabled={images.length < 5}
        prevFunc={() => handleNavigation('prev')}
        nextFunc={() => handleNavigation('next')}
      />
    </ThemedView>
  )
}

export default UploadMedia