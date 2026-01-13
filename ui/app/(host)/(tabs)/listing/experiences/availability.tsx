import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import InputField from '@/components/ui/InputField';
import PreviousNextUI from '@/components/ui/PreviousNextUI';
import { useExperienceStore } from '@/stores/experienceStore';
import { useTheme } from '@/theme/theme';
import { Activity, EventDay } from '@/types/type';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { EventRegister } from 'react-native-event-listeners';

const { width, height } = Dimensions.get('window');


// ---------------------- MAIN SCREEN -------------------------
const EventEditor = () => {
  const { theme } = useTheme();
  const { setField, availability } = useExperienceStore();

  const [eventDays, setEventDays] = useState<EventDay[]>(availability || []);
  const [recurring, setRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'weekly' | 'monthly' | null>(null);
  const [multiDay, setMultiDay] = useState(false);

  // modal + step states
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // picker states
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);
  const [pickerMode, setPickerMode] = useState<'startDate' | 'endDate' | 'startTime' | 'endTime' | null>(null);

  // activity states
  const [newActivity, setNewActivity] = useState<Activity>({ title: '' });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  console.log(newActivity.title, newActivity.thumbnail_url)
  // ---------------------- HANDLERS -------------------------

  useEffect(() => {
    const unsubscribe: any = EventRegister.addEventListener('AVAI_SAVE', data => {
      console.log('isojswio')
      save_state()
    } )

    return () => {
      EventRegister.removeEventListener(unsubscribe)
    };
  }, [eventDays]);

  const save_state = () => {
    if (eventDays === availability) return;
    setField('availability', eventDays);
  }

  const validateTime = (start: Date, end: Date) => {
    if (end < start) {
      Alert.alert('Invalid Time', 'End time cannot be earlier than start time.');
      return false;
    }
    return true;
  };

  const addEventDay = () => {
    const newDay: EventDay = {
      id: eventDays.length + 1,
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
      activities: [],
    };
    setEventDays([...eventDays, newDay]);
    setEditingIndex(eventDays.length);
    setCurrentStep(1);
    setModalVisible(true);
  };

  const onChangeDate = (_: any, date?: Date) => {
    if (!date || editingIndex === null) {
      setShowPicker(null);
      return;
    }
    const updated = [...eventDays];
    switch (pickerMode) {
      case 'startDate':
        updated[editingIndex].date = date;
        break;
      case 'startTime':
        updated[editingIndex].startTime = date;
        break;
      case 'endTime':
        if (validateTime(updated[editingIndex].startTime, date)) {
          updated[editingIndex].endTime = date;
        }
        break;
    }
    setEventDays(updated);
    setShowPicker(null);
    setPickerMode(null);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const saveActivity = () => {
    if (!newActivity.title) {
      Alert.alert('Missing Title', 'Activity must have a title.');
      return;
    }
    if (editingIndex === null) return;

    const updated = [...eventDays];
    updated[editingIndex].activities.push({ ...newActivity, thumbnail_url: selectedImage || '' });
    setEventDays(updated);
    setNewActivity({ title: '' });
    setSelectedImage(null);
    setCurrentStep(2);
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const updated = [...eventDays];
    updated[dayIndex].activities.splice(activityIndex, 1);
    setEventDays(updated);
  };

  // ---------------------- RENDER -------------------------

  const renderEventDay = ({ item, index }: { item: EventDay; index: number }) => (
    <Pressable
      style={[styles.eventCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow, shadowOpacity: 0.1, shadowRadius: 6, elevation:2 }]}
      onPress={() => {
        setEditingIndex(index);
        setCurrentStep(1);
        setModalVisible(true);
      }}
    >
      <View style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold">Day {index + 1}</ThemedText>
        <ThemedText>{item.date.toDateString()}</ThemedText>
        <ThemedText style={{ color: theme.colors.textSecondary }}>
          {item.activities.length} Activities
        </ThemedText>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.text} />
    </Pressable>
  );

  const renderStep = () => {
    if (editingIndex === null) return null;
    const currentDay = eventDays[editingIndex];

    switch (currentStep) {
      case 1:
        return (
          <View style={styles.modalContent}>
           <View style={{borderColor: theme.colors.border, borderWidth: 1, borderRadius: 12, paddingVertical: 16, gap: 5}}>
            <TouchableOpacity onPress={() => { setPickerMode('startDate'); setShowPicker('date'); }} style={{borderBottomWidth: 1, borderColor: theme.colors.border, paddingBottom: 5, paddingHorizontal: 16}}>
              <ThemedText>Select Date: {currentDay.date.toDateString()}</ThemedText>
            </TouchableOpacity>

            <View style={styles.rowBetween}>
              <TouchableOpacity onPress={() => { setPickerMode('startTime'); setShowPicker('time'); }} style={{borderRightWidth: 1.5, borderColor: theme.colors.border, width: '50%'}}>
                <ThemedText>Start: {currentDay.startTime.toLocaleTimeString()}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setPickerMode('endTime'); setShowPicker('time'); }}>
                <ThemedText>End: {currentDay.endTime.toLocaleTimeString()}</ThemedText>
              </TouchableOpacity>
            </View>
           </View>

            {showPicker && (
              <DateTimePicker
                value={currentDay.date}
                mode={showPicker}
                display="default"
                onChange={onChangeDate}
              />
            )}

            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.colors.accent }]} onPress={() => setCurrentStep(2)}>
              <ThemedText>Add Activities</ThemedText>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.modalContent}>
            <FlatList
              data={currentDay.activities}
              keyExtractor={(_, i) => `act-${i}`}
              renderItem={({ item, index }) => (
                <View style={styles.activityCard}>
                  <Image source={{ uri: item.thumbnail_url || 'https://via.placeholder.com/40' }} style={styles.thumb} />
                  <View style={{ flex: 1 }}>
                    <ThemedText>{item.title}</ThemedText>
                    {item.description ? <ThemedText>{item.description}</ThemedText> : null}
                  </View>
                  <TouchableOpacity onPress={() => removeActivity(editingIndex, index)}>
                    <MaterialCommunityIcons name="delete" size={22} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              )}
            />

            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.colors.primary }]} onPress={() => setCurrentStep(3)}>
              <ThemedText>Add New Activity</ThemedText>
            </TouchableOpacity>
          </View>
        );

      case 3:
        return (
          <View style={styles.modalContent}>
              <InputField hideTitle inputStyle={[styles.input, {borderColor: theme.colors.border, color: theme.colors.text}]} placeholder="Title" value={newActivity.title} handleChangeText={(t) => setNewActivity({ ...newActivity, title: t })} />
              <InputField hideTitle inputStyle={[styles.input, {borderColor: theme.colors.border, color: theme.colors.text}]} title='desc' placeholder="Description" value={newActivity.description} handleChangeText={(t) => setNewActivity({ ...newActivity, description: t })} multiline />
              <InputField hideTitle inputStyle={[styles.input, {borderColor: theme.colors.border, color: theme.colors.text}]} placeholder="Duration (minutes)" value={newActivity.duration?.toString() || ''} handleChangeText={(t) => setNewActivity({ ...newActivity, duration: parseInt(t) || 0 })} keyboardType="numeric" />

            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.colors.accent }]} onPress={handlePickImage}>
              <ThemedText>{selectedImage ? 'Change Image' : 'Pick Image'}</ThemedText>
            </TouchableOpacity>

            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.preview} />}

            <TouchableOpacity disabled={!newActivity.title || !selectedImage} style={[styles.primaryBtn, { backgroundColor: theme.colors.primary, }]} onPress={saveActivity}>
              <ThemedText>Save Activity</ThemedText>
            </TouchableOpacity>
          </View>
        );
    }
  };

  // ---------------------- RETURN -------------------------

  return (
    <ThemedView secondary  style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <FlatList
        data={eventDays}
        renderItem={renderEventDay}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<ThemedText>No events yet</ThemedText>}
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.colors.primary }]} onPress={addEventDay}>
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: theme.colors.backgroundSec, padding: 16, paddingTop: 60, justifyContent: 'space-between' }} >
          {renderStep()}
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.colors.error, marginTop: 10, marginBottom: 200 }]} onPress={() => setModalVisible(false)}>
            <ThemedText>Close</ThemedText>
          </TouchableOpacity>
        </View>
      </Modal>

      <PreviousNextUI prevFunc={() => router.back()} nextFunc={() => {
        setField('availability', eventDays);
        router.push('/(host)/(tabs)/listing/experiences/extras')
      }} />
    </ThemedView>
  );
};

