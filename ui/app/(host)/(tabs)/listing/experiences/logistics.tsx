import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import { Line } from '@/components/ui/Line';
import PreviousNextUI from '@/components/ui/PreviousNextUI';
import { useExperienceStore } from '@/stores/experienceStore';
import { useTheme } from '@/theme/theme';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('screen');

const options = [
  { tag: 'ppp', title: 'Price Per Person', placeholder: '$100' },
  { tag: 'gsm', title: 'Group Size Max', placeholder: 'e.g., 20' },
  // { tag: 'durt', title: 'Duration', placeholder: 'e.g., 2 hours' },
];

type ModalTag = 'avdt' | 'ppp' | 'gsm' | 'durt' | null;

interface EventDay {
  id: number
  startDate: Date
  endDate: Date
  startTime?: Date,
  endTime?: Date,
}

const LogisticsScreen = () => {
  const { theme } = useTheme();
  const { setField, availability, price, groupSizeMin, groupSizeMax, duration } = useExperienceStore();

  // Local states
  const [localPrice, setLocalPrice] = useState(price || '');
  const [localDuration, setLocalDuration] = useState(duration || '');
  const [recurring, setRecurring] = useState(false);
  const [multiday, setMultiday] = useState(false);

  // Availability states
  const [singleDate, setSingleDate] = useState<Date | null>(availability as Date);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);
  const [pickerMode, setPickerMode] = useState<'startDate' | 'endDate' | 'singleDate' | 'startTime' | 'endTime' | null>(null);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [focused, setFocused] = useState('')
  const [frequency, setFrequency] = useState<'week' | 'month'>('week');
  const [eventDays, setEventDays] = useState<EventDay[]>([
    {
      id: 1,
      startDate: new Date(),
      endDate: new Date(),
    }
  ])

  // Group size & discount
  const [dailyMax, setDailyMax] = useState<string>(String(groupSizeMax || ''));
  const [discountCount, setDiscountCount] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<string>('');

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTag, setModalTag] = useState<string | null>(null);
  const currentOption = useMemo(() => options.find(o => o.tag === modalTag), [modalTag]);

  const handleNav = useCallback((dir: 'next' | 'prev') => {
    setField('price', localPrice);
    setField('duration', localDuration);
    // availability saved separately
    router.push(dir === 'next'
      ? '/(host)/(tabs)/listing/experiences/extras'
      : '/(host)/(tabs)/listing/experiences/availability'
    );
  }, [localPrice, localDuration]);

  const onChangeDate = (event: any, date?: Date) => {
    setShowPicker(null);
    let index = parseInt(focused.slice(-1))
    // if (pickerMode === 'singleDate' && date) {
    //   setSingleDate(date)
    //   console.log('doisjs', date)
    // };

    if (pickerMode === 'singleDate' && date) {
      setEventDays((prev) => {
        return prev.map((day) => {
          if (index == day.id ) {return {...day, startDate: date}}
          return day
        })
      })
    }

    if (pickerMode === 'startTime' && date) {
      setEventDays((prev) => {
        return prev.map((day) => {
          if (index == day.id ) {return {...day, startTime: date}}
          return day
        })
      })
    }

    if (pickerMode === 'endTime' && date) {
      setEventDays((prev) => {
        return prev.map((day) => {
          if (index == day.id ) {return {...day, endTime: date}}
          return day
        })
      })
    }
  };
  
  const handelAddEventDay = () => {
    setEventDays((prev) => [
      ...prev,
      { startDate: new Date(), endDate: new Date(),id: eventDays[eventDays.length -1].id + 1 },
    ]);
  };

  const handleDeleteEventDay = (index: number) => {
    setEventDays((prev) => prev.filter((day) => day.id !== index));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getValue = (tag: string) => {
    switch (tag) {
      case 'ppp':
        return localPrice;
      case 'gsm':
        return '';
      case 'durt':
        return localDuration;
      default:
        return null;
    }
  };

  const RenderDayTimePair = ({day}: {day: EventDay}) => {
    return (
      <View style={{borderWidth: 1, borderRadius:9, borderColor: theme.colors.text}}>
                        <View style={[focused == `d-${day.id}` ? styles.focusedInput: styles.input, styles.eventContainer, {borderColor: theme.colors.text}]}>
                          <Pressable style={[ 
                            {flex:1,padding:12}]} 
                            onPress={() => {
                            // console.log('disoi')
                              setFocused(`d-${day.id}`)
                              setPickerMode('singleDate'); setShowPicker('date'); 
                            }}>
                              <ThemedText>{day.startDate ? day.startDate?.toDateString() : 'Select Date'}</ThemedText>
                              {/* <ThemedText>{singleDate ? singleDate?.toDateString() : 'Select Date'}</ThemedText> */}
                          </Pressable>

                          {day.id > 1 && <Pressable onPress={() => handleDeleteEventDay(day.id)} style={{justifyContent: 'center', alignItems: 'center', }}>
                            <MaterialCommunityIcons name='trash-can-outline' size={34} color={theme.colors.text} />
                          </Pressable>}
                        </View>
                        {focused !== `d-${day.id}` && focused !== `t-${day.id}` && <Line style={{borderWidth: 0.5, borderColor: theme.colors.text}} />}
                        <View style={[focused == `t-${day.id}` ? styles.focusedInput: styles.input, styles.eventContainer, {borderColor: theme.colors.text}  ]}>
                          <Pressable style={[ focused == `t-${day.id}` && pickerMode == 'startTime' && {borderRightWidth: 1.5, borderColor: theme.colors.text}, {width: '50%',}, styles.input]}
                          // <Pressable style={[ focused == `t-${day.id}` && pickerMode == 'startTime' ? styles.focusedInput: styles.input, {width: '50%'}]}
                            onPress={() => { 
                              setFocused(`t-${day.id}`)
                              setPickerMode('startTime'); setShowPicker('time'); 
                            }}>
                            <ThemedText> {day.startTime ? formatTime(day.startTime): ''} </ThemedText>
                          </Pressable>
                          <Pressable style={[ focused == `t-${day.id}` && pickerMode == 'endTime' && {borderLeftWidth: 1.5, borderColor: theme.colors.text }, styles.input, {width: '50%'}]}
                            onPress={() => { 
                              setFocused(`t-${day.id}`)
                              setPickerMode('endTime'); setShowPicker('time'); 
                            }}>
                            <ThemedText>{day.endTime && formatTime(day.endTime)}</ThemedText>
                          </Pressable>
                        </View>
                      </View>
    )
  }

  return (
    <ThemedView plain secondary style={styles.container}>
      <TouchableOpacity style={styles.tipButton}>
        <MaterialCommunityIcons name="information-variant" size={20} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={styles.listContainer}>
        {options.map((item) => (
          <Card key={item.tag} style={[styles.card, {backgroundColor: theme.colors.backgroundSec}]} onPress={() => { setModalTag(item.tag); setIsModalOpen(true); }}>
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons name="plus" size={40} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
              <ThemedText secondary style={styles.cardPlaceholder}>
                {/* { // display selected vs placeholder
                  modalTag === item.tag
                    ? currentOption?.placeholder
                    : item.placeholder
                } */}
                {getValue(item.tag) || item.placeholder}
              </ThemedText>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.text} />
          </Card>
        ))}
      </View>

      <Modal visible={isModalOpen} animationType="slide">
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.backgroundSec }]}>  
          <Pressable style={styles.closeButton} onPress={() => setIsModalOpen(false)}>
            <Entypo name="cross" color={theme.colors.text} size={24} />
          </Pressable>
          {/* <ScrollView contentContainerStyle={styles.modalContent}> */}
            <ThemedText style={styles.modalTitle}>{currentOption?.title}</ThemedText>

            {modalTag === 'avdt' && (
              <View >
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
                  <TouchableOpacity style={styles.row} onPress={() => setRecurring(!recurring)}>
                    <View style={[styles.checkbox, recurring ? { backgroundColor: theme.colors.primary } : {borderColor: theme.colors.text}]} />
                    <ThemedText style={styles.label}>Recurring Event</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.row} onPress={() => setMultiday(!multiday)}>
                    <View style={[styles.checkbox, multiday ? { backgroundColor: theme.colors.primary } : {borderColor: theme.colors.text}]} />
                    <ThemedText style={styles.label}>Multi-Day Event</ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Date Pickers */}
                {!recurring ? (
                  <View style={{gap:20}}>
                    {eventDays.map((day) => (
                      // <View key={day.id} style={{borderWidth: 1, borderRadius:9}}>
                      //   <View style={[focused == `d-${day.id}` ? styles.focusedInput: styles.input, styles.eventContainer ]}>
                      //     <Pressable style={[ 
                      //       {flex:1,padding:12}]} 
                      //       onPress={() => {
                      //       // console.log('disoi')
                      //         setFocused(`d-${day.id}`)
                      //         setPickerMode('singleDate'); setShowPicker('date'); 
                      //       }}>
                      //         <ThemedText>{day.startDate ? day.startDate?.toDateString() : 'Select Date'}</ThemedText>
                      //         {/* <ThemedText>{singleDate ? singleDate?.toDateString() : 'Select Date'}</ThemedText> */}
                      //     </Pressable>

                      //     {day.id > 1 && <Pressable onPress={() => handleDeleteEventDay(day.id)} style={{justifyContent: 'center', alignItems: 'center', }}>
                      //       <MaterialCommunityIcons name='trash-can-outline' size={34} color={theme.colors.text} />
                      //     </Pressable>}
                      //   </View>
                      //   {focused !== `d-${day.id}` && focused !== `t-${day.id}` && <Line style={{borderWidth: 0.5, borderColor: theme.colors.text}} />}
                      //   <View style={[focused == `t-${day.id}` ? styles.focusedInput: styles.input, styles.eventContainer,  ]}>
                      //     <Pressable style={[ focused == `t-${day.id}` && pickerMode == 'startTime' && {borderRightWidth: 3}, {width: '50%',}, styles.input]}
                      //     // <Pressable style={[ focused == `t-${day.id}` && pickerMode == 'startTime' ? styles.focusedInput: styles.input, {width: '50%'}]}
                      //       onPress={() => { 
                      //         setFocused(`t-${day.id}`)
                      //         setPickerMode('startTime'); setShowPicker('time'); 
                      //       }}>
                      //       <ThemedText> {day.startTime ? formatTime(day.startTime): ''} </ThemedText>
                      //     </Pressable>
                      //     <Pressable style={[ focused == `t-${day.id}` && pickerMode == 'endTime' && {borderLeftWidth: 3}, styles.input, {width: '50%'}]}
                      //       onPress={() => { 
                      //         setFocused(`t-${day.id}`)
                      //         setPickerMode('endTime'); setShowPicker('time'); 
                      //       }}>
                      //       <ThemedText>{day.endTime && formatTime(day.endTime)}</ThemedText>
                      //     </Pressable>
                      //   </View>
                      // </View>

                      <React.Fragment key={day.id}><RenderDayTimePair day={day} /></React.Fragment>
                    ))}
                  </View>
                ) : (
                  <View style={{gap:20}}>
                    <View style={styles.rowBetween}>
                      <ThemedText>Freq:</ThemedText>
                      <TouchableOpacity onPress={() => setFrequency('week')}><Text style={frequency === 'week' ? styles.selected : undefined}>Weekly</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => setFrequency('month')}><Text style={frequency === 'month' ? styles.selected : undefined}>Monthly</Text></TouchableOpacity>
                    </View>
                    {/* <Pressable style={styles.input} onPress={() => { setPickerMode('startDate'); setShowPicker('date'); }}>
                      <Text>Start: {startDate.toDateString()}</Text>
                    </Pressable>
                    <Pressable style={styles.input} onPress={() => { setPickerMode('startTime'); setShowPicker('time'); }}>
                      <Text>Time: {startTime.toLocaleTimeString()}</Text>
                    </Pressable> */}
                    {eventDays.map((day) => (
                      <React.Fragment key={day.id}><RenderDayTimePair day={day} /></React.Fragment>
                    ))}
                  </View>
                )}

                {multiday && (
                  <Pressable style={styles.closeButton} onPress={handelAddEventDay}>
                    <Entypo name="plus" color={theme.colors.text} size={30} style={{padding: 10, backgroundColor: theme.colors.primary, borderRadius: 15}} />
                  </Pressable>
                )}
              </View>
            )}

            {modalTag === 'gsm' && (
              <View>
                <Text style={styles.label}>Max Participants per Day</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={dailyMax}
                  onChangeText={setDailyMax}
                  placeholder="e.g., 20"
                />
                <Text style={[styles.label, { marginTop: 16 }]}>Discount</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={discountCount}
                  onChangeText={setDiscountCount}
                  placeholder="Group Size for Discount"
                />
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={discountPercent}
                  onChangeText={setDiscountPercent}
                  placeholder="Discount %"
                />
              </View>
            )}

            {modalTag === 'ppp' && (
              // <TextInput
              //   style={styles.textInput}
              //   keyboardType="numeric"
              //   value={localPrice}
              //   onChangeText={setLocalPrice}
              //   placeholder="$100"
              // />
              <View style={[styles.row, {gap: 0, paddingLeft: 10}]}>
                <ThemedText type='subtitle'>
                  USD
                </ThemedText>
                <InputField 
                  inputStyle={[styles.input, {fontSize: 20, fontWeight: 'bold', paddingLeft:5}]}
                  keyboardType='numeric'
                  value={localPrice}
                  handleChangeText={setLocalPrice}
                  placeholder='$100'
                  title='ppp'
                  hideTitle
                />
              </View>
            )}

            {modalTag === 'durt' && (
              <TextInput
                style={styles.textInput}
                value={localDuration}
                onChangeText={setLocalDuration}
                placeholder="e.g., 2 hours"
              />
            )}

            {/* DateTime Picker */}
            {showPicker && modalTag == 'avdt'  && (
              <DateTimePicker
                value={new Date()}
                mode={showPicker}
                display="default"
                onChange={onChangeDate}
                is24Hour={false}
                style={{marginVertical: 10, }}
              />
            )}

            {/* <View style={{width: 100, height: 100, backgroundColor: 'red'}}></View> */}
          {/* </ScrollView> */}
        </View>
      </Modal>

      <PreviousNextUI style={styles.navigation} prevFunc={() => handleNav('prev')} nextFunc={() => handleNav('next')} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  tipButton: { alignItems: 'flex-end',  },
  listContainer: { flex: 1, justifyContent: 'flex-end', gap: 12, paddingBottom: 100 },
  card: { padding: 12, flexDirection: 'row', alignItems: 'center', borderRadius: 12, elevation: 2 },
  cardIcon: { marginRight: 12 },
  selected: {fontWeight: '800'},
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardPlaceholder: { fontSize: 14, color: '#888' },
  navigation: { position: 'absolute', bottom: 0, width, zIndex: 5 },
  modalContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 40 },
  closeButton: { alignItems: 'flex-end', marginVertical: 12 },
  modalContent: { paddingBottom: 50 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, marginRight: 8 },
  label: { fontSize: 16, fontWeight: '500', fontFamily: 'Roboto' },
  input: { borderWidth: 0, borderRadius: 8, padding: 12, },
  input1: { borderWidth: 0, borderRadius: 8, padding: 12, },
  focusedInput: { borderWidth: 1.5, borderRadius: 8, padding: 12, },
  eventContainer: {flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'center', padding:0,},
  textInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, marginTop: 8 },
});

