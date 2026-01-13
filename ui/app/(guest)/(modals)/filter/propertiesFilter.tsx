import { ThemedText } from '@/components/ThemedText';
import { Line } from '@/components/ui/Line';
import CustomPriceRange from '@/components/ui/PriceRange';
import { useFilterStore } from '@/stores/filterStore';
import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

const Amenities = [
    {
        name: 'popular',
        items: [
            {tag: 'Wifi', icon: 'wifi' as const },
            {tag: 'Air conditioning', icon: 'snow' as const },
            {tag: 'Pool', icon: 'water' as const },
            {tag: 'TV', icon: 'tv' as const },
            {tag: 'Gym', icon: 'barbell' as const },
        ]
    },
    {
        name: 'Essentials',
        items: [
            {tag: 'Kitchen', icon: 'restaurant' as const },
            {tag: 'Dryer', icon: 'water' as const },
            {tag: 'Heating', icon: 'flame' as const },
            {tag: 'Iron', icon: 'shirt' as const },
            {tag: 'Washing Machine', icon: 'water' as const }
        ]
    },
]

const {width} = Dimensions.get('screen')

const FiltersScreen: React.FC = () => {
  const navigation = useNavigation();
  const {theme } = useTheme();
  const {
    priceRange,
    bedrooms,
    bathrooms,
    propertyTypes,
    amenities,
    setPriceRange,
    setBedrooms,
    setBathrooms,
    setPropertyTypes,
    setAmenities,
    resetFilters,
  } = useFilterStore();

  // const [bedroomRange, setBedroomRange] = useState<number[]>([]);
  const [bedroomRange, setBedroomRange] = useState<[number, number?]>(bedrooms);
  const [bathroomRange, setBathroomRange] = useState<[number, number?]>(bathrooms);

  const handleBedroomSelect = (value: number) => {
    console.log('wwowwo')
    if (value == 0|| bedroomRange?.[0] == 0) {
      // if (bedroomRange)
      console.log('2sisoi', bedroomRange?.[0] == 0)
      setBedroomRange([value])
    } else {
      console.log('siso')
      const [start, end] = bedroomRange;
      if (value === start || value === end) {
        console.log('equal')
        setBedroomRange([value]);
      } else if (value < start) {
        console.log('lesser')
        setBedroomRange([value, end|| start]);
      } else if (!end || value > end) {
        console.log('greater')
        setBedroomRange([start, value]);
      } else {
        console.log('42020', start, end)
        setBedroomRange([value]);
      }
    }
  };

  console.log('bedroomrange', bedroomRange, )

  const handleBathroomSelect = (value: number) => {
    if (value == 0|| bathroomRange?.[0] == 0) {
      // if (bathroomRange)
      console.log('2sisoi', bathroomRange?.[0] == 0)
      setBathroomRange([value])
    } else {
      console.log('siso')
      const [start, end] = bathroomRange;
      if (value === start || value === end) {
        console.log('equal')
        setBathroomRange([value]);
      } else if (value < start) {
        console.log('lesser')
        setBathroomRange([value, end|| start]);
      } else if (!end || value > end) {
        console.log('greater')
        setBathroomRange([start, value]);
      } else {
        console.log('42020', start, end)
        setBathroomRange([value]);
      }
    }
  };

  const handlePropertyTypeSelect = (type: string) => {
    const updatedTypes = propertyTypes.includes(type)
      ? propertyTypes.filter(t => t !== type)
      : [...propertyTypes, type];
    setPropertyTypes(updatedTypes);
  };

  const handleAmenitySelect = (tag: string) => {
    const updatedAmenities = amenities.includes(tag)
      ? amenities.filter((a:any) => a !== tag)
      : [...amenities, tag];
    setAmenities(updatedAmenities);
  };

  const handleApply = () => {
    setBedrooms(bedroomRange!);
    setBathrooms(bathroomRange!);
    navigation.goBack();
  };

  const handleClearAll = () => {
    setBedroomRange([0]);
    setBathroomRange([0]);
    resetFilters();
  };

  const isBedroomSelected = (value: number) => {
    if (bedroomRange === null) return false;
    const [start, end] = bedroomRange;
    return value >= start && value <= end! || value === start;
  };

  const isBathroomSelected = (value: number) => {
    if (bathroomRange === null) return false;
    const [start, end] = bathroomRange;
    return value >= start && value <= end! || value === start;
  };

  console.log(bedroomRange)

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderColor: theme.colors.border}]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{position: 'absolute', bottom: 4, alignItems:'center', justifyContent:'center', width}}>
          <ThemedText type='subtitle'>Filters</ThemedText>
        </View>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={{paddingBottom: 40}}>
        {/* Price Range */}
        <View style={styles.section}>
          <CustomPriceRange showChart min={50} max={1400} values={priceRange} onChange={(value) => setPriceRange(value)} />
        </View>

        <Line style={{borderBottomWidth: 1, borderColor: theme.colors.border,marginTop: 10}} />
        

        {/* Bedrooms */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Bedrooms</ThemedText>
          <View style={{flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth:1, borderColor: theme.colors.border, width: 302, marginBottom:10}}>
            {[0,1,2,3,4,5].map((item) => (
              <Pressable 
                key={item} 
                style={{
                  padding: 10, 
                  borderColor: isBedroomSelected(item) ? theme.colors.accent : theme.colors.border, 
                  width: 50, 
                  alignItems: 'center', 
                  backgroundColor: isBedroomSelected(item) ? 'rgba(35, 141, 153, 0.15)': theme.colors.background,
                  borderTopLeftRadius: item === 0 ? 8 : 0, 
                  borderBottomLeftRadius: item === 0 ? 8 : 0, 
                  borderTopRightRadius: item === 5 ? 8 : 0, 
                  borderBottomRightRadius: item === 5 ? 8 : 0, 
                  borderLeftWidth: item === 0 ? 1: 1,
                  borderWidth:1,
                }} 
                onPress={() => handleBedroomSelect(item)}
              >
                <ThemedText style={{color: isBedroomSelected(item)? theme.colors.accent: theme.colors.text}}>
                  {item === 0 ? 'Any' : item}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
        <Line style={{borderBottomWidth: 1, borderColor: theme.colors.border}} />


        {/* Bathrooms */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Bathrooms</ThemedText>
          <View style={{flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth:1, borderColor: theme.colors.border, width: 302, marginBottom:10}}>
            {[0,1,2,3,4,5].map((item) => (
              <Pressable 
                key={item} 
                style={{
                  padding: 10, 
                  borderColor: isBathroomSelected(item) ? theme.colors.accent : theme.colors.border, 
                  width: 50, 
                  alignItems: 'center', 
                  backgroundColor: isBathroomSelected(item) ? 'rgba(35, 141, 153, 0.15)': theme.colors.background,
                  borderTopLeftRadius: item === 0 ? 8 : 0, 
                  borderBottomLeftRadius: item === 0 ? 8 : 0, 
                  borderTopRightRadius: item === 5 ? 8 : 0, 
                  borderBottomRightRadius: item === 5 ? 8 : 0, 
                  borderLeftWidth: item === 0 ? 1: 1,
                  borderWidth:1,
                }} 
                onPress={() => handleBathroomSelect(item)}
              >
                <ThemedText style={{color: isBathroomSelected(item) ? theme.colors.accent: theme.colors.text}}>
                  {item === 0 ? 'Any' : item}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <Line style={{borderBottomWidth: 1, borderColor: theme.colors.border}} />


        {/* Property Types */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Property Type</ThemedText>
          <View style={{flexWrap: 'wrap', flexDirection: 'row', gap: 10}}>
            {['House', 'Flat', 'Guest House', 'Hotel'].map((type) => (
              <Pressable 
                key={type} 
                style={{
                  backgroundColor: propertyTypes.includes(type) ? theme.colors.accent : theme.colors.backgroundSec, 
                  borderRadius: 30, 
                  padding: 10, 
                  borderWidth: 1, 
                  borderColor: theme.colors.border, 
                  flexDirection: 'row', 
                  gap: 3, 
                  alignItems: 'center'
                }}
                onPress={() => handlePropertyTypeSelect(type)}
              >
                <Ionicons 
                  name='home-outline' 
                  size={24} 
                  color={propertyTypes.includes(type) ? theme.colors.background : theme.colors.text}
                />
                <ThemedText style={{color: propertyTypes.includes(type) ? theme.colors.background : theme.colors.text}}>
                  {type}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <Line style={{borderBottomWidth: 1, borderColor: theme.colors.border, marginTop: 10}} />


        {/* Amenities */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Amenities</ThemedText>
          {Amenities.map((section, index) => (
            <View key={index} style={{paddingVertical: 15}}>
              <Text style={[styles.sectionTitle, {textTransform: 'capitalize', color: theme.colors.text, paddingBottom: 5}]}>
                {section.name.trim()}
              </Text>
              <View style={{flexWrap: 'wrap', flexDirection: 'row', rowGap: 10, columnGap: 7}}>
                {section.items.map(item => (
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
                      alignItems: 'center'
                    }}
                    onPress={() => handleAmenitySelect(item.tag)}
                  >
                    <Ionicons 
                      name={item.icon} 
                      size={24} 
                      color={amenities.includes(item.tag) ? theme.colors.background : theme.colors.text}
                    />
                    <ThemedText style={{color: amenities.includes(item.tag) ? theme.colors.background : theme.colors.text}}>
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
          <ThemedText style={{textDecorationLine: "underline"}}>Clear All</ThemedText>
        </TouchableOpacity>
        <Button
          title="Apply Filters"
          onPress={handleApply}
          buttonStyle={[styles.applyButton, {backgroundColor: theme.colors.accent}]}
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'black',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 20
  },
  section: {
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#e0e0e0',
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#007AFF',
    borderRadius: 10,
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

export default FiltersScreen;

// import React from 'react';
// import { Dimensions, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { Button } from 'react-native-elements';

// import { ThemedText } from '@/components/ThemedText';
// import CustomPriceRange from '@/components/ui/PriceRange';
// import { useFilterStore } from '@/store/filterStore';
// import { useTheme } from '@/theme/theme';
// import { Ionicons } from '@expo/vector-icons';

// const Amenities = [
//     {
//         name: 'popular',
//         items: [
//             {tag: 'Wifi', icon: `wifi` as const },
//             {tag: 'Air conditioning', icon: `wifi` as const },
//             {tag: 'Pool', icon: `wifi` as const },
//             {tag: 'TV', icon: `wifi` as const },
//             {tag: 'Gym', icon: `wifi` as const },
//         ]
//     },
//     {
//         name: 'Essentials',
//         items: [
//             {tag: 'Kitchen', icon: `wifi` as const },
//             {tag: 'Dryer', icon: `wifi` as const },
//             {tag: 'Heating', icon: `wifi` as const },
//             {tag: 'Iron', icon: `wifi` as const },
//             {tag: 'Washing Machine', icon: `wifi` as const }
//         ]
//     },
// ]

// const {width} = Dimensions.get('screen')

// const FiltersScreen: React.FC = () => {
//   const navigation = useNavigation();
//   const {theme } = useTheme()
//   const {
//     priceRange,
//     bedrooms,
//     propertyTypes,
//     schoolRating,
//     setPriceRange,
//     setBedrooms,
//     setPropertyTypes,
//     setSchoolRating,
//     resetFilters,
//   } = useFilterStore();

//   const handleApply = () => {
//     // Apply filters and navigate back
//     navigation.goBack();
//   };

//   return (
//     <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="close" size={24} color={theme.colors.text} />
//         </TouchableOpacity>
//         <View style={{position: 'absolute', bottom: 4, alignItems:'center', justifyContent:'center', width}}><ThemedText style={styles.headerTitle}>Filters</ThemedText></View>
//       </View>
//       <ScrollView style={styles.scrollView}>
//         {/* Price Range */}
//         <View style={styles.section}>
//           <CustomPriceRange min={50} max={1400} values={priceRange} onChange={(value) => setPriceRange(value) } />
//         </View>

//         {/* Bedrooms */}
//         <View style={styles.section}>
//           {/* <ThemedText style={styles.sectionTitle}>Rooms & Bathrooms</ThemedText> */}
//           <ThemedText style={styles.sectionTitle}>BedRooms </ThemedText>
//           <View style={{flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, width: 301, marginBottom:10}}>
//             {[0,1,2,3,4,5].map((item) => (
//                 <Pressable key={item} style={{padding: 10, borderColor: theme.colors.border, width: 50, alignItems:'center', backgroundColor: 'rgba(35, 141, 153, 0.15)', borderTopLeftRadius: item==0?8:0, borderBottomLeftRadius: item==0?8:0, borderLeftWidth: item == 0?0:1, opacity:1}} >  
//                 {/* <Pressable key={item} style={{padding: 10, borderColor: theme.colors.border, width: 50, alignItems:'center', backgroundColor: 'rgba(78, 205, 196, 0.6)', borderTopLeftRadius: item==0?8:0, borderBottomLeftRadius: item==0?8:0, borderLeftWidth: item == 0?0:1, opacity:0.2}} >   */}
//                   <ThemedText style={{color: theme.colors.accent}}>{item == 0? 'Any':item}   
//                 </ThemedText></Pressable>
//             ))}
//           </View>
//         </View>

//         {/* Bedrooms */}
//         <View style={styles.section}>
//           {/* <ThemedText style={styles.sectionTitle}>Rooms & Bathrooms</ThemedText> */}
//           <ThemedText style={styles.sectionTitle}>Bathrooms </ThemedText>
//           <View style={{flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, width: 301, marginBottom:10}}>
//             {[0,1,2,3,4,5].map((item) => (
//                 <Pressable key={item} style={{padding: 10, borderColor: theme.colors.border, width: 50, alignItems:'center', backgroundColor: 'rgba(35, 141, 153, 0.15)', borderTopLeftRadius: item==0?8:0, borderBottomLeftRadius: item==0?8:0, borderLeftWidth: item == 0?0:1, opacity:1}} >  
//                 {/* <Pressable key={item} style={{padding: 10, borderColor: theme.colors.border, width: 50, alignItems:'center', backgroundColor: 'rgba(78, 205, 196, 0.6)', borderTopLeftRadius: item==0?8:0, borderBottomLeftRadius: item==0?8:0, borderLeftWidth: item == 0?0:1, opacity:0.2}} >   */}
//                   <ThemedText style={{color: theme.colors.accent}}>{item == 0? 'Any':item}   
//                 </ThemedText></Pressable>
//             ))}
//           </View>
//         </View>

//         {/* Property Types */}
//         <View style={styles.section}>
//           <ThemedText style={styles.sectionTitle}>Property Type</ThemedText>
//           <View style={{flexWrap: 'wrap', flexDirection: 'row', gap: 10, }}>
//             {['House', 'Flat', 'Guest House', 'Hotel'].map((type) => (
//             <Pressable key={type} style={{backgroundColor: theme.colors.backgroundSec, borderRadius: 30, padding: 10, borderWidth:1, borderColor: theme.colors.border, flexDirection: 'row', gap:3, alignItems: 'center'}}>
//                 <Ionicons name='home-outline' size={24} color={theme.colors.text}/>
//                 <ThemedText> {type} </ThemedText>
//             </Pressable>
//             ))}
//           </View>
//         </View>

//         {/* School Rating */}
//         <View style={styles.section}>
//           <ThemedText style={styles.sectionTitle}>Amenities</ThemedText>

//           {/* <View> */}
//             {Amenities.map((section, index) => (
                
//                 <View key={index} style={{paddingVertical: 15}}>
//                     {/* <ThemedText style={[styles.sectionTitle, {textTransform: 'capitalize'}]}>popular</ThemedText> */}
//                     <Text style={[styles.sectionTitle, {textTransform: 'capitalize',color: theme.colors.text, paddingBottom:5}]}> {section.name.trim()} </Text>
//                     <View style={{flexWrap: 'wrap', flexDirection: 'row', rowGap: 10, columnGap: 7, }}>
//                         {section.items.map(item => (
//                             <Pressable key={item.tag} style={{backgroundColor: theme.colors.backgroundSec, borderRadius: 20, padding: 10, borderWidth:1, borderColor: theme.colors.border, flexDirection: 'row', gap:3, alignItems: 'center'}}>
//                                 <Ionicons name={item.icon} size={24} color={theme.colors.text}/>
//                                 <ThemedText> {item.tag} </ThemedText>
//                             </Pressable>
//                         ))}
//                     </View>
//                 </View>
//             ))}
//           {/* </View> */}
//         </View>

//         {/* School Rating */}
//         {/* <View style={styles.section}>
//           <Text style={styles.sectionTitle}>School Rating (GreatSchools)</Text>
//           <Slider
//             value={schoolRating ?? 0}
//             onValueChange={(value) => setSchoolRating(value)}
//             minimumValue={0}
//             maximumValue={10}
//             step={1}
//             allowTouchTrack
//             trackStyle={styles.sliderTrack}
//             thumbStyle={styles.sliderThumb}
//           />
//           <Text>{schoolRating ? `${schoolRating}+` : 'Any'}</Text>
//         </View> */}
        
//       </ScrollView>
//       <View style={styles.footer}>
//         <ThemedText style={{textDecorationLine: "underline"}}>Clear All</ThemedText>
//         <Button
//           title="Apply Filters"
//           onPress={handleApply}
//           buttonStyle={[styles.applyButton, {backgroundColor: theme.colors.accent}]}
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
//     // paddingBottom: 80
//     // position: 'a'
//   },
//   resetText: {
//     fontSize: 16,
//     color: '#007AFF',
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
//   sliderTrack: {
//     height: 4,
//     backgroundColor: '#e0e0e0',
//   },
//   sliderThumb: {
//     width: 20,
//     height: 20,
//     backgroundColor: '#007AFF',
//     borderRadius: 10,
//   },
//   checkbox: {
//     backgroundColor: 'transparent',
//     borderWidth: 0,
//     padding: 0,
//     marginBottom: 8,
//   },
//   footer: {
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems:'center'
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

// export default FiltersScreen;