// ---------------------- STYLES -------------------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  modalContent: { gap: 16, minHeight: height - 150 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 0, paddingHorizontal: 16 },
  primaryBtn: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  thumb: { width: 40, height: 40, borderRadius: 8, marginRight: 10 },
  preview: { width: 100, height: 100, borderRadius: 10, marginTop: 10 },
  input: { borderWidth: 1.5, borderRadius: 8, padding: 12 },
});

export default EventEditor;


// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import InputField from '@/components/ui/InputField';
// import { Line } from '@/components/ui/Line';
// import PreviousNextUI from '@/components/ui/PreviousNextUI';
// import { useExperienceStore } from '@/store/experienceStore';
// import { useTheme } from '@/theme/theme';
// import { ImageProps, ItineraryProps } from '@/types/type';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { Image } from 'expo-image';
// import * as ImagePicker from 'expo-image-picker';
// import { router } from 'expo-router';
// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Dimensions,
//   FlatList,
//   Modal,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';

// const { width, height } = Dimensions.get('window');

// interface Activities {
//   title: string;
//   description?: string;
//   duration?: number;
//   thumbnail_url: string;
// }

// interface EventDay {
//   id: number;
//   startTime: Date;
//   endTime?: Date;
//   date?: Date;
//   activities: Activities[];
// }

// const Exe = () => {
//   const { theme } = useTheme();
//   const { images: storedImages, setField, removeImage, itenerary } = useExperienceStore();
//   const [images, setImages] = useState<ImageProps[]>([]);
//   const [itineraryState, setItineraryState] = useState<ItineraryProps[]>(itenerary || []);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [addModalVisible, setAddModalVisible] = useState(false);
//   const [newActivity, setNewActivity] = useState<Activities>({
//     title: '',
//     description: '',
//     thumbnail_url: '',
//     duration: 0,
//   });
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const [selected, setSelected] = useState<number>();
//   const [recurring, setRecurring] = useState(false);
//   const [currentStep, setCurrentStep] = useState<number>(1);
//   const [currentlyEditing, setCurrentlyEditing] = useState<number>(0);
//   const [multiday, setMultiday] = useState(false);
//   const [eventDays, setEventDays] = useState<EventDay[]>([]);
//   const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);
//   const [pickerMode, setPickerMode] = useState<
//     'startDate' | 'endDate' | 'singleDate' | 'startTime' | 'endTime' | null
//   >(null);

//   const pickImages = useCallback(async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//     });
//     if (!result.canceled) {
//       const newImages = result.assets.map((asset) => ({
//         uri: asset.uri,
//         loading: true,
//         filename: asset.fileName || `image-${Date.now()}-${Math.random()}`,
//       }));
//       setImages((prev) => [...prev, ...newImages]);
//       timeoutRef.current = setTimeout(() => {
//         setImages((prev) => prev.map((img) => ({ ...img, loading: false })));
//       }, 2000);
//     }
//   }, []);

//   useEffect(() => {
//     return () => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//     };
//   }, []);

//   const formatTime = (date: Date) => {
//     return date.toLocaleTimeString('en-US', {
//       hour: 'numeric',
//       minute: '2-digit',
//       hour12: true,
//     });
//   };

//   const onChangeDate = (_event: any, date?: Date) => {
//     if (!date) {
//       setShowPicker(null);
//       return;
//     }

//     setEventDays((prev) => {
//       const updated = [...prev];
//       if (!updated[currentlyEditing]) {
//         updated[currentlyEditing] = {
//           id: currentlyEditing + 1,
//           date: undefined,
//           startTime: new Date(),
//           endTime: undefined,
//           activities: [],
//         };
//       }

//       switch (pickerMode) {
//         case 'startDate':
//         case 'singleDate':
//           updated[currentlyEditing].date = date;
//           break;
//         case 'startTime':
//           updated[currentlyEditing].startTime = date;
//           break;
//         case 'endTime':
//           updated[currentlyEditing].endTime = date;
//           break;
//         case 'endDate':
//           updated[currentlyEditing].endTime = date;
//           break;
//       }

//       return updated;
//     });

//     setShowPicker(null);
//     setPickerMode(null);
//   };

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