export default LogisticsScreen;



// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import Card from '@/components/ui/Card';
// import { Line } from '@/components/ui/Line';
// import PreviousNextUI from '@/components/ui/PreviousNextUI';
// import { useExperienceStore } from '@/store/experienceStore';
// import { useTheme } from '@/theme/theme';
// import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { router } from 'expo-router';
// import React, { useCallback, useMemo, useState } from 'react';
// import {
//   Dimensions,
//   Modal,
//   Pressable,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';

// const { width, height } = Dimensions.get('screen');

// const options = [
//   { tag: 'avdt', title: 'Availability Date', placeholder: 'Select dates...' },
//   { tag: 'ppp', title: 'Price Per Person', placeholder: '$100' },
//   { tag: 'gsm', title: 'Group Size Max', placeholder: 'e.g., 20' },
//   { tag: 'durt', title: 'Duration', placeholder: 'e.g., 2 hours' },
// ];

// type ModalTag = 'avdt' | 'ppp' | 'gsm' | 'durt' | null;

// interface EventDay {
//   id: number
//   startDate: Date
//   endDate: Date
//   startTime?: Date,
//   endTime?: Date,
// }

// const LogisticsScreen = () => {
//   const { theme } = useTheme();
//   const { setField, availability, price, groupSizeMin, groupSizeMax, duration } = useExperienceStore();

