import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import InputField from '@/components/ui/InputField';
import PreviousNextUI from '@/components/ui/PreviousNextUI';
import { useExperienceStore } from '@/stores/experienceStore';
import { useTheme } from '@/theme/theme';
import { ImageProps, ItineraryProps } from '@/types/type';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('screen');

// interface ItineraryItem { title: string; description: string; imageUri: string; }

const ItineraryScreen = () => {
  const { theme } = useTheme();
  const { images: storedImages, setField, removeImage, itenerary} = useExperienceStore();
  const [images, setImages] = useState<ImageProps[]>([]);
  // const [images, setImages] = useState<ImageProps[]>(storedImages || []);
  const [itinerary, setItinerary] = useState<ItineraryProps[]>(itenerary || []);
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [newItem, setNewItem] = useState<ItineraryProps>({description: '', title: ''});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selected, setSelected] = useState<number>()
  
  console.log('itinerary', itinerary)
  const pickImages = useCallback(async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        // allowsMultipleSelection: true,
      });
      if (!result.canceled) {
        const newImages = result.assets.map((asset) => ({
          uri: asset.uri,
          loading: true,
          filename: asset.fileName || `image-${Date.now()}-${Math.random()}`,
        }));
        setImages((prev) => [...prev, ...newImages]);
        // setImages((prev) => [...prev.slice(0, -1), ...newImages]);
        timeoutRef.current = setTimeout(() => {
          setImages((prev) => prev.map((img) => ({ ...img, loading: false })));
        }, 2000);
      }
    }, []);

    useEffect(() => {
        return () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };
      }, []);

  const addItineraryItem = () => {
    if (newItem.title && newItem.description && newItem.image) {
      setItinerary([...itinerary, newItem]);
      setNewItem({ title: '', description: '', image: { uri: '', filename: ''}});
      setAddModalVisible(false);
    }
  };

  const renderItem = ({ item }: { item: ItineraryProps }) => (
    <View style={[styles.itemContainer, ]}>
      {/* <View style={{width: 50, height: 50}}> */}
        <Image
          source={{ uri: item.image?.uri }}
          style={{width: 50, height: 50, borderRadius: 12}}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      {/* </View> */}
      <View style={{flex: 1, justifyContent: 'center', }}>
        <Text style={{fontWeight: '500', fontSize: 18, }}>{item.title}</Text>
        <Text style={{fontSize: 18, wordWrap: 'wrap'}}>{item.description}</Text>
      </View>
    </View>
  );
  

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

  const renderDraggableItem = ({ item, drag }: { item: ItineraryProps; drag: () => void }) => (
    <TouchableOpacity onLongPress={drag} style={[styles.itemContainer, ]}>
      {/* <View style={{width: 50, height: 50}}> */}
        <Image
          source={{ uri: item.image?.uri }}
          style={{width: 50, height: 50, borderRadius: 12}}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      {/* </View> */}
      <View style={{flex: 1, justifyContent: 'center', }}>
        <Text style={{fontWeight: '500', fontSize: 18, }}>{item.title}</Text>
        <Text style={{fontSize: 18, wordWrap: 'wrap'}}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderImage = useCallback(
      // (item, index ) => (
      ({ item, index }: { item: ImageProps, index: number }) => (
        <Pressable onPress={() => setSelected(index)} style={[styles.imageContainer, {borderColor: theme.colors.accent, borderWidth: selected == index ? 2: 0}]}>
          {item.loading ? (
            <View style={{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
              <ActivityIndicator size="large" color={theme.colors.textSecondary} />
  
            </View>
          ) : (
            <>
              <Image
                source={item.uri}
                style={{width: '100%', height: '100%'}}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <ThemedText> {index} </ThemedText>
            </>
          )}
        </Pressable>
      ),
      [theme.colors.primary, handleRemoveImage, selected]
    );

  const handleReorder = (data: ItineraryProps[]) => {
    setItinerary(data);
  };

  const confirmReorder = () => {
    setModalVisible(false);
  };

  const handleNavigation = (dir: 'next' | 'prev') => {
    // console.log(itinerary)
    setField('itenerary', itinerary);
    // router.push(dir === 'next' ? '/images/images': '/(host)/(tabs)/listing/experiences/upload_media');
    router.push(dir === 'next' ? '/(host)/(tabs)/listing/experiences/logistics' : '/(host)/(tabs)/listing/experiences/upload_media');
  };

  if (!itinerary) return (
    <ThemedText>isoijsojw niwoejwoj</ThemedText>
  )

  return (
    <GestureHandlerRootView >
    <ThemedView plain secondary style={styles.container}>
      {/* <ThemedText style={styles.header}>Create Itinerary</ThemedText> */}
      <TouchableOpacity style={styles.tipButton}>
        <MaterialCommunityIcons name="information-outline" size={25} color={theme.colors.text} />
      </TouchableOpacity>

      <FlatList
        data={itinerary}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.list}
        contentContainerStyle={{gap: 10, flex:1}}
        ListEmptyComponent={() => (
          <ThemedText>isojsoj</ThemedText>
        )}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setAddModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
      </TouchableOpacity>


      <Modal visible={addModalVisible} animationType="slide">
        {!imageModalVisible && <ThemedView plain secondary style={styles.modalContainer}>
         <View >
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20}}>
            <ThemedText style={{}}>Add Itinerary Item</ThemedText>
            <Pressable onPress={() => setAddModalVisible(false)}>
              <Entypo name='cross' color={theme.colors.text} size={24} />
            </Pressable>
          </View>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: 18, fontWeight: '500' }]}
            placeholder="Title"
            value={newItem.title}
            onChangeText={(text) => setNewItem({ ...newItem, title: text })}
            onSubmitEditing={() => setNewItem({...newItem, title: newItem.title.trim()})}
          />
          <InputField
            inputStyle={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, height: 100, fontSize: 18 }]}
            placeholder="Description"
            value={newItem.description}
            handleChangeText={(text) => setNewItem({ ...newItem, description: text })}
            multiLine
            hideTitle
            title='desc'
          />
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            // onPress={pickImage}
            // onPress={() => router.push('/experiences/logistics')}
            onPress={() => {
              // Promise.all()
              setImageModalVisible(true)
              // setAddModalVisible(false)
            }}
          >
            <ThemedText style={styles.buttonText}>
              {newItem.image?.uri ? 'Change Image' : 'Select Image'}
            </ThemedText>
          </TouchableOpacity>
          
          </View>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={addItineraryItem}
          >
            <ThemedText style={styles.buttonText}>Add</ThemedText>
          </TouchableOpacity>
        </ThemedView>}

        {imageModalVisible && (
          <ThemedView plain secondary style={styles.modalContainer}>
            <FlatList
              data={storedImages.concat(images)}
              renderItem={({item, index}) => renderImage({item, index})}
              keyExtractor={(item) => item.filename || item.uri}
              numColumns={2}
              style={styles.imageGrid}
              initialNumToRender={6}
              maxToRenderPerBatch={10}
              windowSize={5}
            />

            <Pressable
              onPress={pickImages}
              style={{
                position: 'absolute',
                bottom: 100,
                right: 22,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 10,
                borderRadius: 15,
                backgroundColor: theme.colors.primary,
              }}
            >
              <MaterialCommunityIcons name="plus" size={30} color={'#fff'} />
            </Pressable>

            <TouchableOpacity 
             disabled={!selected && selected !== 0}
             style={[styles.actionButton, {backgroundColor: theme.colors.primary, opacity: selected || selected! >= 0 ? 1 : 0.4}]} 
             onPress={() => {
              setNewItem({...newItem, image: images[selected!]})
              setSelected(undefined)
              setImageModalVisible(false)
             }}
            >
              <ThemedText>Select Image</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </Modal>

      {/* <Modal visible={imageModalVisible} animationType="slide">
        <ThemedView plain secondary style={styles.modalContainer}>
         <View >
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20}}>
            <ThemedText style={{}}>Add Itinoijoerary Item</ThemedText>
            <Pressable onPress={() => setImageModalVisible(false)}>
              <Entypo name='cross' color={theme.colors.text} size={24} />
            </Pressable>
          </View>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Title"
            value={newItem.title}
            onChangeText={(text) => setNewItem({ ...newItem, title: text })}
          />
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Description"
            value={newItem.description}
            onChangeText={(text) => setNewItem({ ...newItem, description: text })}
          />
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={pickImage}
          >
            <ThemedText style={styles.buttonText}>
              {newItem.image ? 'Change Image' : 'Select Image'}
            </ThemedText>
          </TouchableOpacity>
          {newItem.image?.uri && (
            <ThemedView style={styles.image} secondary>
              <Image
                source={{ uri: newItem.image?.uri }}
                style={{width: '100%', height: '100%'}}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            </ThemedView>
          )}
          </View>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={addItineraryItem}
          >
            <ThemedText style={styles.buttonText}>Add</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </Modal> */}

      <Modal visible={modalVisible} animationType="slide">
        <ThemedView plain secondary style={styles.modalContainer}>
          <View>
          <ThemedText style={styles.modalHeader}>Reorder Itinerary</ThemedText>
          <DraggableFlatList
            data={itinerary}
            renderItem={renderDraggableItem}
            keyExtractor={(item, index) => index.toString()}
            onDragEnd={({ data }) => handleReorder(data)}
            contentContainerStyle={{paddingHorizontal: 10, }}
            ItemSeparatorComponent={() => (
              <View style={{height: 10}} />
            )}
          />
          </View>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={confirmReorder}
          >
            <ThemedText style={styles.buttonText}>Done</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </Modal>
      

      {/* {true && ( */}
      {itinerary.length > 0 && (
        <TouchableOpacity
          style={[ { marginBottom: 60, paddingLeft: 20, }]}
          onPress={() => setModalVisible(true)}
        >
          <ThemedText type='link' style={styles.buttonText}>Reorder</ThemedText>
        </TouchableOpacity>
      )}

      <PreviousNextUI
        style={styles.navigation}
        prevFunc={() => handleNavigation('prev')}
        nextFunc={() => handleNavigation('next')}
      />
    </ThemedView>
    </GestureHandlerRootView>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 0 },
  header: { marginBottom: 12, paddingHorizontal: 22 },
  tipButton: { alignItems: 'flex-end', marginRight: 10 },
  list: { paddingHorizontal: 10, paddingTop: 10 },
  imageGrid: { paddingRight: 30, paddingLeft: 10 },
  itemContainer: { padding: 10, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.1)', flexDirection: 'row', gap: 10, alignItems: 'center' },
  image: { height: 50, width: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 0, marginLeft: 20  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 22,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: { width: '50%', height: 150, borderRadius: 8, overflow: 'hidden', margin: 5 },
  removeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  actionButton: { padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 22, marginVertical: 10 },
  buttonText: { fontWeight: '900', fontSize: 18 },
  modalContainer: { flex: 1, paddingVertical: 22, paddingTop: 100 , justifyContent: 'space-between'},
  modalHeader: { marginBottom: 12, paddingHorizontal: 22 },
  input: { height: 40, borderRadius: 8, paddingHorizontal: 12, marginHorizontal: 22, marginBottom: 12 },
  draggableItem: { padding: 12, marginBottom: 12, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 8 },
  navigation: { position: 'absolute', bottom: 0, width, zIndex: 1 },
});

export default ItineraryScreen;