//   const renderImage = useCallback(
//     ({ item, index }: { item: ImageProps; index: number }) => (
//       <Pressable
//         onPress={() => setSelected(index)}
//         style={[styles.imageContainer, { borderColor: theme.colors.accent, borderWidth: selected === index ? 2 : 0 }]}
//       >
//         {item.loading ? (
//           <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
//             <ActivityIndicator size="large" color={theme.colors.textSecondary} />
//           </View>
//         ) : (
//           <>
//             <Image
//               source={item.uri}
//               style={{ width: '100%', height: '100%', borderRadius: 8 }}
//               contentFit="cover"
//               cachePolicy="memory-disk"
//             />
//             <ThemedText>{index}</ThemedText>
//           </>
//         )}
//       </Pressable>
//     ),
//     [theme.colors.accent, selected]
//   );

//   const renderItem = ({ item, index }: { item: EventDay; index: number }) => (
//     <Pressable
//       style={[styles.itemContainer]}
//       onPress={() => {
//         setAddModalVisible(true);
//         setCurrentlyEditing(index);
//         setCurrentStep(1);
//       }}
//     >
//       <Image
//         source={{ uri: item.activities[0]?.thumbnail_url || 'https://via.placeholder.com/50' }}
//         style={{ width: 50, height: 50, borderRadius: 12 }}
//         contentFit="cover"
//         cachePolicy="memory-disk"
//       />
//       <View style={{ flex: 1, justifyContent: 'center' }}>
//         <Text style={{ fontWeight: '500', fontSize: 18 }}>Day {index+1}</Text>
//         <Text style={{ fontSize: 16, flexWrap: 'wrap' }}>
//           {item.activities[0]?.description || 'No activities yet'}
//         </Text>
//         <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
//           {item.date?.toDateString() || 'No date selected'}
//         </Text>
//       </View>
//     </Pressable>
//   );

//   const renderActivity = ({ item }: { item: Activities }) => (
//     <Pressable style={[styles.itemContainer, { marginBottom: 10 }]}>
//       <Image
//         source={{ uri: item.thumbnail_url || 'https://via.placeholder.com/50' }}
//         style={{ width: 50, height: 50, borderRadius: 12 }}
//         contentFit="cover"
//         cachePolicy="memory-disk"
//       />
//       <View style={{ flex: 1, justifyContent: 'center' }}>
//         <Text style={{ fontWeight: '500', fontSize: 18 }}>{item.title || 'Untitled Activity'}</Text>
//         <Text style={{ fontSize: 16, flexWrap: 'wrap' }}>
//           {item.description || 'No description'}
//         </Text>
//         {item.duration && (
//           <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
//             Duration: {item.duration} mins
//           </Text>
//         )}
//       </View>
//     </Pressable>
//   );

//   const renderCurrentStep = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <View style={{ height: height - 90 }}>
//             <View style={{ borderWidth: 1, borderRadius: 9, borderColor: theme.colors.text, marginTop: 30 }}>
//               <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8, gap: 5 }}>
//                 <ThemedText>Day {currentlyEditing + 1}</ThemedText>
//                 <Pressable
//                   style={{ alignItems: 'center', justifyContent: 'center' }}
//                   onPress={() => {
//                     setPickerMode('startDate');
//                     setShowPicker('date');
//                   }}
//                 >
//                   <ThemedText style={{ paddingLeft: 5 }}>
//                     {eventDays[currentlyEditing]?.date?.toDateString() || 'Select Date'}
//                   </ThemedText>
//                 </Pressable>
//               </View>
//               <Line style={{ borderWidth: 0.5, borderColor: theme.colors.text }} />
//               <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8, gap: 5 }}>
//                 <Pressable
//                   style={{ justifyContent: 'center', width: '50%', borderRightWidth: 2, borderRadius: 2 }}
//                   onPress={() => {
//                     setPickerMode('startTime');
//                     setShowPicker('time');
//                   }}
//                 >
//                   <ThemedText>
//                     {eventDays[currentlyEditing]?.startTime
//                       ? formatTime(eventDays[currentlyEditing].startTime)
//                       : 'Start time'}
//                   </ThemedText>
//                 </Pressable>
//                 <Pressable
//                   style={{ alignItems: 'center', justifyContent: 'center', paddingRight: 8 }}
//                   onPress={() => {
//                     setPickerMode('endTime');
//                     setShowPicker('time');
//                   }}
//                 >
//                   <ThemedText>
//                     {eventDays[currentlyEditing]?.endTime
//                       ? formatTime(eventDays[currentlyEditing].endTime)
//                       : 'End time'}
//                   </ThemedText>
//                 </Pressable>
//               </View>
//             </View>
//             {showPicker && (
//               <DateTimePicker
//                 value={eventDays[currentlyEditing]?.date || new Date()}
//                 mode={showPicker}
//                 display="default"
//                 onChange={onChangeDate}
//                 is24Hour={false}
//                 style={{ marginVertical: 10 }}
//               />
//             )}
//             <View style={{ flex: 1, justifyContent: 'flex-end', gap: 15, paddingBottom: 20 }}>
//               <TouchableOpacity
//                 style={{ backgroundColor: theme.colors.accent, padding: 8, borderRadius: 8, alignItems: 'center' }}
//                 onPress={() => setCurrentStep(2)}
//               >
//                 <ThemedText type="defaultSemiBold">Add Activities</ThemedText>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={{ backgroundColor: theme.colors.primary, padding: 8, borderRadius: 8, alignItems: 'center' }}
//                 onPress={() => {
//                   const newEventDay: EventDay = {
//                     id: eventDays.length + 1,
//                     date: new Date(),
//                     startTime: new Date(),
//                     endTime: undefined,
//                     activities: [],
//                   };
//                   setEventDays([...eventDays, newEventDay]);
//                   setCurrentlyEditing(eventDays.length);
//                   setAddModalVisible(true);
//                   setCurrentStep(1);
//                 }}
//               >
//                 <ThemedText type="defaultSemiBold">Add Event Day</ThemedText>
//               </TouchableOpacity>
//             </View>
//           </View>
//         );

