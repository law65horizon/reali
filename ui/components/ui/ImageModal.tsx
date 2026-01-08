import { useTheme } from '@/theme/theme';
import { Entypo } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, ModalProps, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

type ImageModalProps = ModalProps & {
  images: string[];
  modalVisible: boolean;
  setModalVisible: (param: boolean) => void;
  initialIndex: number; // Add initialIndex prop
};

const { height, width } = Dimensions.get('window');

const ImageModal = ({ images, modalVisible, setModalVisible, initialIndex }: ImageModalProps) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null); // Ref for FlatList
  const [isGalleryMode, setGalleryMode] = useState(true)
  const [index, setIndex] = useState<number | null>(initialIndex)
  // console.log(images)

  // Scroll to the initial image when the modal opens
  useEffect(() => {
    console.warn('sioio', initialIndex)
    if (modalVisible && flatListRef.current && !isGalleryMode && index) {
      flatListRef.current.scrollToIndex({ index: index, animated: false });
    }
  }, [modalVisible, initialIndex, isGalleryMode]);

  // Calculate the total content width (number of images * screen width)
  const totalContentWidth = images.length * width;

  const handleScroll = useCallback(
    Animated.event(
      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
      {
        useNativeDriver: false,
        listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
          const { contentOffset } = event.nativeEvent;
          const maxScroll = totalContentWidth - width; // Maximum scrollable distance

          // Check if scrolled beyond the last image
          if (contentOffset.x >= maxScroll + 80) {
            router.push('/(guest)/(modals)/listing/[listing]');
            setModalVisible(false);
          }
        },
      }
    ),
    [navigation, setModalVisible, totalContentWidth]
  );

  return (
    <Modal
      isVisible={modalVisible}
      animationIn={'slideInRight'}
      animationOut={true? 'slideOutRight': 'lightSpeedOut'}
      // animationOut={'slideOutRight'}
      style={{ margin:0}}
    >
      <ThemedView plain secondary style={{ flex: 1, }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingTop:50, paddingBottom: 15, paddingHorizontal:5 }}>
          <Pressable onPress={() => isGalleryMode ?setModalVisible(false) : setGalleryMode(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Entypo name="chevron-left" size={24} color={theme.colors.text} />
            <ThemedText>Back</ThemedText>
          </Pressable>
          <Pressable onPress={() => setModalVisible(false)} style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
            <Entypo name="share-alternative" size={24} color={theme.colors.text} />
          </Pressable>
        </View>
        {isGalleryMode ? (
          <ScrollView contentContainerStyle={{paddingBottom: 2}}>
            <View style={{flexWrap: 'wrap', flexDirection: 'row', gap: 7}}>
              {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map((item, index) => (
                <TouchableOpacity key={index} onPress={() => {setIndex(1); setGalleryMode(false); }}>
                  <Image 
                    source={{uri: 'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg'}}
                    style={{height: 200, width: [0, 5, 12, 15].includes(index)? width: width/2-3.5}}
                  />   
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) :
          <Animated.FlatList
          ref={flatListRef}
          data={images}
          renderItem={({ item }) => (
            <Image source={item } style={{ width }} contentFit="contain" />
          )}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })} // Optimize scrolling
          showsHorizontalScrollIndicator={false}
          horizontal
          pagingEnabled
          // scrollEnabled={false}
          onScroll={handleScroll}
          scrollEventThrottle={20}
          initialScrollIndex={initialIndex} // Set initial scroll index
        />}
      </ThemedView>
      <View style={{ position: 'absolute', left: 0, top: 0, zIndex: 1, paddingTop: 50, paddingHorizontal: 5 }}>
        
      </View>
    </Modal>
  );
};

export default ImageModal;

// import { Entypo } from '@expo/vector-icons'
// import { Image } from 'expo-image'
// import { router, useNavigation } from 'expo-router'
// import React, { useCallback, useRef } from 'react'
// import { Animated, Dimensions, Modal, ModalProps, NativeScrollEvent, NativeSyntheticEvent, Pressable, View } from 'react-native'
// import { ThemedText } from '../ThemedText'
// import { ThemedView } from '../ThemedView'

// type ImageModalProps = ModalProps & {
//     images: string[],
//     modalVisible: boolean,
//     setModalVisible: (param:boolean) => void
// }

// const {height, width} = Dimensions.get('window')


// const ImageModal = ({ images, modalVisible, setModalVisible }: ImageModalProps) => {
//     const {theme} = useTheme()
//     const navigation = useNavigation()
//     const scrollX = useRef(new Animated.Value(0)).current;

//     // Calculate the total content width (number of images * screen width)
//   const totalContentWidth = images.length * width;

//   const handleScroll = useCallback(
//     Animated.event(
//       [{ nativeEvent: { contentOffset: { x: scrollX } } }],
//       {
//         useNativeDriver: false,
//         listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
//           const { contentOffset } = event.nativeEvent;
//           const maxScroll = totalContentWidth - width; // Maximum scrollable distance

//           // Check if scrolled beyond the last image (with a small threshold)
//           if (contentOffset.x >= maxScroll + 80) { // 50 is a threshold for extra scroll
//             router.push('/(guest)/(modals)/listing/[listing]'); // Replace with your route name
//             setModalVisible(false); // Optionally close the modal
//           }
//         },
//       }
//     ),
//     [navigation, setModalVisible, totalContentWidth]
//   );
  
//   return (
//     <Modal
//         animationType="slide" // Options: 'none', 'slide', 'fade'
//         transparent={false} // Set to false to cover the entire screen without transparency
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)} // For Android back button
//     >
//         <ThemedView plain secondary style={{flex: 1}}>
//             <Animated.FlatList 
//               data={images}
//               renderItem={({item}) => (
//                 <Image source={item} style={{width}} contentFit='contain' />
//               )}
//               showsHorizontalScrollIndicator={false}
//               horizontal
//               pagingEnabled
//               onScroll={handleScroll}
//               scrollEventThrottle={20}
//             />
//         </ThemedView>
//         <View style={{position: 'absolute', left: 0, top: 0, zIndex: 1, paddingTop: 60, paddingHorizontal: 16,}}>
//             <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', flex: 1, width: '100%'}}>
//                 <Pressable onPress={() => setModalVisible(false)} style={{flexDirection: 'row', alignItems: 'center'}}>
//                     <Entypo name='chevron-left' size={24} color={theme.colors.text} />
//                     <ThemedText>Back</ThemedText>
//                 </Pressable>
//                 <Pressable onPress={() => setModalVisible(false)} style={{flexDirection: 'row', alignItems: 'center'}}>
//                     <Entypo name='share-alternative' size={24} color={theme.colors.text} />
//                 </Pressable>
//             </View>
//         </View>
//     </Modal>
//   )
// }

// export default ImageModal