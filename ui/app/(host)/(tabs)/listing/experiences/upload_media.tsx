import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import PreviousNextUI from '@/components/ui/PreviousNextUI';
import { useExperienceStore } from '@/stores/experienceStore';
import { useTheme } from '@/theme/theme';
import { ImageProps } from '@/types/type';
import { Entypo } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { EventRegister } from 'react-native-event-listeners';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('screen');

const PhotosScreen = () => {
  const { theme } = useTheme();
  const { setField, images: storedImages, removeImage } = useExperienceStore();
  const [images, setImages] = useState<ImageProps[]>(storedImages || []);
  const [modalVisible, setModalVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe: any = EventRegister.addEventListener('UPLO_SAVE', data => {
      console.log('isojswio')
      save_state()
    } )

    return () => {
      EventRegister.removeEventListener(unsubscribe)
    };
  }, [images]);

  const save_state = () => {
    if (images === storedImages) return;
    setField('images', images);
  }

  const handleRemoveImage = useCallback(
    (filename: string) => {
      if (!filename) {
        console.log('No filename provided');
        return;
      }
      setImages((prev) => prev.filter((img) => img.filename !== filename));
      removeImage(filename);
    },
    [removeImage]
  );

  const pickImages = useCallback(async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsMultipleSelection: true,
  });
  if (!result.canceled) {
    const newImages = result.assets
      .map((asset) => ({
        uri: asset.uri,
        loading: true,
        filename: asset.fileName || `image-${Date.now()}-${Math.random()}`,
      }))
      .filter((newImage) => !images.some((existingImage) => existingImage.filename === newImage.filename)); // Filter out duplicates
    setImages((prev) => [...prev, ...newImages]);
    timeoutRef.current = setTimeout(() => {
      setImages((prev) => prev.map((img) => ({ ...img, loading: false })));
    }, 2000);
  }
}, [images]); // Add images as a dependency since we use it for duplicate checking

  // const pickImages = useCallback(async () => {
  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: 'images',
  //     allowsMultipleSelection: true,
  //   });
  //   if (!result.canceled) {
  //     const newImages = result.assets.map((asset) => ({
  //       uri: asset.uri,
  //       loading: true,
  //       filename: asset.fileName || `image-${Date.now()}-${Math.random()}`,
  //     }));
  //     setImages((prev) => [...prev, ...newImages]);
  //     timeoutRef.current = setTimeout(() => {
  //       setImages((prev) => prev.map((img) => ({ ...img, loading: false })));
  //     }, 2000);
  //   }
  // }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const renderImage = useCallback(
    ({ item }: { item: ImageProps }) => (
      <View style={[styles.imageContainer, {}]}>
        {item.loading ? (
          <View style={[styles.image, {alignItems: 'center', justifyContent: 'center'}]}>
            <ActivityIndicator size="large" color={theme.colors.textSecondary} />

          </View>
        ) : (
          <>
            <Image
              source={{ uri: item.uri }}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveImage(item.filename!)}
            >
              <Entypo name="cross" color="white" size={25} />
            </TouchableOpacity>
          </>
        )}
      </View>
    ),
    [theme.colors.primary, handleRemoveImage]
  );

  const renderDraggableImage = useCallback(
    ({ item, drag, isActive }: RenderItemParams<ImageProps>) => (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[styles.draggableImage, isActive && styles.activeImage]}
        >
          <View style={styles.image} >
            <Image
              source={{ uri: item.uri }}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    ),
    []
  );

  const handleReorder = useCallback((data: ImageProps[]) => {
    setImages(data);
  }, []);

  const confirmReorder = useCallback(() => {
    setField('images', images.map((img) => img.uri));
    setModalVisible(false);
  }, [images, setField]);

  const handleNavigation = useCallback(
    (dir: 'next' | 'prev') => {
      setField('images', images);
      // setField('images', images.map((img) => img.uri));
      router.push(
        dir === 'next'
          ? '/(host)/(tabs)/listing/experiences/availability'
          : '/(host)/(tabs)/listing/experiences/aboutYou'
      );
    },
    [images, setField]
  );
  

  const memoizedImages = useMemo(() => images, [images]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemedView plain secondary style={styles.container}>

        <FlatList
          data={memoizedImages}
          renderItem={renderImage}
          keyExtractor={(item) => item.filename || item.uri}
          numColumns={2}
          style={styles.imageGrid}
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
        />

        <Modal visible={modalVisible} animationType="slide" transparent={false}>
          <ThemedView plain secondary style={styles.modalContainer}>
            <ThemedText style={styles.modalHeader}>Reorder Photos</ThemedText>
            <DraggableFlatList
              data={memoizedImages}
              renderItem={renderDraggableImage}
              keyExtractor={(item) => item.filename || item.uri}
              numColumns={2}
              onDragEnd={({ data }) => handleReorder(data)}
              containerStyle={styles.draggableContainer}
              activationDistance={10}
            />
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={confirmReorder}
            >
              <ThemedText style={styles.buttonText}>Done</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </Modal>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary, flex: 1 }]}
            onPress={pickImages}
          >
            <ThemedText style={styles.buttonText}>Add Photos</ThemedText>
          </TouchableOpacity>
          {images.length > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.accent, flex: 1 }]}
              onPress={() => setModalVisible(true)}
            >
              <ThemedText style={styles.buttonText}>Reorder</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <PreviousNextUI
          style={styles.navigation}
          prevFunc={() => handleNavigation('prev')}
          nextFunc={() => handleNavigation('next')}
          disabled={images.length < 5 || images.some((img) => img.loading)}
        />

        
      </ThemedView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, paddingVertical: 0 },
  header: { marginBottom: 12, paddingHorizontal: 22, fontSize: 24, fontWeight: 'bold' },
  tipButton: { alignItems: 'flex-end', marginRight: 10, marginTop:10 },
  imageGrid: { paddingRight: 15, paddingLeft: 10 },
  imageContainer: { width: '50%', height: 150, borderRadius: 8, overflow: 'hidden', margin: 2, borderWidth: 0,  },
  glowing: { borderWidth: 2, borderColor: '#00f' },
  image: { width: '100%', height: '100%' },
  removeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  actionButton: { padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  modalContainer: { flex: 1, paddingVertical: 22, paddingHorizontal: 16 },
  modalHeader: { marginBottom: 12, paddingHorizontal: 22, fontSize: 24, fontWeight: 'bold' },
  draggableContainer: { flex: 1 },
  draggableImage: { width: width / 2 - 32, height: 150, margin: 10 },
  activeImage: {
    opacity: 0.8,
    transform: [{ scale: 1.05 }],
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, gap: 10, marginBottom: 82 },
  navigation: { position: 'absolute', bottom: 0, width, zIndex: 5 },
});