//       case 2:
//         return (
//           <View style={styles.modalContainer}>
//             <FlatList
//               data={eventDays[currentlyEditing]?.activities || []}
//               renderItem={renderActivity}
//               keyExtractor={(item, index) => `${item.title}-${index}`}
//               scrollEnabled={false}
//               contentContainerStyle={{ paddingBottom: 100 }}
//             />
//             <Pressable
//               style={{
//                 position: 'absolute',
//                 padding: 8,
//                 borderRadius: 8,
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 zIndex: 8,
//                 bottom: 80,
//                 backgroundColor: theme.colors.primary,
//                 right: 0,
//               }}
//               onPress={() => {
//                 setNewActivity({ title: '', description: '', thumbnail_url: '', duration: 0 });
//                 setCurrentStep(3);
//               }}
//             >
//               <MaterialCommunityIcons name="plus" size={35} color="white" />
//             </Pressable>
//             <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
//               <TouchableOpacity
//                 style={[styles.actionButton, { backgroundColor: theme.colors.primary, width: 'auto' }]}
//                 onPress={() => setCurrentStep(1)}
//               >
//                 <ThemedText style={styles.buttonText}>Back</ThemedText>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 disabled={!eventDays[currentlyEditing]?.activities?.length}
//                 style={[
//                   styles.actionButton,
//                   {
//                     backgroundColor: theme.colors.primary,
//                     flex: 1,
//                     opacity: eventDays[currentlyEditing]?.activities?.length ? 1 : 0.4,
//                   },
//                 ]}
//                 onPress={() => setAddModalVisible(false)}
//               >
//                 <ThemedText style={styles.buttonText}>Add Event Day</ThemedText>
//               </TouchableOpacity>
//             </View>
//           </View>
//         );

//       case 3:
//         return (
//           <View style={styles.modalContainer}>
//             <View style={{ gap: 15 }}>
//               <InputField
//                 inputStyle={[
//                   styles.input,
//                   { backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: 18, fontWeight: '500' },
//                 ]}
//                 placeholder="Activity Title"
//                 value={newActivity.title}
//                 handleChangeText={(text) => setNewActivity({ ...newActivity, title: text })}
//               />
//               <InputField
//                 inputStyle={[
//                   styles.input,
//                   { backgroundColor: theme.colors.background, color: theme.colors.text, height: 100, fontSize: 18 },
//                 ]}
//                 placeholder="Activity Description"
//                 value={newActivity.description}
//                 handleChangeText={(text) => setNewActivity({ ...newActivity, description: text })}
//                 multiLine
//                 hideTitle
//                 title="desc"
//               />
//               <InputField
//                 inputStyle={[
//                   styles.input,
//                   { backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: 18 },
//                 ]}
//                 placeholder="Duration (minutes)"
//                 value={newActivity.duration ? newActivity.duration.toString() : ''}
//                 handleChangeText={(text) => setNewActivity({ ...newActivity, duration: parseInt(text) || 0 })}
//                 keyboardType="numeric"
//               />
//             </View>
//             <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
//               <TouchableOpacity
//                 style={[styles.actionButton, { backgroundColor: theme.colors.primary, width: 'auto' }]}
//                 onPress={() => setCurrentStep(2)}
//               >
//                 <ThemedText style={styles.buttonText}>Back</ThemedText>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.actionButton, { backgroundColor: theme.colors.primary, flex: 1 }]}
//                 onPress={() => setCurrentStep(4)}
//               >
//                 <ThemedText style={styles.buttonText}>
//                   {newActivity.thumbnail_url ? 'Change Image' : 'Select Image'}
//                 </ThemedText>
//               </TouchableOpacity>
//             </View>
//           </View>
//         );

//       case 4:
//         return (
//           <View style={styles.modalContainer}>
//             <FlatList
//               data={storedImages.concat(images)}
//               renderItem={({ item, index }) => renderImage({ item, index })}
//               keyExtractor={(item) => item.filename}
//               numColumns={2}
//               key={`flatlist-step-${currentStep}`}
//               initialNumToRender={6}
//               maxToRenderPerBatch={10}
//               windowSize={5}
//               scrollEnabled={false}
//             />
//             <Pressable
//               onPress={pickImages}
//               style={{
//                 position: 'absolute',
//                 bottom: 70,
//                 right: 0,
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 padding: 10,
//                 borderRadius: 15,
//                 backgroundColor: theme.colors.primary,
//               }}
//             >
//               <MaterialCommunityIcons name="plus" size={30} color="#fff" />
//             </Pressable>
//             <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
//               <TouchableOpacity
//                 style={[styles.actionButton, { backgroundColor: theme.colors.primary, width: 'auto' }]}
//                 onPress={() => setCurrentStep(3)}
//               >
//                 <ThemedText style={styles.buttonText}>Back</ThemedText>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 disabled={selected === undefined || !newActivity.title}
//                 style={[
//                   styles.actionButton,
//                   {
//                     backgroundColor: theme.colors.primary,
//                     opacity: selected !== undefined && newActivity.title ? 1 : 0.4,
//                     flex: 1,
//                   },
//                 ]}
//                 onPress={() => {
//                   if (selected !== undefined && newActivity.title) {
//                     const selectedImage = storedImages.concat(images)[selected];
//                     setEventDays((prev) => {
//                       const updated = [...prev];
//                       if (!updated[currentlyEditing]) {
//                         updated[currentlyEditing] = {
//                           id: currentlyEditing + 1,
//                           date: undefined,
//                           startTime: new Date(),
//                           endTime: undefined,
//                           activities: [],
//                         };
//                       }
//                       updated[currentlyEditing].activities.push({
//                         ...newActivity,
//                         thumbnail_url: selectedImage.uri,
//                       });
//                       return updated;
//                     });
//                     setNewActivity({ title: '', description: '', thumbnail_url: '', duration: 0 });
//                     setSelected(undefined);
//                     setCurrentStep(2);
//                   }
//                 }}
//               >
//                 <ThemedText>Add Activity</ThemedText>
//               </TouchableOpacity>
//             </View>
//           </View>
//         );
//     }
//   };

//   const handleNavigation = (dir: 'next' | 'prev') => {
//     // setField(
//     //   'itinerary',
//     //   eventDays.map((day) => ({
//     //     title: `Day ${day.id}`,
//     //     description: day.activities.map((act) => act.description || 'No description').join(', '),
//     //     image: {
//     //       uri: day.activities[0]?.thumbnail_url || '',
//     //       filename: '',
//     //     },
//     //   }))
//     // );
//     router.push(
//       dir === 'next'
//         ? '/(host)/(tabs)/listing/experiences/logistics'
//         : '/(host)/(tabs)/listing/experiences/upload_media'
//     );
//   };