//   // Local states
//   const [localPrice, setLocalPrice] = useState(price || '');
//   const [localDuration, setLocalDuration] = useState(duration || '');
//   const [recurring, setRecurring] = useState(false);
//   const [multiday, setMultiday] = useState(false);

//   // Availability states
//   const [singleDate, setSingleDate] = useState<Date | null>(availability as Date);
//   const [startDate, setStartDate] = useState<Date>(new Date());
//   const [endDate, setEndDate] = useState<Date>(new Date());
//   const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);
//   const [pickerMode, setPickerMode] = useState<'startDate' | 'endDate' | 'singleDate' | 'startTime' | 'endTime' | null>(null);
//   const [startTime, setStartTime] = useState<Date>(new Date());
//   const [endTime, setEndTime] = useState<Date>(new Date());
//   const [focused, setFocused] = useState('')
//   const [frequency, setFrequency] = useState<'week' | 'month'>('week');
//   const [eventDays, setEventDays] = useState<EventDay[]>([
//     {
//       id: 1,
//       startDate: new Date(),
//       endDate: new Date(),
//     }
//   ])

//   // Group size & discount
//   const [dailyMax, setDailyMax] = useState<string>(String(groupSizeMax || ''));
//   const [discountCount, setDiscountCount] = useState<string>('');
//   const [discountPercent, setDiscountPercent] = useState<string>('');