export default PhotosScreen;

// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import PreviousNextUI from '@/components/ui/PreviousNextUI';
// import { useExperienceStore } from '@/store/experienceStore';
// import { useTheme } from '@/theme/theme';
// import { ImageProps } from '@/types/type';
// import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
// import { Image } from 'expo-image';
// import * as ImagePicker from 'expo-image-picker';
// import { router } from 'expo-router';
// import React, { useCallback, useState } from 'react';
// import { ActivityIndicator, Dimensions, FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
// import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';

// const { width } = Dimensions.get('screen');

// const PhotosScreen = () => {
//   const { theme } = useTheme();
//   const { setField, images: storedImages, removeImage } = useExperienceStore();
//   const [images, setImages] = useState<ImageProps[]>(storedImages || []);
//   const [modalVisible, setModalVisible] = useState(false);

//   const handleRemoveImage = useCallback(
//     (filename: string) => {
//       if (!filename) {
//         console.log('No filename provided');
//         return;
//       }
//       setImages((prev) => prev.filter((img) => img.filename !== filename));
//       removeImage(filename);
//     },
//     [removeImage]
//   );

//   const pickImages = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true,
//     });
//     if (!result.canceled) {
//       const newImages = result.assets.map((asset) => ({
//         uri: asset.uri,
//         loading: true,
//         filename: asset.fileName || `image-${Date.now()}-${Math.random()}`,
//       }));
//       setImages((prev) => [...prev, ...newImages]);
//       setTimeout(() => setImages((prev) => prev.map((img) => ({ ...img, loading: false }))), 2000);
//     }
//   };

