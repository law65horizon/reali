import { ThemedText } from '@/components/ThemedText';
import CustomDurationRange from '@/components/ui/Exe';
import { Line } from '@/components/ui/Line';
import CustomPriceRangeSlider from '@/components/ui/PriceRange';
import { useEventFilterStore } from '@/store/filterStore';
import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { Dimensions, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-elements';

const EventAmenities = [
  {
    name: 'popular',
    items: [
      { tag: 'Food & Drinks', icon: 'restaurant' as const },
      { tag: 'Parking', icon: 'car' as const },
      { tag: 'Wheelchair Access', icon: 'accessibility' as const },
      { tag: 'Outdoor Seating', icon: 'leaf' as const },
    ],
  },
  {
    name: 'extras',
    items: [
      { tag: 'Live Music', icon: 'musical-notes' as const },
      { tag: 'VIP Section', icon: 'star' as const },
      { tag: 'Restrooms', icon: 'water' as const },
    ],
  },
];

const { width } = Dimensions.get('screen');

const EventsFiltersScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const {
    priceRange,
    eventTypes,
    duration,
    amenities,
    setPriceRange,
    setEventTypes,
    setDuration,
    setAmenities,
    resetFilters,
  } = useEventFilterStore();

  const handleEventTypeSelect = useCallback((type: string) => {
    const updatedTypes = eventTypes.includes(type)
      ? eventTypes.filter((t) => t !== type)
      : [...eventTypes, type];
    setEventTypes(updatedTypes);
  }, [eventTypes, setEventTypes]);

  const handleAmenitySelect = useCallback((tag: string) => {
    const updatedAmenities = amenities.includes(tag)
      ? amenities.filter((a) => a !== tag)
      : [...amenities, tag];
    setAmenities(updatedAmenities);
  }, [amenities, setAmenities]);

  const handleApply = useCallback(() => {
    // setDuration(durationRange);
    navigation.goBack();
  }, [setDuration, navigation]);

  const handleClearAll = useCallback(() => {
    // setDurationRange(null);
    resetFilters();
  }, [resetFilters]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderColor: theme.colors.border}]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ position: 'absolute', bottom: 4, alignItems: 'center', justifyContent: 'center', width }}>
          <ThemedText type='subtitle'>Event Filters</ThemedText>
        </View>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={{paddingBottom: 16}}>
        {/* Price Range */}
        <View style={styles.section}>
          {/* <ThemedText style={styles.sectionTitle}>Ticket Price</ThemedText> */}
          <CustomPriceRangeSlider min={0} max={500} values={priceRange} onChange={(value) => setPriceRange(value)} />
        </View>

        <Line style={{borderBottomWidth: 1, borderColor: theme.colors.border}} />

        {/* Event Types */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Event Type</ThemedText>
          <View style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 10 }}>
            {['Concert', 'Workshop', 'Festival', 'Conference'].map((type) => (
              <Pressable
                key={type}
                style={{
                  backgroundColor: eventTypes.includes(type) ? theme.colors.accent : theme.colors.backgroundSec,
                  borderRadius: 30,
                  padding: 10,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  flexDirection: 'row',
                  gap: 3,
                  alignItems: 'center',
                }}
                onPress={() => handleEventTypeSelect(type)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={eventTypes.includes(type) ? theme.colors.background : theme.colors.text}
                />
                <ThemedText style={{ color: eventTypes.includes(type) ? theme.colors.background : theme.colors.text }}>
                  {type}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <Line style={{borderBottomWidth: 1, borderColor: theme.colors.border}} />


        {/* Event Duration */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Duration </ThemedText>
          <CustomDurationRange step={30} min={30} max={240} values={duration} onChange={(value) => setDuration(value)} />
        </View>

        <Line style={{borderBottomWidth: 1, borderColor: theme.colors.border}} />


        {/* Amenities */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Amenities</ThemedText>
          {EventAmenities.map((section, index) => (
            <View key={index} style={{ paddingVertical: 15 }}>
              <Text style={[styles.sectionTitle, { textTransform: 'capitalize', color: theme.colors.text, paddingBottom: 5 }]}>
                {section.name.trim()}
              </Text>
              <View style={{ flexWrap: 'wrap', flexDirection: 'row', rowGap: 10, columnGap: 7 }}>
                {section.items.map((item) => (
                  <Pressable
                    key={item.tag}
                    style={{
                      backgroundColor: amenities.includes(item.tag) ? theme.colors.accent : theme.colors.backgroundSec,
                      borderRadius: 20,
                      padding: 10,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      flexDirection: 'row',
                      gap: 3,
                      alignItems: 'center',
                    }}
                    onPress={() => handleAmenitySelect(item.tag)}
                  >
                    <Ionicons
                      name={item.icon}
                      size={24}
                      color={amenities.includes(item.tag) ? theme.colors.background : theme.colors.text}
                    />
                    <ThemedText style={{ color: amenities.includes(item.tag) ? theme.colors.background : theme.colors.text }}>
                      {item.tag}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={[styles.footer, {backgroundColor: theme.colors.background, shadowColor: theme.colors.shadow}]}>
        <TouchableOpacity onPress={handleClearAll}>
          <ThemedText style={{ textDecorationLine: 'underline' }}>Clear All</ThemedText>
        </TouchableOpacity>
        <Button
          title="Apply Filters"
          onPress={handleApply}
          buttonStyle={[styles.applyButton, { backgroundColor: theme.colors.accent }]}
          titleStyle={styles.applyButtonText}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    // borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'black',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    // paddingBottom: 160
  },
  section: {
    paddingVertical: 16,
    gap: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  footer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    position: 'absolute',
    bottom:0, 
    paddingBottom: 20,
    width
  },
  applyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventsFiltersScreen;


// import { ThemedText } from '@/components/ThemedText';
// import CustomPriceRange from '@/components/ui/PriceRange';
// import { useEventFilterStore } from '@/store/filterStore';
// import { useTheme } from '@/theme/theme';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import React, { useCallback, useState } from 'react';
// import { Dimensions, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { Button } from 'react-native-elements';

// const EventAmenities = [
//   {
//     name: 'popular',
//     items: [
//       { tag: 'Food & Drinks', icon: 'restaurant' as const },
//       { tag: 'Parking', icon: 'car' as const },
//       { tag: 'Wheelchair Access', icon: 'accessibility' as const },
//       { tag: 'Outdoor Seating', icon: 'leaf' as const },
//     ],
//   },
//   {
//     name: 'extras',
//     items: [
//       { tag: 'Live Music', icon: 'musical-notes' as const },
//       { tag: 'VIP Section', icon: 'star' as const },
//       { tag: 'Restrooms', icon: 'water' as const },
//     ],
//   },
// ];

// const { width } = Dimensions.get('screen');

// const EventsFiltersScreen: React.FC = () => {
//   const navigation = useNavigation();
//   const { theme } = useTheme();
//   const {
//     priceRange,
//     eventTypes,
//     duration,
//     amenities,
//     setPriceRange,
//     setEventTypes,
//     setDuration,
//     setAmenities,
//     resetFilters,
//   } = useEventFilterStore();

//   const [durationRange, setDurationRange] = useState<[number, number?] | number | null>(duration);

//   const handleDurationSelect = useCallback((value: number) => {
//     if (durationRange === null || typeof durationRange === 'number') {
//       setDurationRange(value);
//     } else {
//       const [start, end] = durationRange;
//       if (value === start || value === end) {
//         setDurationRange(value);
//       } else if (value < start) {
//         setDurationRange([value, end || start]);
//       } else if (!end || value > end) {
//         setDurationRange([start, value]);
//       } else {
//         setDurationRange(value);
//       }
//     }
//   }, [durationRange]);

//   const handleEventTypeSelect = useCallback((type: string) => {
//     const updatedTypes = eventTypes.includes(type)
//       ? eventTypes.filter((t) => t !== type)
//       : [...eventTypes, type];
//     setEventTypes(updatedTypes);
//   }, [eventTypes, setEventTypes]);

//   const handleAmenitySelect = useCallback((tag: string) => {
//     const updatedAmenities = amenities.includes(tag)
//       ? amenities.filter((a) => a !== tag)
//       : [...amenities, tag];
//     setAmenities(updatedAmenities);
//   }, [amenities, setAmenities]);

//   const handleApply = useCallback(() => {
//     setDuration(durationRange);
//     navigation.goBack();
//   }, [durationRange, setDuration, navigation]);

//   const handleClearAll = useCallback(() => {
//     setDurationRange(null);
//     resetFilters();
//   }, [resetFilters]);

//   const isDurationSelected = useCallback(
//     (value: number) => {
//       if (durationRange === null) return false;
//       if (typeof durationRange === 'number') return durationRange === value;
//       const [start, end] = durationRange;
//       return value >= start && value <= (end || start);
//     },
//     [durationRange]
//   );

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="close" size={24} color={theme.colors.text} />
//         </TouchableOpacity>
//         <View style={{ position: 'absolute', bottom: 4, alignItems: 'center', justifyContent: 'center', width }}>
//           <ThemedText style={styles.headerTitle}>Event Filters</ThemedText>
//         </View>
//       </View>
//       <ScrollView style={styles.scrollView}>
//         {/* Price Range */}
//         <View style={styles.section}>
//           {/* <ThemedText style={styles.sectionTitle}>Ticket Price</ThemedText> */}
//           <CustomPriceRange min={0} max={500} values={priceRange} onChange={(value) => setPriceRange(value)} />
//         </View>

//         {/* Event Types */}
//         <View style={styles.section}>
//           <ThemedText style={styles.sectionTitle}>Event Type</ThemedText>
//           <View style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 10 }}>
//             {['Concert', 'Workshop', 'Festival', 'Conference'].map((type) => (
//               <Pressable
//                 key={type}
//                 style={{
//                   backgroundColor: eventTypes.includes(type) ? theme.colors.accent : theme.colors.backgroundSec,
//                   borderRadius: 30,
//                   padding: 10,
//                   borderWidth: 1,
//                   borderColor: theme.colors.border,
//                   flexDirection: 'row',
//                   gap: 3,
//                   alignItems: 'center',
//                 }}
//                 onPress={() => handleEventTypeSelect(type)}
//               >
//                 <Ionicons
//                   name="calendar-outline"
//                   size={24}
//                   color={eventTypes.includes(type) ? theme.colors.background : theme.colors.text}
//                 />
//                 <ThemedText style={{ color: eventTypes.includes(type) ? theme.colors.background : theme.colors.text }}>
//                   {type}
//                 </ThemedText>
//               </Pressable>
//             ))}
//           </View>
//         </View>

//         {/* Event Duration */}
//         <View style={styles.section}>
//           <ThemedText style={styles.sectionTitle}>Duration</ThemedText>
//           <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, width: 301, marginBottom: 10 }}>
//             {[1, 2, 3, 4, 5, 6].map((item) => (
//               <Pressable
//                 key={item}
//                 style={{
//                   padding: 10,
//                   borderColor: theme.colors.border,
//                   width: 50,
//                   alignItems: 'center',
//                   backgroundColor: isDurationSelected(item) ? theme.colors.accent : theme.colors.background,
//                   borderTopLeftRadius: item === 1 ? 8 : 0,
//                   borderBottomLeftRadius: item === 1 ? 8 : 0,
//                   borderLeftWidth: item === 1 ? 0 : 1,
//                 }}
//                 onPress={() => handleDurationSelect(item)}
//               >
//                 <ThemedText style={{ color: isDurationSelected(item) ? theme.colors.background : theme.colors.text }}>
//                   {item}
//                 </ThemedText>
//               </Pressable>
//             ))}
//           </View>
//         </View>

//         {/* Amenities */}
//         <View style={styles.section}>
//           <ThemedText style={styles.sectionTitle}>Amenities</ThemedText>
//           {EventAmenities.map((section, index) => (
//             <View key={index} style={{ paddingVertical: 15 }}>
//               <Text style={[styles.sectionTitle, { textTransform: 'capitalize', color: theme.colors.text, paddingBottom: 5 }]}>
//                 {section.name.trim()}
//               </Text>
//               <View style={{ flexWrap: 'wrap', flexDirection: 'row', rowGap: 10, columnGap: 7 }}>
//                 {section.items.map((item) => (
//                   <Pressable
//                     key={item.tag}
//                     style={{
//                       backgroundColor: amenities.includes(item.tag) ? theme.colors.accent : theme.colors.backgroundSec,
//                       borderRadius: 20,
//                       padding: 10,
//                       borderWidth: 1,
//                       borderColor: theme.colors.border,
//                       flexDirection: 'row',
//                       gap: 3,
//                       alignItems: 'center',
//                     }}
//                     onPress={() => handleAmenitySelect(item.tag)}
//                   >
//                     <Ionicons
//                       name={item.icon}
//                       size={24}
//                       color={amenities.includes(item.tag) ? theme.colors.background : theme.colors.text}
//                     />
//                     <ThemedText style={{ color: amenities.includes(item.tag) ? theme.colors.background : theme.colors.text }}>
//                       {item.tag}
//                     </ThemedText>
//                   </Pressable>
//                 ))}
//               </View>
//             </View>
//           ))}
//         </View>
//       </ScrollView>
//       <View style={styles.footer}>
//         <TouchableOpacity onPress={handleClearAll}>
//           <ThemedText style={{ textDecorationLine: 'underline' }}>Clear All</ThemedText>
//         </TouchableOpacity>
//         <Button
//           title="Apply Filters"
//           onPress={handleApply}
//           buttonStyle={[styles.applyButton, { backgroundColor: theme.colors.accent }]}
//           titleStyle={styles.applyButtonText}
//         />
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: 'black',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   section: {
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   footer: {
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   applyButton: {
//     backgroundColor: '#007AFF',
//     borderRadius: 8,
//     paddingVertical: 12,
//   },
//   applyButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default EventsFiltersScreen;