//   // Modal controls
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalTag, setModalTag] = useState<string | null>(null);

//   // console.log(pickerMode, showPicker, modalTag)
//   // console.log(focused)

//   // Memoized title
//   const currentOption = useMemo(() => options.find(o => o.tag === modalTag), [modalTag]);

//   const handleNav = useCallback((dir: 'next' | 'prev') => {
//     setField('price', localPrice);
//     setField('duration', localDuration);
//     // availability saved separately
//     router.push(dir === 'next'
//       ? '/(host)/(tabs)/listing/experiences/extras'
//       : '/(host)/(tabs)/listing/experiences/itinerary'
//     );
//   }, [localPrice, localDuration]);

//   const onChangeDate = (event: any, date?: Date) => {
//     setShowPicker(null);
//     if (pickerMode === 'singleDate' && date) setSingleDate(date);
//     if (pickerMode === 'startDate' && date) setStartDate(date);
//     if (pickerMode === 'endDate' && date) setEndDate(date);
//     if (pickerMode === 'startTime' && date) setStartTime(date);
//     if (pickerMode === 'endTime' && date) setEndTime(date);
//   };

//   const handelAddEventDay = () => {
//     setEventDays((prev) => [
//       ...prev,
//       { startDate: new Date(), endDate: new Date(),id: eventDays[eventDays.length -1].id + 1 },
//     ]);
//   };