//   const renderImage = ({ item }: { item: ImageProps }) => (
//     <View style={[styles.imageContainer, item.loading && styles.glowing]}>
//       {item.loading ? (
//         <ActivityIndicator size="large" color={theme.colors.primary} />
//       ) : (
//         <>
//           <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
//           <TouchableOpacity
//             style={styles.removeButton}
//             onPress={() => handleRemoveImage(item.filename!)}
//           >
//             <Entypo name="cross" color="white" size={25} />
//           </TouchableOpacity>
//         </>
//       )}
//     </View>
//   );

//   const renderDraggableImage = ({ item, drag, isActive }: RenderItemParams<ImageProps>) => (
//     <TouchableOpacity
//       onLongPress={drag}
//       disabled={isActive}
//       style={[styles.draggableImage, isActive && styles.activeImage]}
//     >
//       <ThemedView style={styles.image} secondary>
//         <Image
//           source={{ uri: item.uri }}
//           style={{ width: '100%', height: '100%' }}
//           contentFit="cover"
//         />
//       </ThemedView>
//     </TouchableOpacity>
//   );

//   const handleReorder = (data: ImageProps[]) => {
//     setImages(data);
//   };

//   const confirmReorder = () => {
//     setField('images', images.map((img) => img.uri));
//     setModalVisible(false);
//   };

//   const handleNavigation = (dir: 'next' | 'prev') => {
//     setField('images', images.map((img) => img.uri));
//     router.push(dir === 'next' ? '/(host)/(tabs)/listing/experiences/aboutYou' : '/(host)/(tabs)/listing/experiences/aboutYou');
//   };

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ThemedView plain secondary style={styles.container}>
//         <ThemedText style={styles.header}>Upload Photos</ThemedText>
//         <TouchableOpacity style={styles.tipButton}>
//           <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.text} />
//         </TouchableOpacity>

//         <FlatList
//           data={images}
//           renderItem={renderImage}
//           keyExtractor={(item) => item.filename || item.uri} // Use filename if available
//           numColumns={2}
//           style={styles.imageGrid}
//         />

//         <Modal visible={modalVisible} animationType="slide">
//           <ThemedView plain secondary style={styles.modalContainer}>
//             <ThemedText style={styles.modalHeader}>Reorder Photos</ThemedText>
//             <DraggableFlatList
//               data={images}
//               renderItem={renderDraggableImage}
//               keyExtractor={(item) => item.filename || item.uri}
//               numColumns={2}
//               onDragEnd={({ data }) => handleReorder(data)}
//               containerStyle={{ flex: 1 }}
//             />
//             <TouchableOpacity
//               style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
//               onPress={confirmReorder}
//             >
//               <ThemedText style={styles.buttonText}>Done</ThemedText>
//             </TouchableOpacity>
//           </ThemedView>
//         </Modal>

//         <PreviousNextUI
//           style={styles.navigation}
//           prevFunc={() => handleNavigation('prev')}
//           nextFunc={() => handleNavigation('next')}
//         />