//   return (
//     <GestureHandlerRootView>
//       <ThemedView plain secondary style={styles.container}>
//         <FlatList
//           data={eventDays}
//           renderItem={renderItem}
//           keyExtractor={(item, index) => index.toString()}
//           style={styles.list}
//           contentContainerStyle={{ gap: 10, flex: 1 }}
//           ListHeaderComponent={() => (
//             <View
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 justifyContent: 'space-between',
//                 paddingHorizontal: 10,
//               }}
//             >
//               <TouchableOpacity style={styles.row} onPress={() => setRecurring(!recurring)}>
//                 <View
//                   style={[
//                     styles.checkbox,
//                     recurring ? { backgroundColor: theme.colors.primary } : { borderColor: theme.colors.text },
//                   ]}
//                 />
//                 <ThemedText style={styles.label}>Recurring Event</ThemedText>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.row} onPress={() => setMultiday(!multiday)}>
//                 <View
//                   style={[
//                     styles.checkbox,
//                     multiday ? { backgroundColor: theme.colors.primary } : { borderColor: theme.colors.text },
//                   ]}
//                 />
//                 <ThemedText style={styles.label}>Multi-Day Event</ThemedText>
//               </TouchableOpacity>
//             </View>
//           )}
//           ListEmptyComponent={() => (
//             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//               <ThemedText>No event days added yet</ThemedText>
//             </View>
//           )}
//         />
//         <Modal visible={addModalVisible} animationType="slide">
//           <ScrollView style={{ backgroundColor: theme.colors.backgroundSec, paddingTop: 60, paddingHorizontal: 12 }}>
//             {renderCurrentStep()}
//           </ScrollView>
//         </Modal>
//         {itineraryState.length > 0 && (
//           <TouchableOpacity style={{ marginBottom: 60, paddingLeft: 20 }} onPress={() => setModalVisible(true)}>
//             <ThemedText type="link" style={styles.buttonText}>
//               Reorder
//             </ThemedText>
//           </TouchableOpacity>
//         )}
//         {(multiday || eventDays.length === 0) && (
//           <TouchableOpacity
//             style={[styles.fab, { backgroundColor: theme.colors.primary }]}
//             onPress={() => {
//               setAddModalVisible(true);
//               setCurrentStep(1);
//               setCurrentlyEditing(eventDays.length);
//             }}
//           >
//             <MaterialCommunityIcons name="plus" size={24} color="#fff" />
//           </TouchableOpacity>
//         )}
//         <PreviousNextUI
//           style={styles.navigation}
//           prevFunc={() => handleNavigation('prev')}
//           nextFunc={() => handleNavigation('next')}
//         />
//       </ThemedView>
//     </GestureHandlerRootView>
//   );
// };

// const styles = StyleSheet.create({
//   checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, marginRight: 8 },
//   label: { fontSize: 16, fontWeight: '500', fontFamily: 'Roboto' },
//   row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
//   input: { borderWidth: 0, borderRadius: 8, padding: 12 },
//   container: { flex: 1, paddingVertical: 0 },
//   list: { paddingHorizontal: 10, paddingTop: 0 },
//   itemContainer: { padding: 10, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.1)', flexDirection: 'row', gap: 10, alignItems: 'center' },
//   fab: {
//     position: 'absolute',
//     bottom: 100,
//     right: 22,
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   imageContainer: { width: '50%', height: 150, borderRadius: 8, overflow: 'hidden', padding: 2, marginBottom: 10 },
//   actionButton: { padding: 10, borderRadius: 8, alignItems: 'center' },
//   buttonText: { fontWeight: '900', fontSize: 18 },
//   modalContainer: { flex: 1, paddingVertical: 11, height: height - 90, justifyContent: 'space-between' },
//   navigation: { position: 'absolute', bottom: 0, width, zIndex: 1 },
// });

// export default Exe;

// // import InputField from '@/components/ui/InputField';
// // import { Line } from '@/components/ui/Line';
// // import PreviousNextUI from '@/components/ui/PreviousNextUI';
// // import { useExperienceStore } from '@/store/experienceStore';
// // import { useTheme } from '@/theme/theme';
// // import { ImageProps, ItineraryProps } from '@/types/type';
// // import { MaterialCommunityIcons } from '@expo/vector-icons';
// // import DateTimePicker from '@react-native-community/datetimepicker';
// // import { Image } from 'expo-image';
// // import * as ImagePicker from 'expo-image-picker';
// // import { router } from 'expo-router';
// // import React, { useCallback, useEffect, useRef, useState } from 'react';
// // import {
// //   ActivityIndicator,
// //   Dimensions,
// //   FlatList,
// //   Modal,
// //   Pressable,
// //   ScrollView,
// //   StyleSheet,
// //   Text,
// //   TouchableOpacity,
// //   View
// // } from 'react-native';
// // import { GestureHandlerRootView } from 'react-native-gesture-handler';
// // // import Icon from 'react-native-vector-icons/MaterialIcons';

// // const { width, height } = Dimensions.get('window');

// // // interface ItineraryItem { title: string; description: string; imageUri: string; }
// // interface Activities {
// //     title: string
// //     description?: string
// //     duration?: number
// //     thumbnail_url: string
// // }

// // interface EventDay {
// //   id: number
// //   startTime: Date,
// //   endTime?: Date,
// //   date?: Date,
// //   // startDate: Date,
// //   // endDate?: Date,
// //   activities: Activities[]
// // }

// // const Exe = () => {
// //   const { theme } = useTheme();
// //   const { images: storedImages, setField, removeImage, itenerary} = useExperienceStore();
// //   const [images, setImages] = useState<ImageProps[]>([]);
// //   // const [images, setImages] = useState<ImageProps[]>(storedImages || []);
// //   const [itinerary, setItinerary] = useState<ItineraryProps[]>(itenerary || []);
// //   const [modalVisible, setModalVisible] = useState(false);
// //   const [addModalVisible, setAddModalVisible] = useState(false);
// //   const [imageModalVisible, setImageModalVisible] = useState(false);
// //   const [newItem, setNewItem] = useState<ItineraryProps>({description: '', title: ''});
// //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// //   const [selected, setSelected] = useState<number>()

// //   const [recurring, setRecurring] = useState(false);
// //   const [currentStep, setCurrentStep] = useState<number>(1);
// //   const [currentlyEditing, setCurrentlyEditing] = useState<number>(0);
// //   const [multiday, setMultiday] = useState(false);
// //   const [eventDays, setEventDays] = useState<EventDay[]>([])
// //   const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);
// //   const [pickerMode, setPickerMode] = useState<'startDate' | 'endDate' | 'singleDate' | 'startTime' | 'endTime' | null>(null);