//   const handleDeleteEventDay = (index: number) => {
//     setEventDays((prev) => prev.filter((day) => day.id !== index));
//   };

//   const getValue = (tag: string) => {
//     switch (tag) {
//       case 'advt':
//         return '';
//       case 'ppp':
//         return localPrice;
//       case 'gsm':
//         return '';
//       case 'durt':
//         return localDuration;
//       default:
//         return null;
//     }
//   };

//   const renderDayTimePair = (day: EventDay) => {
//     return (
//       <React.Fragment key={day.id}>
//         <View style={{flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'center'}}>
//           <Pressable style={[styles.input, {flex:1}]} onPress={() => { console.log('ssos'); setPickerMode('singleDate'); setShowPicker('date'); }}>
//             <Text>{singleDate ? singleDate?.toDateString() : 'Select Date'}</Text>
//           </Pressable>
//           {day.id > 1 && <Pressable onPress={() => handleDeleteEventDay(day.id)} style={{justifyContent: 'center', alignItems: 'center', }}>
//             <MaterialCommunityIcons name='trash-can-outline' size={34} color={theme.colors.text} />
//           </Pressable>}
//         </View>
//         <Pressable style={styles.input} onPress={() => { setPickerMode('startTime'); setShowPicker('time'); }}>
//           <Text>{startTime.toLocaleTimeString()}</Text>
//         </Pressable>
//       </React.Fragment>
//     )
//   }

//   return (
//     <ThemedView plain secondary style={styles.container}>
//       <TouchableOpacity style={styles.tipButton}>
//         <MaterialCommunityIcons name="information-variant" size={20} color={theme.colors.text} />
//       </TouchableOpacity>