//         <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, gap: 10 }}>
//           <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.primary, flex: 1 }]} onPress={pickImages}>
//             <ThemedText style={styles.buttonText}>Add Photos</ThemedText>
//           </TouchableOpacity>
//           {images.length > 0 && (
//             <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.accent, width: '47%' }]} onPress={() => setModalVisible(true)}>
//               <ThemedText style={styles.buttonText}>Reorder</ThemedText>
//             </TouchableOpacity>
//           )}
//         </View>
//       </ThemedView>
//     </GestureHandlerRootView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, paddingVertical: 22 },
//   header: { marginBottom: 12, paddingHorizontal: 22 },
//   tipButton: { position: 'absolute', top: 34, right: 22 },
//   imageGrid: { paddingHorizontal: 22, gap: 10 },
//   imageContainer: { width: '50%', height: 150, borderRadius: 8, overflow: 'hidden', margin: 5 },
//   glowing: { borderWidth: 2, borderColor: '#00f' },
//   image: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   removeButton: {
//     position: 'absolute',
//     right: 0,
//     top: 0,
//     zIndex: 2,
//     padding: 2,
//   },
//   actionButton: { padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
//   buttonText: { color: '#fff' },
//   modalContainer: { flex: 1, paddingVertical: 22, paddingHorizontal: 16 },
//   modalHeader: { marginBottom: 12, paddingHorizontal: 22 },
//   draggableImage: { width: width / 2 - 32, margin: 10, height: 150 },
//   activeImage: { opacity: 0.7, borderWidth: 2, borderColor: '#00f' },
//   buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, gap: 10 },
//   navigation: { width, zIndex: 1 },
// });

// export default PhotosScreen;

// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import PreviousNextUI from '@/components/ui/PreviousNextUI';
// import { useExperienceStore } from '@/store/experienceStore';
// import { useTheme } from '@/theme/theme';
// import { ImageProps } from '@/types/type';
// import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
// import { Image } from 'expo-image';
// import * as ImagePicker from 'expo-image-picker';
// import { router } from 'expo-router';
// import React, { useCallback, useState } from 'react';
// import { ActivityIndicator, Dimensions, FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
// import DraggableFlatList from 'react-native-draggable-flatlist';
// import { GestureHandlerRootView, Pressable } from 'react-native-gesture-handler';

// const { width } = Dimensions.get('screen');

// // interface ImageItem { uri: string; loading: boolean; }

// const PhotosScreen = () => {
//   const { theme } = useTheme();
//   const { setField, images: storedImages, removeImage } = useExperienceStore();
//   const [images, setImages] = useState<ImageProps[]>(storedImages || []);
// //   const [images, setImages] = useState<ImageProps[]>(storedImages.map(uri => ({ uri, loading: false })) || []);
//   const [modalVisible, setModalVisible] = useState(false);

//   const handleRemoveImage = useCallback((filename: string) => {
//       if (!filename) {
//         console.log('wiodis')
//         return
//       }
//       setImages(prev => prev.filter(img => img.filename !== filename))
//       removeImage(filename)
//     }, [removeImage])

//   const pickImages = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ['images'],
//       allowsMultipleSelection: true,
//     });
//     if (!result.canceled) {
//       const newImages = result.assets.map(asset => ({ uri: asset.uri, loading: true, filename: asset.fileName || `image-${Date.now()}` }));
//       setImages([...images, ...newImages]);
//       setTimeout(() => setImages(prev => prev.map(img => ({ ...img, loading: false }))), 2000);
//     }
//   };

//   const renderImage = ({ item }: { item: ImageProps }) => (
//     <View style={[styles.imageContainer, item.loading && styles.glowing]}>
//       {item.loading ? (
//         <ActivityIndicator size="large" color={theme.colors.primary} />
//       ) : (<>
//         <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
//         <Pressable 
//           style={{
//           position: 'absolute',
//           right: 0,
//           top: 0,
//           zIndex: 2,
//           padding: 2,
//         }}
//           onPress={() => handleRemoveImage(item.filename!)}
//         >
//             <Entypo name='cross' color={'white'} size={25} />
//         </Pressable>
//       </>)}
//     </View>
//   );

