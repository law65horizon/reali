// import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
    paddingHorizontal: 12,
  },
  image: {
    width: '100%',
    borderRadius: 12,
  },
  column: {
    flex: 1,
    gap: 8,
  },
});

const galleryData = [
  { id: '1', uri: 'https://picsum.photos/seed/1/300/300' },
  { id: '4', uri: 'https://picsum.photos/seed/4/300/300' },
  { id: '2', uri: 'https://picsum.photos/seed/2/300/350' },
  { id: '3', uri: 'https://picsum.photos/seed/3/300/250' },
  { id: '5', uri: 'https://picsum.photos/seed/5/300/200' },
  { id: '7', uri: 'https://picsum.photos/seed/7/300/300' },
  { id: '8', uri: 'https://picsum.photos/seed/8/300/250' },
  { id: '6', uri: 'https://picsum.photos/seed/6/300/350' },
];

const GalleryScreen: React.FC = () => {
  const [imageDimensions, setImageDimensions] = useState<{ [key: string]: { width: number; height: number } }>({});

  // Fetch image dimensions for each image in galleryData
  useEffect(() => {
    galleryData.forEach((item) => {
      Image.getSize(
        item.uri,
        (width, height) => {
          setImageDimensions((prev) => ({
            ...prev,
            [item.id]: { width, height },
          }));
        },
        (error) => {
          console.error(`Failed to load image dimensions for ${item.uri}:`, error);
        }
      );
    });
  }, []);

  const renderImage = (item: { id: string; uri: string }, index: number) => {
    const displayWidth = Dimensions.get('window').width / 2 - 20; // Account for padding and gap
    const dimensions = imageDimensions[item.id];
    const height = dimensions
      ? (displayWidth / dimensions.width) * dimensions.height // Calculate height based on aspect ratio
      : 200; // Fallback height if dimensions aren't loaded yet

    return (
      <Image
        key={index}
        source={{ uri: item.uri }}
        style={[styles.image, { width: displayWidth, height }]}
        // ="contain"
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={styles.column}>
            {galleryData.slice(0, galleryData.length / 2).map((item, index) => renderImage(item, index))}
          </View>
          <View style={styles.column}>
            {galleryData.slice(galleryData.length / 2).map((item, index) => renderImage(item, index))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default GalleryScreen;

// import { useTheme } from '@/theme/theme';
// import { Entypo } from '@expo/vector-icons';
// import { Image } from 'expo-image';
// import { router, useNavigation } from 'expo-router';
// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import { Animated, Dimensions, FlatList, Modal, ModalProps, NativeScrollEvent, NativeSyntheticEvent, Pressable, View } from 'react-native';
// import { ThemedText } from '../ThemedText';
// import { ThemedView } from '../ThemedView';

// type ImageModalProps = ModalProps & {
//   images: string[];
//   modalVisible: boolean;
//   setModalVisible: (param: boolean) => void;
//   initialIndex: number; // Add initialIndex prop
//   presentation: 'fullscreen' | 'gallery'
// };

// const { height, width } = Dimensions.get('window');

// const ImageModal1 = ({ images, modalVisible, setModalVisible, initialIndex, presentation }: ImageModalProps) => {
//   const { theme } = useTheme();
//   const navigation = useNavigation();
//   const [presentationMode, setPresentationMode] = useState(presentation || 'gallery')
//   const scrollX = useRef(new Animated.Value(0)).current;
//   const flatListRef = useRef<FlatList>(null); // Ref for FlatList
//   console.log(images)

//   // Scroll to the initial image when the modal opens
//   useEffect(() => {
//     if (modalVisible && flatListRef.current) {
//       flatListRef.current.scrollToIndex({ index: initialIndex, animated: false });
//     }
//   }, [modalVisible, initialIndex]);

//   // Calculate the total content width (number of images * screen width)
//   const totalContentWidth = images.length * width;

//   const handleScroll = useCallback(
//     Animated.event(
//       [{ nativeEvent: { contentOffset: { x: scrollX } } }],
//       {
//         useNativeDriver: false,
//         listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
//           const { contentOffset } = event.nativeEvent;
//           const maxScroll = totalContentWidth - width; // Maximum scrollable distance

//           // Check if scrolled beyond the last image
//           if (contentOffset.x >= maxScroll + 80) {
//             router.push('/(guest)/(modals)/listing/[listing]');
//             setModalVisible(false);
//           }
//         },
//       }
//     ),
//     [navigation, setModalVisible, totalContentWidth]
//   );

//   return (
//     <Modal
//       animationType="slide"
//       transparent={false}
//       visible={modalVisible}
//       onRequestClose={() => setModalVisible(false)}
//     >
//       <ThemedView plain secondary style={{ flex: 1 }}>
//         <Animated.FlatList
//           ref={flatListRef}
//           data={images}
//           renderItem={({ item }) => (
//             <Image source={item } style={{ width }} contentFit="contain" />
//           )}
//           getItemLayout={(data, index) => ({
//             length: width,
//             offset: width * index,
//             index,
//           })} // Optimize scrolling
//           showsHorizontalScrollIndicator={false}
//           horizontal
//           pagingEnabled
//           onScroll={handleScroll}
//           scrollEventThrottle={20}
//           initialScrollIndex={initialIndex} // Set initial scroll index
//         />
//       </ThemedView>
//       <View style={{ position: 'absolute', left: 0, top: 0, zIndex: 1, paddingTop: 60, paddingHorizontal: 16 }}>
//         <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
//           <Pressable onPress={() => setModalVisible(false)} style={{ flexDirection: 'row', alignItems: 'center' }}>
//             <Entypo name="chevron-left" size={24} color={theme.colors.text} />
//             <ThemedText>Back</ThemedText>
//           </Pressable>
//           <Pressable onPress={() => setModalVisible(false)} style={{ flexDirection: 'row', alignItems: 'center' }}>
//             <Entypo name="share-alternative" size={24} color={theme.colors.text} />
//           </Pressable>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default ImageModal1;