//       <View style={styles.listContainer}>
//         {options.map((item) => (
//           <Card key={item.tag} style={styles.card} onPress={() => { setModalTag(item.tag); setIsModalOpen(true); }}>
//             <View style={styles.cardIcon}>
//               <MaterialCommunityIcons name="plus" size={40} color={theme.colors.textSecondary} />
//             </View>
//             <View style={styles.cardContent}>
//               <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
//               <ThemedText secondary style={styles.cardPlaceholder}>
//                 {/* { // display selected vs placeholder
//                   modalTag === item.tag
//                     ? currentOption?.placeholder
//                     : item.placeholder
//                 } */}
//                 {getValue(item.tag) || item.placeholder}
//               </ThemedText>
//             </View>
//             <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.text} />
//           </Card>
//         ))}
//       </View>

//       <Modal visible={isModalOpen} animationType="slide">
//         <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>  
//           <Pressable style={styles.closeButton} onPress={() => setIsModalOpen(false)}>
//             <Entypo name="cross" color={theme.colors.text} size={24} />
//           </Pressable>
//           {/* <ScrollView contentContainerStyle={styles.modalContent}> */}
//             <ThemedText style={styles.modalTitle}>{currentOption?.title}</ThemedText>

//             {modalTag === 'avdt' && (
//               <View >
//                 <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
//                   <TouchableOpacity style={styles.row} onPress={() => setRecurring(!recurring)}>
//                     <View style={[styles.checkbox, recurring && { backgroundColor: theme.colors.primary }]} />
//                     <Text style={styles.label}>Recurring Event</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={styles.row} onPress={() => setMultiday(!multiday)}>
//                     <View style={[styles.checkbox, multiday && { backgroundColor: theme.colors.primary }]} />
//                     <Text style={styles.label}>Multi-Day Event</Text>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Date Pickers */}
//                 {!recurring ? (
//                   <View style={{gap:19}}>
//                     {eventDays.map((day) => (
//                       <View key={day.id} style={{borderWidth: 1, borderRadius:9}}>
//                         <View style={[focused == `d-${day.id}` ? styles.focusedInput: styles.input, styles.eventContainer ]}>
//                           <Pressable style={[ 
//                             {flex:1,padding:12}]} 
//                             onPress={() => {
//                             // console.log('disoi')
//                               setFocused(`d-${day.id}`)
//                               setPickerMode('singleDate'); setShowPicker('date'); 
//                             }}>
//                               <Text>{singleDate ? singleDate?.toDateString() : 'Select Date'}</Text>
//                           </Pressable>

//                           {day.id > 1 && <Pressable onPress={() => handleDeleteEventDay(day.id)} style={{justifyContent: 'center', alignItems: 'center', }}>
//                             <MaterialCommunityIcons name='trash-can-outline' size={34} color={theme.colors.text} />
//                           </Pressable>}
//                         </View>
//                         {focused !== `d-${day.id}` && focused !== `t-${day.id}` && <Line style={{borderWidth: 1, borderColor: theme.colors.text}} />}
//                         <View style={[focused == `t-${day.id}` ? styles.focusedInput: styles.input, styles.eventContainer,  ]}>
//                           <Pressable style={[ focused == `t-${day.id}` && pickerMode == 'startTime' ? styles.focusedInput: styles.input, {width: '50%'}]}
//                           // <Pressable style={[ focused == `t-${day.id}` && pickerMode == 'startTime' ? styles.focusedInput: styles.input, {width: '50%'}]}
//                             onPress={() => { 
//                               setFocused(`t-${day.id}`)
//                               setPickerMode('startTime'); setShowPicker('time'); 
//                             }}>
//                             <Text>{startTime.toLocaleTimeString()}</Text>
//                           </Pressable>
//                           <Pressable style={[ focused == `t-${day.id}` && pickerMode == 'endTime' ? styles.focusedInput: styles.input, {width: '50%'}]}
//                             onPress={() => { 
//                               setFocused(`t-${day.id}`)
//                               setPickerMode('endTime'); setShowPicker('time'); 
//                             }}>
//                             <Text>{endTime.toLocaleTimeString()}</Text>
//                           </Pressable>
//                         </View>
//                       </View>
//                     ))}
//                   </View>
//                 ) : (
//                   <>
//                     <View style={styles.rowBetween}>
//                       <Text>Freq:</Text>
//                       <TouchableOpacity onPress={() => setFrequency('week')}><Text style={frequency === 'week' ? styles.selected : undefined}>Weekly</Text></TouchableOpacity>
//                       <TouchableOpacity onPress={() => setFrequency('month')}><Text style={frequency === 'month' ? styles.selected : undefined}>Monthly</Text></TouchableOpacity>
//                     </View>
//                     <Pressable style={styles.input} onPress={() => { setPickerMode('startDate'); setShowPicker('date'); }}>
//                       <Text>Start: {startDate.toDateString()}</Text>
//                     </Pressable>
//                     <Pressable style={styles.input} onPress={() => { setPickerMode('startTime'); setShowPicker('time'); }}>
//                       <Text>Time: {startTime.toLocaleTimeString()}</Text>
//                     </Pressable>
//                   </>
//                 )}