//   const renderDraggableImage = ({ item, drag }: { item: ImageProps; drag: () => void }) => (
//     <TouchableOpacity onLongPress={drag} style={styles.draggableImage}>
//       <ThemedView style={styles.image} secondary>
//         <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
//       </ThemedView>
//     </TouchableOpacity>
//   );

//   const handleReorder = (data: ImageProps[]) => {
//     setImages(data);
//   };

//   const confirmReorder = () => {
//     setField('images', images.map(img => img.uri));
//     setModalVisible(false);
//   };

//   const handleNavigation = (dir: 'next' | 'prev') => {
//     setField('images', images.map(img => img.uri));
//     router.push(dir === 'next' ? '/listing/experiences/screen5' : '/listing/experiences/screen2');
//   };

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ThemedView plain secondary style={styles.container}>
//         <ThemedText style={styles.header}>Upload Photos</ThemedText>
//         <TouchableOpacity style={styles.tipButton}>
//           <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.text} />
//         </TouchableOpacity>

//         <FlatList
//           data={images}
//           renderItem={renderImage}
//           keyExtractor={(item) => item.uri}
//           numColumns={2}
//           style={styles.imageGrid}
//         //   ItemSeparatorComponent={() => (
//         //     <View style={{width: 100, height: 100}} />
//         //   )}
//         />

//         <Modal visible={modalVisible} animationType="slide">
//           <ThemedView plain secondary style={[styles.modalContainer, {justifyContent: 'space-between'}]}>
//             <View style={{paddingTop: 56}}>
//             <ThemedText style={styles.modalHeader}>Reorder Photos</ThemedText>
//             <DraggableFlatList
//               data={images}
//               renderItem={renderDraggableImage}
//               keyExtractor={(item: any) => item.uri}
//               numColumns={2}
//               onDragEnd={({ data }: any) => handleReorder(data)}
//             />
//             </View>
//             <TouchableOpacity
//               style={[styles.actionButton, { backgroundColor: theme.colors.primary, marginHorizontal: 16 }]}
//               onPress={confirmReorder}
//             >
//               <ThemedText style={styles.buttonText}>Done</ThemedText>
//             </TouchableOpacity>
//           </ThemedView>
//         </Modal>

//         <PreviousNextUI
//           style={styles.navigation}
//           prevFunc={() => handleNavigation('prev')}
//           nextFunc={() => handleNavigation('next')}
//         />

//         <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, gap: 10}}>
//             <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.primary,flex: 1 }]} onPress={pickImages}>
//                <ThemedText style={styles.buttonText}>Add Photos</ThemedText>
//             </TouchableOpacity>
//             {images.length > 0 && (
//                 <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.accent, width: '47%' }]} onPress={() => setModalVisible(true)}>
//                     <ThemedText style={styles.buttonText}>Reorder</ThemedText>
//                 </TouchableOpacity>
//             )}
//         </View>
//       </ThemedView>
//     </GestureHandlerRootView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, paddingVertical: 22 },
//   header: { marginBottom: 12, paddingHorizontal: 22 },
//   tipButton: { position: 'absolute', top: 34, right: 22 },
//   imageGrid: { paddingHorizontal: 22, gap:10 },
//   imageContainer: { width: '50%', height: 150, borderRadius: 8, overflow: 'hidden', margin: 5 },
// //   imageContainer: { width: width / 2 - 32, margin: 0, height: 150, borderRadius: 8, overflow: 'hidden' },
//   glowing: { borderWidth: 2, borderColor: '#00f', animation: 'pulse 1s infinite' },
//   image: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   actionButton: { padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 0, marginVertical: 10 },
//   buttonText: { color: '#fff' },
//   modalContainer: { flex: 1, paddingVertical: 22 },
//   modalHeader: { marginBottom: 12, paddingHorizontal: 22 },
//   draggableImage: { width: width / 2 - 32, margin: 10, height: 150 },
//   navigation: {  width, zIndex: 1 },
// });

// export default PhotosScreen;