// //   console.log(eventDays)
// //   const pickImages = useCallback(async () => {
// //       const result = await ImagePicker.launchImageLibraryAsync({
// //         mediaTypes: 'images',
// //         // allowsMultipleSelection: true,
// //       });
// //       if (!result.canceled) {
// //         const newImages = result.assets.map((asset) => ({
// //           uri: asset.uri,
// //           loading: true,
// //           filename: asset.fileName || `image-${Date.now()}-${Math.random()}`,
// //         }));
// //         setImages((prev) => [...prev, ...newImages]);
// //         // setImages((prev) => [...prev.slice(0, -1), ...newImages]);
// //         timeoutRef.current = setTimeout(() => {
// //           setImages((prev) => prev.map((img) => ({ ...img, loading: false })));
// //         }, 2000);
// //       }
// //     }, []);
    

// //     useEffect(() => {
// //         return () => {
// //           if (timeoutRef.current) {
// //             clearTimeout(timeoutRef.current);
// //           }
// //         };
// //       }, []);

// //   const addItineraryItem = () => {
// //     if (newItem.title && newItem.description && newItem.image) {
// //       setItinerary([...itinerary, newItem]);
// //       setNewItem({ title: '', description: '', image: { uri: '', filename: ''}});
// //       setAddModalVisible(false);
// //     }
// //   };

// //   const formatTime = (date: Date) => {
// //     return date.toLocaleTimeString('en-US', {
// //       hour: 'numeric',
// //       minute: '2-digit',
// //       hour12: true,
// //     });
// //   };

// //   const onChangeDate = (_event: any, date?: Date) => {
// //   if (!date) {
// //     setShowPicker(null);
// //     return;
// //   }

// //   setEventDays((prev) => {
// //     const updated = [...prev];

// //     // If there's no current eventDay, add a new one
// //     if (!updated[currentlyEditing]) {
// //       updated[currentlyEditing] = {
// //         id: currentlyEditing + 1,
// //         date: undefined,
// //         startTime: new Date(),
// //         endTime: undefined,
// //         activities: [],
// //       };
// //     }

// //     switch (pickerMode) {
// //       case 'startDate':
// //       case 'singleDate':
// //         updated[currentlyEditing].date = date;
// //         break;
// //       case 'startTime':
// //         updated[currentlyEditing].startTime = date;
// //         break;
// //       case 'endTime':
// //         updated[currentlyEditing].endTime = date;
// //         break;
// //       case 'endDate':
// //         // if you want multiday date range support
// //         updated[currentlyEditing].endTime = date;
// //         break;
// //     }

// //     return updated;
// //   });

// //   setShowPicker(null);
// //   setPickerMode(null);
// // };



// //   const handleRemoveImage = useCallback(
// //         (filename: string) => {
// //           if (!filename) {
// //             console.log('No filename provided');
// //             return;
// //           }
// //           setImages((prev) => prev.filter((img) => img.filename !== filename));
// //           removeImage(filename);
// //         },
// //         [removeImage]
// //       );

// //   const renderImage = useCallback(
// //         // (item, index ) => (
// //         ({ item, index }: { item: ImageProps, index: number }) => (
// //           <Pressable onPress={() => setSelected(index)} style={[styles.imageContainer, {borderColor: theme.colors.accent, borderWidth: selected == index ? 2: 0}]}>
// //             {item.loading ? (
// //               <View style={{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
// //                 <ActivityIndicator size="large" color={theme.colors.textSecondary} />
    
// //               </View>
// //             ) : (
// //               <>
// //                 <Image
// //                   source={item.uri}
// //                   style={{width: '100%', height: '100%', borderRadius: 8}}
// //                   contentFit="cover"
// //                   cachePolicy="memory-disk"
// //                 />
// //                 <ThemedText> {index} </ThemedText>
// //               </>
// //             )}
// //           </Pressable>
// //         ),
// //         [theme.colors.primary, handleRemoveImage, selected]
// //       );

// //   const renderCurrentStep = () => {
// //     switch (currentStep) {
// //         case 1:
// //           return (<View style={{height: height-90}}>
// //                   <View style={{borderWidth: 1, borderRadius:9, borderColor: theme.colors.text, marginTop: 30}}>
// //                     <View style={{flexDirection: 'row', alignItems: 'center',padding: 8, gap: 5}}>
// //                         <ThemedText >Day {currentlyEditing+1}</ThemedText>
// //                         <Pressable style={{alignItems: 'center', justifyContent: 'center', }}
// //                             onPress={() => { 
// //                                 // setFocused(`t-${eventDay?.id}`)
// //                                 setPickerMode('startDate'); setShowPicker('date'); 
// //                             }}>
// //                             <ThemedText style={{paddingLeft: 5}}>{eventDays[currentlyEditing]?.date? eventDays[currentlyEditing].date?.toDateString(): 'Select Date'}</ThemedText>
// //                         </Pressable>
// //                     </View>
// //                     {/* <ThemedText style={{padding:8}}>{eventDays[currentlyEditing]?.startDate ? eventDays[currentlyEditing]?.startDate?.toDateString() : 'Select Date'}</ThemedText> */}
// //                     <Line style={{borderWidth: 0.5, borderColor: theme.colors.text}} />
// //                     <View style={{flexDirection: 'row', alignItems: 'center',paddingVertical: 8, gap: 5}}>
// //                         <Pressable style={{justifyContent: 'center', width: '50%', borderRightWidth: 2, borderRadius: 2}}
// //                           onPress={() => { 
// //                             // setFocused(`t-${day.id}`)
// //                             setPickerMode('startTime'); setShowPicker('time'); 
// //                         }}>
// //                           <ThemedText style={{}}> {eventDays[currentlyEditing]?.startTime ? formatTime(eventDays[currentlyEditing]?.startTime): 'Start time'} </ThemedText>
// //                         </Pressable>
// //                         <Pressable style={{alignItems: 'center', justifyContent: 'center', paddingRight: 8}}
// //                             onPress={() => { 
// //                                 // setFocused(`t-${eventDays[currentlyEditing]?.id}`)
// //                                 setPickerMode('endTime'); setShowPicker('time'); 
// //                             }}>
// //                             <ThemedText style={{}}>{eventDays[currentlyEditing]?.endTime? formatTime(eventDays[currentlyEditing]?.endTime): 'End time'}</ThemedText>
// //                         </Pressable>
// //                     </View>
// //                   </View>
// //                   {showPicker && (
// //                     <DateTimePicker
// //                       value={new Date()}
// //                       mode={showPicker}
// //                       display="default"
// //                       onChange={onChangeDate}
// //                       is24Hour={false}
// //                       style={{marginVertical: 10, }}
// //                     />
// //                   )}
                  


