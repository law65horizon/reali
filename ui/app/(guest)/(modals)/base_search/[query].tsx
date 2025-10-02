import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme/theme';
import { Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';

const { width, height } = Dimensions.get('screen');

const RedesignedSearch = () => {

  const defaultStyles = useDefaultStyles();
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  })

  const handleDateChange = ({ startDate, endDate }:any) => {
    setDateRange({ startDate, endDate });
  };
  
  const { theme } = useTheme();
  const {query} = useLocalSearchParams()
  const navigation = useNavigation();
  
  // const [currentTab, setCurrentTab] = useState<'homes' | 'experiences' | 'services'>('homes');
  const [currentTab, setCurrentTab] = useState<'homes' | 'experiences' >(JSON.parse(query as string)?.type || 'homes');
  const tabAnim = useSharedValue(0); // For tab underline animation

  const [search, setSearch] = useState({
    category: '',
    address: '',
    dates: '',
  })

  const [propertyType, setPropertyType] = useState<'rent' | 'sale' | 'sold'>('rent');

  const [strue, setTrue] = useState(true)
  const [expanded, setExpanded] = useState<'location' | 'date' | 'category'>('location')

  console.log(strue)

  // Shared filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dates, setDates] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });

  // Homes-specific
  const [homesPriceRange, setHomesPriceRange] = useState([100, 1000]);
  const [homesSpeciality, setHomesSpeciality] = useState('');
  const [homesAmenities, setHomesAmenities] = useState<string[]>([]);

  // Experiences-specific
  const [expPriceRange, setExpPriceRange] = useState([50, 500]);
  const [expCategory, setExpCategory] = useState('');
  const [expGroupSize, setExpGroupSize] = useState(1);
  const [expDuration, setExpDuration] = useState(60); // in minutes

  // Services-specific
  const [servPriceRange, setServPriceRange] = useState([20, 200]);
  const [servType, setServType] = useState('');
  const [servYearsExp, setServYearsExp] = useState(1);
  const [servRating, setServRating] = useState(3); // Min rating

  const tabs = [
    { id: 'homes', label: 'Homes', icon: 'home' as const },
    { id: 'experiences', label: 'Experiences', icon: 'star' as const },
    // { id: 'services', label: 'Services', icon: 'briefcase' as const },
  ];

  console.log('sio', currentTab)

  // Sample data based on DB schema
  const suggestedLocations = useMemo(
    () => [
      { id: 1, name: 'New York, USA', icon: '🇺🇸' },
      { id: 2, name: 'Tokyo, Japan', icon: '🇯🇵' },
      { id: 3, name: 'Paris, France', icon: '🇫🇷' },
      { id: 4, name: 'Bali, Indonesia', icon: '🇮🇩' },
    ],
    []
  );

  const homesAmenitiesOptions = ['WiFi', 'Pool', 'Kitchen', 'Air Conditioning', 'Parking', 'Gym', 'Pet Friendly'];

  const expCategoriesOptions = ['Tour', 'Adventure', 'Workshop', 'Cultural', 'Food', 'Wellness'];

  const servTypesOptions = ['Spa', 'Dining', 'Consulting', 'Repair', 'Tutoring', 'Fitness'];

  // Animation for tab underline
  const underlineStyle = useAnimatedStyle(() => ({
    left: withTiming((width / 3) * tabs.findIndex(t => t.id === currentTab)),
    width: width / 3,
  }));

  const handleTabChange = (tab: typeof currentTab) => {
    setCurrentTab(tab);
    tabAnim.value = tabs.findIndex(t => t.id === tab);
  };

  const toggleAmenity = (amenity: string) => {
    setHomesAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDates({ start: null, end: null });
    setHomesPriceRange([100, 1000]);
    setHomesSpeciality('');
    setHomesAmenities([]);
    setExpPriceRange([50, 500]);
    setExpCategory('');
    setExpGroupSize(1);
    setExpDuration(60);
    setServPriceRange([20, 200]);
    setServType('');
    setServYearsExp(1);
    setServRating(3);
  };

  const performSearch = () => {
    // Implement search logic based on tab and filters
    // For example, construct query params
    const queryParams = {
      query: searchQuery,
      minPrice: currentTab === 'homes' ? homesPriceRange[0] : currentTab === 'experiences' ? expPriceRange[0] : servPriceRange[0],
      maxPrice: currentTab === 'homes' ? homesPriceRange[1] : currentTab === 'experiences' ? expPriceRange[1] : servPriceRange[1],
      startDate: dates?.start,
      endDate: dates?.end,
      category: currentTab === 'homes' ? homesSpeciality : currentTab === 'experiences' ? expCategory : servType,
      type: currentTab,
    }

    const cleanQueryParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, value]) => value !== undefined && value !== null)
    );
    console.warn('Cleaned query params:', cleanQueryParams);

    // console.log('Searching with params:', queryParams);
    router.replace({
      pathname: '/(guest)/(tabs)/home/(search)/[query]',
      params: { query: JSON.stringify(cleanQueryParams) }
    });
    // router.replace(`/(guest)/(tabs)/home/(search)/${currentTab}?` + new URLSearchParams(queryParams as any).toString());
  };

  const renderLocationSection = () => (
    <ThemedView plain style={[styles.sectionCard, {gap: 10,height: expanded === 'location' && !suggestedLocations ? '125%': 'auto',  marginBottom: expanded === 'location' && !suggestedLocations ? 200: 0}]}>
      <View style={styles.sectionHeader}>
        <Ionicons name="location-outline" size={24} color={theme.colors.accent} />
        <ThemedText type="subtitle" style={styles.sectionTitle}>Destination</ThemedText>
      </View>
      <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
        <IconSymbol name="magnifyingglass" size={20} color={theme.colors.icon} />
        <TextInput
          value={searchQuery}
          onPress={() => setExpanded('location')}
          onChangeText={setSearchQuery}
          style={[styles.input, { color: theme.colors.text }]}
          placeholder="City, country, or address"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>
      {expanded == 'location' && (
        <>
         {true ? (<>
          <ThemedText style={{marginVertical: 10}} type='defaultSemiBold'>Recent Searches</ThemedText>
          <View style={{borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 10, gap: 5}}>
            {[0,1,2,].map((item) => (
              <View key={item} style={{flexDirection: 'row', gap: 15, alignItems:'center'}}>
                <MaterialCommunityIcons name='clock' size={20} color={theme.colors.accent} />

                <ThemedText type='defaultSemiBold' style={{flex:1, borderBottomWidth: 1, borderColor: theme.colors.border,}} >
                  {32+item*item}00 {'\n'}
                  <ThemedText>Active Listings</ThemedText>
                </ThemedText>
              </View>
            ))}
          </View>
        </> ): 
          <FlatList 
            data={suggestedLocations}
            renderItem={({item}) => (
              <Pressable style={{flexDirection: 'row', gap: 15, alignItems: 'center'}}>
                <Ionicons name="location-outline" size={24} color={theme.colors.accent} style={{padding: 10, backgroundColor: 'rgba(78, 205, 196, 0.35)', borderRadius: 5}} />
                <ThemedText> {item.name} </ThemedText>
              </Pressable>
            )}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{gap: 10, marginBottom: 300,}}
            ListHeaderComponent={() => <ThemedText>Suggested locations</ThemedText>}
            ListFooterComponent={() => (
              <View style={{ alignItems:'flex-end'}}>
                <Pressable onPress={() => setExpanded('date')} style={{backgroundColor: theme.colors.border, padding: 10, borderRadius:5}}>
                  <ThemedText>Close</ThemedText>
                </Pressable>
              </View>
            )}
          />}
        </>
      )}
    </ThemedView>
  );

  const renderDatesSection = () => (<>
    {expanded !== 'date' ? (
      <ThemedView plain style={[styles.sectionCard, ]}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="calendar-outline" size={24} color={theme.colors.accent} />
        <ThemedText type="subtitle" style={styles.sectionTitle}>Dates</ThemedText>
      </View>
      <TouchableOpacity 
        style={[styles.datePicker, { backgroundColor: theme.colors.backgroundSec }]}
        onPress={() => setExpanded('date')}
      >
        <ThemedText>
          {dates.start && dates.end ? `${dates.start} - ${dates.end}` : 'Select travel dates'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
    ): (
      <View>
         <DateTimePicker
            mode="range"
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={handleDateChange}
            style={{...styles.sectionCard, backgroundColor: theme.colors.background}}
            styles={{
              ...defaultStyles,
            }}
            minDate={new Date()}
            
          />
      </View>
    )}
  </>);

  const renderPriceRange = (value: number[], onChange: (val: number[]) => void, min: number, max: number, step: number) => (
    <View>
      <View style={styles.rangeLabels}>
        <ThemedText>${value[0]}</ThemedText>
        <ThemedText>${value[1]}</ThemedText>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value[0]}
        onValueChange={v => onChange([Math.round(v), value[1]])}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.border}
        thumbTintColor={theme.colors.primary}
      />
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value[1]}
        onValueChange={v => onChange([value[0], Math.round(v)])}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.border}
        thumbTintColor={theme.colors.primary}
      />
    </View>
  );

  const renderHomesSpecific = () => (
    <>
      {/* <ThemedView plain style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          // <FontAwesome5 name="dollar-sign" size={24} color={theme.colors.accent} />
          <ThemedText type="subtitle" style={styles.sectionTitle}>Price Range</ThemedText>
        </View>
        {renderPriceRange(homesPriceRange, setHomesPriceRange, 50, 2000, 10)}
      </ThemedView> */}
      <Pressable onPress={() => setExpanded('category')} style={[styles.sectionCard, {backgroundColor: theme.colors.background, flex:1}]}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="category" size={24} color={theme.colors.accent} />
          <ThemedText type="subtitle" style={styles.sectionTitle}>Speciality</ThemedText>
        </View>
      </Pressable>
      {/* <ThemedView plain style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="options-outline" size={24} color={theme.colors.accent} />
          <ThemedText type="subtitle" style={styles.sectionTitle}>Amenities</ThemedText>
        </View>
        <FlatList
          data={homesAmenitiesOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.chip, 
                { 
                  backgroundColor: homesAmenities.includes(item) ? theme.colors.primary : theme.colors.card,
                }
              ]}
              onPress={() => toggleAmenity(item)}
            >
              <ThemedText 
                style={[
                  styles.chipText, 
                  { color: homesAmenities.includes(item) ? theme.colors.background : theme.colors.text }
                ]}
              >
                {item}
              </ThemedText>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.chipList}
        />
      </ThemedView> */}
    </>
  );

  const renderExperiencesSpecific = () => (
    <>
      {/* <ThemedView plain style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <FontAwesome5 name="dollar-sign" size={24} color={theme.colors.accent} />
          <ThemedText type="subtitle" style={styles.sectionTitle}>Price Range</ThemedText>
        </View>
        {renderPriceRange(expPriceRange, setExpPriceRange, 20, 1000, 5)}
      </ThemedView> */}
      <ThemedView plain style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="category" size={24} color={theme.colors.accent} />
          <ThemedText type="subtitle" style={styles.sectionTitle}>Category</ThemedText>
        </View>
        <FlatList
          data={expCategoriesOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.chip, 
                { 
                  backgroundColor: expCategory === item ? theme.colors.primary : theme.colors.card,
                }
              ]}
              onPress={() => setExpCategory(item)}
            >
              <ThemedText 
                style={[
                  styles.chipText, 
                  { color: expCategory === item ? theme.colors.background : theme.colors.text }
                ]}
              >
                {item}
              </ThemedText>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.chipList}
        />
      </ThemedView>
      {/* <ThemedVs */}
    </>
  );

  const renderServicesSpecific = () => (
    <>
      <ThemedView plain style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          {/* <FontAwesome5 name="dollar-sign" size={24} color={theme.colors.accent} /> */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>Price Range</ThemedText>
        </View>
        {renderPriceRange(servPriceRange, setServPriceRange, 10, 500, 5)}
      </ThemedView>
      <ThemedView plain style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="work-outline" size={24} color={theme.colors.accent} />
          <ThemedText type="subtitle" style={styles.sectionTitle}>Service Type</ThemedText>
        </View>
        <FlatList
          data={servTypesOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.chip, 
                { 
                  backgroundColor: servType === item ? theme.colors.primary : theme.colors.card,
                }
              ]}
              onPress={() => setServType(item)}
            >
              <ThemedText 
                style={[
                  styles.chipText, 
                  { color: servType === item ? theme.colors.background : theme.colors.text }
                ]}
              >
                {item}
              </ThemedText>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.chipList}
        />
      </ThemedView>
      <ThemedView plain style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="medal-outline" size={24} color={theme.colors.accent} />
          <ThemedText type="subtitle" style={styles.sectionTitle}>Minimum Years of Experience</ThemedText>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={20}
          step={1}
          value={servYearsExp}
          onValueChange={setServYearsExp}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.border}
          thumbTintColor={theme.colors.primary}
        />
        <ThemedText style={styles.sliderValue}>{servYearsExp}+ years</ThemedText>
      </ThemedView>
      <ThemedView plain style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="star-outline" size={24} color={theme.colors.accent} />
          <ThemedText type="subtitle" style={styles.sectionTitle}>Minimum Rating</ThemedText>
        </View>
        <View style={styles.ratingStars}>
          {[1,2,3,4,5].map(star => (
            <TouchableOpacity key={star} onPress={() => setServRating(star)}>
              <MaterialCommunityIcons 
                name={star <= servRating ? 'star' : 'star-outline'} 
                size={32} 
                color={theme.colors.warning} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>
    </>
  );

  return (
    <BlurView style={[styles.blurContainer, {}]} intensity={100} tint={theme.mode === 'dark' ? 'dark' : 'light'}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.closeBtn, { backgroundColor: theme.colors.backgroundSec }]}
      >
        <Entypo name="cross" size={24} color={theme.colors.icon} />
      </TouchableOpacity>

      <View style={styles.tabBar}>
        {tabs.map((tab, index) => (
          <Pressable 
            key={tab.id} 
            style={[styles.tabItem, {borderBottomWidth: currentTab === tab.id ? 1.5:0, borderBottomColor: theme.colors.primary}]}
            onPress={() => handleTabChange(tab.id as typeof currentTab)}
          >
            <FontAwesome5 
              name={tab.icon} 
              size={20} 
              color={currentTab === tab.id ? theme.colors.primary : theme.colors.textSecondary} 
            />
            <ThemedText 
              style={[
                styles.tabLabel, 
                { color: currentTab === tab.id ? theme.colors.primary : theme.colors.textSecondary }
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
        {/* <Animated.View style={[styles.underline, underlineStyle, { backgroundColor: theme.colors.primary }]} /> */}
      </View>
      
      {currentTab === 'homes' && (
        <View style={[styles.tabBar2, {backgroundColor: theme.mode == 'light' ? '#e8e8e8': theme.colors.background2,}]}>
          <Pressable onPress={() => setPropertyType('rent')} style={[styles.tabItem2, {backgroundColor: propertyType === 'rent' ? theme.colors.backgroundSec: 'transparent'}]}>
            <ThemedText>Rent</ThemedText>
          </Pressable>
          <Pressable onPress={() => setPropertyType('sale')} style={[styles.tabItem2, {backgroundColor: propertyType === 'sale' ? theme.colors.backgroundSec: 'transparent'}]}>
            <ThemedText>Sale</ThemedText>
          </Pressable>
          <Pressable onPress={() => setPropertyType('sold')} style={[styles.tabItem2, {backgroundColor: propertyType === 'sold' ? theme.colors.backgroundSec: 'transparent'}]}>
            <ThemedText>Sold</ThemedText>
          </Pressable>
        </View>
      )}

      
      <View style={[styles.contentContainer, {overflow: 'hidden', flex: 1, }]}>
        {renderLocationSection()}
        {renderDatesSection()}
        {currentTab === 'homes' && renderHomesSpecific()}
        {/* <View style={{flex:1, backgroundColor: 'blue'}} /> */}
        {currentTab === 'experiences' && renderExperiencesSpecific()}
        {/* {currentTab === 'services' && renderServicesSpecific()} */}
      </View>

      <View style={[styles.footerActions, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity onPress={resetFilters}>
          <ThemedText type='defaultSemiBold' style={{ color: theme.colors.accent }}>Reset Filters</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.searchBtn, { backgroundColor: theme.colors.primary }]}
          onPress={performSearch}
        >
          <ThemedText type="defaultSemiBold" style={styles.searchBtnText}>Discover</ThemedText>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  tabBar2: {
    // flex: 1,
    flexDirection:'row',
    borderRadius: 7,
    marginBottom: 10,
    padding: 2
  },
  tabItem2: {padding: 5, flex:1, justifyContent: 'center', alignItems: 'center', borderRadius: 7},
  blurContainer: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 16,
    padding: 8,
    borderRadius: 50,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 9,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    position: 'relative',
    gap:10
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
    gap: 4,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 80,
    gap: 10,
    zIndex: 10
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  chipList: {
    gap: 8,
    paddingTop: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  chipText: {
    fontSize: 14,
  },
  datePicker: {
    padding: 12,
    borderRadius: 12,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  slider: {
    height: 40,
  },
  sliderValue: {
    textAlign: 'center',
    marginTop: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  footerActions: {
    zIndex:10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    // borderTopWidth: 1,
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    backgroundColor: 'transparent', // To blend with blur
  },
  searchBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default RedesignedSearch;