//                 {multiday && (
//                   <Pressable style={styles.closeButton} onPress={handelAddEventDay}>
//                     <Entypo name="plus" color={theme.colors.text} size={30} style={{padding: 10, backgroundColor: theme.colors.primary, borderRadius: 15}} />
//                   </Pressable>
//                 )}
//               </View>
//             )}

//             {modalTag === 'gsm' && (
//               <View>
//                 <Text style={styles.label}>Max Participants per Day</Text>
//                 <TextInput
//                   style={styles.textInput}
//                   keyboardType="numeric"
//                   value={dailyMax}
//                   onChangeText={setDailyMax}
//                   placeholder="e.g., 20"
//                 />
//                 <Text style={[styles.label, { marginTop: 16 }]}>Discount</Text>
//                 <TextInput
//                   style={styles.textInput}
//                   keyboardType="numeric"
//                   value={discountCount}
//                   onChangeText={setDiscountCount}
//                   placeholder="Group Size for Discount"
//                 />
//                 <TextInput
//                   style={styles.textInput}
//                   keyboardType="numeric"
//                   value={discountPercent}
//                   onChangeText={setDiscountPercent}
//                   placeholder="Discount %"
//                 />
//               </View>
//             )}

//             {modalTag === 'ppp' && (
//               <TextInput
//                 style={styles.textInput}
//                 keyboardType="numeric"
//                 value={localPrice}
//                 onChangeText={setLocalPrice}
//                 placeholder="$100"
//               />
//             )}

//             {modalTag === 'durt' && (
//               <TextInput
//                 style={styles.textInput}
//                 value={localDuration}
//                 onChangeText={setLocalDuration}
//                 placeholder="e.g., 2 hours"
//               />
//             )}

//             {/* DateTime Picker */}
//             {showPicker && modalTag == 'avdt'  && (
//               <DateTimePicker
//                 value={new Date()}
//                 mode={showPicker}
//                 display="default"
//                 onChange={onChangeDate}
//                 is24Hour={false}
//               />
//             )}
//           {/* </ScrollView> */}
//         </View>
//       </Modal>

//       <PreviousNextUI style={styles.navigation} prevFunc={() => handleNav('prev')} nextFunc={() => handleNav('next')} />
//     </ThemedView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16 },
//   tipButton: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
//   listContainer: { flex: 1, justifyContent: 'flex-end', gap: 12, paddingBottom: 100 },
//   card: { padding: 12, flexDirection: 'row', alignItems: 'center', borderRadius: 12, backgroundColor: '#fff', elevation: 2 },
//   cardIcon: { marginRight: 12 },
//   selected: {fontWeight: '800'},
//   cardContent: { flex: 1 },
//   cardTitle: { fontSize: 16, fontWeight: '600' },
//   cardPlaceholder: { fontSize: 14, color: '#888' },
//   navigation: { position: 'absolute', bottom: 0, width, zIndex: 5 },
//   modalContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 40 },
//   closeButton: { alignItems: 'flex-end', marginVertical: 12 },
//   modalContent: { paddingBottom: 50 },
//   modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
//   row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
//   rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
//   checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, marginRight: 8 },
//   label: { fontSize: 16, fontWeight: '500' },
//   input: { borderWidth: 0, borderRadius: 8, padding: 12, marginBottom: 0 },
//   focusedInput: { borderWidth: 3, borderRadius: 8, padding: 12, marginBottom: 0 },
//   eventContainer: {flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'center', padding:0,},
//   textInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, marginTop: 8 },
// });

// export default LogisticsScreen;