// //                   <View style={{flex: 1, justifyContent: 'flex-end', gap: 15, paddingBottom: 20}}>
// //                     <TouchableOpacity style={{backgroundColor: theme.colors.accent, padding: 8, borderRadius: 8, alignItems: 'center',}} onPress={() => setCurrentStep(2)}>
// //                       <ThemedText type='defaultSemiBold'>Add Activities</ThemedText>
// //                     </TouchableOpacity>

// //                     <TouchableOpacity style={{backgroundColor: theme.colors.primary, padding: 8, borderRadius: 8, alignItems: 'center',}} onPress={() => setAddModalVisible(false)}>
// //                       <ThemedText type='defaultSemiBold'>Add Event Day</ThemedText>
// //                     </TouchableOpacity>
// //                   </View>
// //             </View>
// //         );

// //         case 2: 
// //           return (
// //             <View style={styles.modalContainer}>
// //               <FlatList 
// //                 data={eventDays[currentlyEditing].activities}
// //                 renderItem={renderActivity}
// //                 // keyExtractor={()}
// //                 // keyExtractor={(item) => item.startTime}
// //                 scrollEnabled={false}
// //               />

// //               <Pressable style={{position: 'absolute', padding: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center', zIndex: 8, bottom: 80, backgroundColor: theme.colors.primary, right:0}}
// //                 onPress={() => setCurrentStep(3)}
// //               >
// //                 <MaterialCommunityIcons name='plus' size={35} color={'white'} />
// //               </Pressable>

// //               <View style={{flexDirection: 'row', gap: 10, width: '100%'}}>
// //                 <TouchableOpacity
// //                   style={[styles.actionButton, { backgroundColor: theme.colors.primary, width: 'auto' }]}
// //                   onPress={() => {
// //                     setCurrentStep(1)
// //                   }}
// //                 >
// //                   <ThemedText style={styles.buttonText}>
// //                     Back
// //                   </ThemedText>
// //                 </TouchableOpacity>
// //                 <TouchableOpacity disabled={eventDays[currentlyEditing].activities.length <= 0}
// //                   style={[styles.actionButton, { backgroundColor: theme.colors.primary, flex: 1, opacity: eventDays[currentlyEditing].activities.length <= 0 ? 0.4: 1 }]}
// //                   onPress={() => setAddModalVisible(false)}
// //                 >
// //                   <ThemedText style={styles.buttonText}> Add Event Day  </ThemedText>
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //         );

// //         case 3:
// //           return (
// //             <View style={styles.modalContainer}>
// //          <View style={{gap: 15}}>

// //           <InputField
// //             inputStyle={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: 18, fontWeight: '500' }]}
// //             placeholder="Title"
// //             value={newItem.title}
// //             handleChangeText={(text) => setNewItem({ ...newItem, title: text })}
// //           />
// //           <InputField
// //             inputStyle={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, height: 100, fontSize: 18 }]}
// //             placeholder="Description"
// //             value={newItem.description}
// //             handleChangeText={(text) => setNewItem({ ...newItem, description: text })}
// //             multiLine
// //             hideTitle
// //             title='desc'
// //           />
          
          
// //           </View>
          
// //           <View style={{flexDirection: 'row', gap: 10, width: '100%'}}>
// //             <TouchableOpacity
// //               style={[styles.actionButton, { backgroundColor: theme.colors.primary, width: 'auto' }]}
// //               onPress={() => {
// //                 setCurrentStep(2)
// //               }}
// //             >
// //             <ThemedText style={styles.buttonText}>
// //               Back
// //             </ThemedText>
// //            </TouchableOpacity>
// //            <TouchableOpacity
// //             style={[styles.actionButton, { backgroundColor: theme.colors.primary, flex: 1 }]}
// //             onPress={() => {
// //               setCurrentStep(4)
// //             }}
// //            >
// //             <ThemedText style={styles.buttonText}>
// //               {newItem.image?.uri ? 'Change Image' : 'Select Image'}
// //             </ThemedText>
// //            </TouchableOpacity>
// //           </View>
// //          </View>
// //         );
        
// //         case 4:
// //           return (
// //             <View style={styles.modalContainer}>
// //               <FlatList
// //                 data={storedImages.concat(images)}
// //                 renderItem={({item, index}) => renderImage({item, index})}
// //                 keyExtractor={(item) => item.filename }
// //                 numColumns={2}
// //                 key={`flatlist-step-${currentStep}`}
// //                 initialNumToRender={6}
// //                 maxToRenderPerBatch={10}
// //                 windowSize={5}
// //                 scrollEnabled={false}
// //               />
            
// //               <Pressable
// //                 onPress={pickImages}
// //                 style={{
// //                   position: 'absolute',
// //                   bottom: 70,
// //                   right: 0,
// //                   alignItems: 'center',
// //                   justifyContent: 'center',
// //                   padding: 10,
// //                   borderRadius: 15,
// //                   backgroundColor: theme.colors.primary,
// //                 }}
// //               >
// //                 <MaterialCommunityIcons name="plus" size={30} color={'#fff'} />
// //               </Pressable>

              
// //               <View style={{flexDirection: 'row', gap: 10, width: '100%'}}>
// //                 <TouchableOpacity
// //               style={[styles.actionButton, { backgroundColor: theme.colors.primary, width: 'auto', }]}
// //               onPress={() => {
// //                 setCurrentStep(3)
// //               }}
// //             >
// //             <ThemedText style={styles.buttonText}>
// //               Back
// //             </ThemedText>
// //            </TouchableOpacity>
// //                 <TouchableOpacity 
// //                   disabled={!selected && selected !== 0}
// //                   style={[styles.actionButton, {backgroundColor: theme.colors.primary, opacity: selected || selected! >= 0 ? 1 : 0.4, flex:1}]} 
// //                   onPress={() => {
// //                     setCurrentStep(2)
// //                   // setNewItem({...newItem, image: images[selected!]})
// //                   // setSelected(undefined)
// //                   // setImageModalVisible(false)
// //                   }}
// //                 >
// //                   <ThemedText>Add Activity</ThemedText>
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //         );          
// //     }
// //   }

// //   const renderItem = ({ item, index }: { item: EventDay, index: number }) => (
// //     <Pressable style={[styles.itemContainer, ]} onPress={() => {setAddModalVisible(true); setCurrentlyEditing(index)}}>
// //       {/* <View style={{width: 50, height: 50}}> */}
// //         <Image
// //           source={{ uri: item.activities[0]?.thumbnail_url}}
// //           style={{width: 50, height: 50, borderRadius: 12}}
// //           contentFit="cover"
// //           cachePolicy="memory-disk"
// //         />
// //       {/* </View> */}
// //       <View style={{flex: 1, justifyContent: 'center', }}>
// //         <Text style={{fontWeight: '500', fontSize: 18, }}>{'Day'+ item.id}</Text>
// //         {/* <Text style={{fontSize: 18, wordWrap: 'wrap'}}>{item.activities[0].description}</Text> */}
// //       </View>
// //     </Pressable>
// //   );
  

// //   const renderActivity = ({ item }: { item: Activities, }) => (
// //     <Pressable style={[styles.itemContainer, ]} >
// //       {/* <View style={{width: 50, height: 50}}> */}
// //         <Image
// //           source={{ uri: item?.thumbnail_url}}
// //           style={{width: 50, height: 50, borderRadius: 12}}
// //           contentFit="cover"
// //           cachePolicy="memory-disk"
// //         />
// //       {/* </View> */}
// //       <View style={{flex: 1, justifyContent: 'center', }}>
// //         {/* <Text style={{fontWeight: '500', fontSize: 18, }}>{'Day'+ item.id}</Text> */}
// //         <Text style={{fontSize: 18, wordWrap: 'wrap'}}>{item.description}</Text>
// //       </View>
// //     </Pressable>
// //   );
// //   const handleNavigation = (dir: 'next' | 'prev') => {
// //     // console.log(itinerary)
// //     // setField('itenerary', itinerary);
// //     // router.push(dir === 'next' ? '/images/images': '/(host)/(tabs)/listing/experiences/upload_media');
// //     router.push(dir === 'next' ? '/(host)/(tabs)/listing/experiences/logistics' : '/(host)/(tabs)/listing/experiences/upload_media');
// //   };

// //   return (
// //     <GestureHandlerRootView >
// //     <ThemedView plain secondary style={styles.container}>

// //       <FlatList
// //         data={eventDays}
// //         renderItem={renderItem}
// //         keyExtractor={(item, index) => index.toString()}
// //         style={styles.list}
// //         contentContainerStyle={{gap: 10, flex:1}}
// //         ListHeaderComponent={() => (
// //             <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10}}>
// //                 <TouchableOpacity style={styles.row} onPress={() => setRecurring(!recurring)}>
// //                 <View style={[styles.checkbox, recurring ? { backgroundColor: theme.colors.primary } : {borderColor: theme.colors.text}]} />
// //                 <ThemedText style={styles.label}>Recurring Event</ThemedText>
// //                 </TouchableOpacity>
// //                 <TouchableOpacity style={styles.row} onPress={() => setMultiday(!multiday)}>
// //                 <View style={[styles.checkbox, multiday ? { backgroundColor: theme.colors.primary } : {borderColor: theme.colors.text}]} />
// //                 <ThemedText style={styles.label}>Multi-Day Event</ThemedText>
// //                 </TouchableOpacity>
// //             </View>
// //         )}
// //       />

// //       <Modal visible={addModalVisible} animationType="slide" >
        
// //         <ScrollView style={{backgroundColor: theme.colors.backgroundSec, paddingTop: 60, paddingHorizontal: 12}}>
// //             {renderCurrentStep()}
            
// //         </ScrollView>
// //       </Modal> 

// //       {/* {true && ( */}
// //       {itinerary.length > 0 && (
// //         <TouchableOpacity
// //           style={[ { marginBottom: 60, paddingLeft: 20, }]}
// //           onPress={() => setModalVisible(true)}
// //         >
// //           <ThemedText type='link' style={styles.buttonText}>Reorder</ThemedText>
// //         </TouchableOpacity>
// //       )}

// //       {multiday || eventDays.length == 0 ? <TouchableOpacity
// //         style={[styles.fab, { backgroundColor: theme.colors.primary }]}
// //         onPress={() => setAddModalVisible(true)}
// //       >
// //         <MaterialCommunityIcons name="plus" size={24} color="#fff" />
// //       </TouchableOpacity>:null}

// //       <PreviousNextUI
// //         style={styles.navigation}
// //         prevFunc={() => handleNavigation('prev')}
// //         nextFunc={() => handleNavigation('next')}
// //       />
// //     </ThemedView>
// //     </GestureHandlerRootView>

// //   );
// // };

// // const styles = StyleSheet.create({
// //   checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, marginRight: 8 },
// //   label: { fontSize: 16, fontWeight: '500', fontFamily: 'Roboto' },  
// //   row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
// //   input: { borderWidth: 0, borderRadius: 8, padding: 12, },
  


// //   container: { flex: 1, paddingVertical: 0 },
// //   header: { marginBottom: 12, paddingHorizontal: 22 },
// //   tipButton: { alignItems: 'flex-end', marginRight: 10 },
// //   list: { paddingHorizontal: 10, paddingTop: 0 },
// //   imageGrid: { paddingRight: 30, paddingLeft: 10 },
// //   itemContainer: { padding: 10, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.1)', flexDirection: 'row', gap: 10, alignItems: 'center' },
// //   // image: { height: 50, width: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 0, marginLeft: 20  },
// //   fab: {
// //     position: 'absolute',
// //     bottom: 100,
// //     right: 22,
// //     width: 56,
// //     height: 56,
// //     borderRadius: 28,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   imageContainer: { width: '50%', height: 150, borderRadius: 8, overflow: 'hidden', padding:  2, marginBottom: 10},
// //   removeButton: {
// //     position: 'absolute',
// //     right: 0,
// //     top: 0,
// //     zIndex: 2,
// //     padding: 4,
// //     backgroundColor: 'rgba(0,0,0,0.5)',
// //     borderRadius: 8,
// //   },
// //   actionButton: { padding: 10, borderRadius: 8, alignItems: 'center', },
// //   buttonText: { fontWeight: '900', fontSize: 18 },
// //   modalContainer: { flex: 1, paddingVertical: 11, height: height-90, justifyContent: 'space-between'},
// //   modalHeader: { marginBottom: 12, paddingHorizontal: 22 },
// //   // input: { height: 40, borderRadius: 8, paddingHorizontal: 12, marginHorizontal: 22, marginBottom: 12 },
// //   draggableItem: { padding: 12, marginBottom: 12, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 8 },
// //   navigation: { position: 'absolute', bottom: 0, width, zIndex: 1 },
// // });

// // export default Exe;