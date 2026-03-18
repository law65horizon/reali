import { ThemedText } from '@/components/ThemedText';
import { useGetRecents } from '@/hooks/useGetRecentSearches';
import { useSearchStore } from '@/stores';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/theme/theme';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('screen');

const QUICK_SEARCH = gql`
  query QuickSearch($query: String, $latitude: Float, $longitude: Float, $radius: Float) {
    quickSearch(query: $query, latitude: $latitude, longitude: $longitude, radius: $radius) {
      quickSearch {
        city {
          id
          name
        }
        country {
          name
          id
        }
        geom
        id
        postal_code
        street
      }
      search_type
    }
  }
`

const ADD_TO_RECENTS = gql`
mutation Mutation($input: RecentSearchesInput) {
  addToRecents(input: $input) {
    city
    latitude
    longitude
    postal_code
    street
    tag
    userId
  }
}
`

type Segment = 'for-sale' | 'for-rent' | 'sold';
type SeachFields = 'city' | 'postal_code' | 'string'

const SUGGESTIONS = [
  '2 bedroom in Paris',
  'Homes near Central Park',
  'Beachfront apartment',
  'Modern condo in Berlin',
];

interface SubmitInput {
  type: 'recents' | 'search'
  searchType?: SeachFields,
  value: string,
  tag?: string
}

const RedesignedSearch = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string }>();

  const [query, setQuery] = useState<string>('');
  // const [query, setQuery] = useState<string>(params?.query || '');
  const [segment, setSegment] = useState<Segment>('for-sale');
  const [recent, setRecent] = useState<string[]>([]);
  const [usingLocation, setUsingLocation] = useState<boolean>(false);
  const [locationLabel, setLocationLabel] = useState<string>('Current Location');
  const [results, setResults] = useState([])
  const [searchType, setSearchType] = useState('')

  const [searchQuery, {loading: fetching, error: fetchError}] = useLazyQuery(QUICK_SEARCH)
  const [addToRecents, {loading: addingToRecents, error: addError}] = useMutation(ADD_TO_RECENTS)
  const {data: recentData, loading: loadingRecents, } = useGetRecents()
  const user = useAuthStore(state => state.user)
  const addToRecentsStore = useSearchStore(state => state.addToRecents)

  console.log({recentData})

  const inputRef = useRef<TextInput>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleChange = (text: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      runsearch(text)
    }, 600); 
  }

  const runsearch = async (query: string) => {
    if(query.trim()?.length < 3) return
    console.log('Searching for:', query);
    try {
      const st = performance.now()
      const {data} = await searchQuery({
        variables: {
          query: query
        }
      })
      const et = performance.now()
      console.log(`duration ms: `, et-st)

      console.log({data: data?.quickSearch.quickSearch})
      setResults(data?.quickSearch?.quickSearch)
      setSearchType(data?.quickSearch?.search_type)
      Keyboard.dismiss()
    } catch (error) {
      console.log(error)
    }
  }

  const getSearchValuePair = (recent:any): any => {
    if (recent.postal_code) return {search: "postal_code", value: recent.postal_code}
    if (recent.city) return {search: "city", value: recent.city}
  }

  console.log({user})
  // Fetch properties (mock-aware); filter locally for demo search UX
  // const { data, loading } = useProperties();
  const data:any = [];
  const loading = false
  // const results = useMemo(() => {
  //   if (!query) return [] as any[];
  //   const normalized = query.toLowerCase();
  //   return (data || []).filter((p: any) => {
  //     const inTitle = p.title?.toLowerCase().includes(normalized);
  //     const inCity = p.address?.city?.toLowerCase().includes(normalized);
  //     // simple segment filter demo: map status/category to segment
  //     const isSale = segment === 'for-sale';
  //     const isRent = segment === 'for-rent';
  //     const isSold = segment === 'sold';
  //     const status = (p.status || 'ACTIVE').toLowerCase();
  //     const bySegment = isSale ? status !== 'sold' : isRent ? true : status === 'sold';
  //     return bySegment && (inTitle || inCity);
  //   });
  // }, [data, query, segment]);

  const showLists = !query || (query && !results?.length && !loading);

  const handleSubmit = async(input: SubmitInput) => {
    const value = (input.value ?? query).trim();
    console.log({value})
    if (!value) return;

    if (input.type == 'search') {
      if (!input.searchType || !input.tag) return
      try {
        addToRecentsStore({
          tag: input.tag, 
          timestamp: Date.now(), 
          [input.searchType]: input.value
        })
        if (!user) return
        addToRecents({
          variables: {
            input: {
              userId: user.id,
              tag: input.tag,
              [input.searchType]: input.value
            }
          }
        })
      } catch (error) {
        
      }
    }
    
    console.log({value}, [input.searchType ||searchType])
    // setRecent((prev) => [value, ...prev.filter((v) => v !== value)].slice(0, 8));
    router.dismissAll()
    router.push({
      pathname: '/(guest)/(tabs)/home/(search)/[query]',
      params: { query: JSON.stringify({[input.searchType ||searchType]: value, sale_status: segment === 'for-rent' ? 'rent': segment === 'for-sale' ? 'sale': segment}) }
    });
    console.log('sisioi')
    Keyboard.dismiss();
  };

  const requestLocation = async () => {
    try {
      setUsingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setUsingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      console.log({cords: loc.coords})
      const geocoded = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      const first = geocoded?.[0];
      const label = [first?.city, first?.region, first?.country].filter(Boolean).join(', ');
      const pretty = label || 'Current Location';
      setLocationLabel(pretty);
      setQuery(pretty);
    } catch (e) {
      setUsingLocation(false)
      // ignore for now
    } finally {
      setUsingLocation(false);
      inputRef.current?.focus();
    }
  };

  const renderSegment = (key: Segment, label: string, divider?: boolean) => (
    <>
      {/* {divider && segment !== key && <View style={[styles.segmentDivider, { backgroundColor: theme.colors.border }]} />} */}
      <Pressable
        onPress={() => setSegment(key)}
        style={[styles.segmentButton, {
          backgroundColor: segment === key ? theme.mode == 'dark' ? theme.colors.background2: theme.colors.background: 'transparent',
          borderColor: theme.colors.border,
          borderWidth: 0,
          flex: 1
        }]}
        accessibilityRole="button"
        accessibilityState={{ selected: segment === key }}
      >
        <ThemedText type="defaultSemiBold" style={{ color: theme.colors.text, }}>{label}</ThemedText>
      </Pressable>
      {/* {divider && segment == 'sold' ? <View style={[styles.segmentDivider, { backgroundColor: theme.colors.border }]} />: null}
      {divider && segment == 'for-rent' ? <View style={[styles.segmentDivider, { backgroundColor: theme.colors.border }]} />: null} */}
    </>
  );

  function ListElement(item:any, tag:string) {
    switch (tag) {
      case 'city': {
        return (
          <View style={{justifyContent: 'space-between', height: 40, flex:1}}>
            <ThemedText style={{ marginLeft: 10, textTransform: 'capitalize' }}>{item?.city?.name}</ThemedText>
            <ThemedText style={{ marginLeft: 10, textTransform: 'capitalize', color: theme.colors.textSecondary }}>{item?.country?.name} </ThemedText>
          </View>
        )
      }
      case 'postal_code': {
        return (
          <View style={{justifyContent: 'space-between', height: 40}}>
            <ThemedText style={{ marginLeft: 10 }}>{item.postal_code}</ThemedText>
            <ThemedText style={{ marginLeft: 10, color: theme.colors.textSecondary }}>{item?.city?.name}, {item.country?.name} </ThemedText>
          </View>
        )
      }
      default: {
        return (
          <View style={{justifyContent: 'space-between', height: 40}}>
            <ThemedText style={{ marginLeft: 10 }}>{item.street}</ThemedText>
            <ThemedText style={{ marginLeft: 10, color: theme.colors.textSecondary }}>{item?.city?.name}, {item.country?.name} </ThemedText>
          </View>
        )
      }
    }
  }

  const ListHeader = (
    <View style={{ paddingHorizontal: 16, gap: 12 }}>
      

      {/* Current Location */}
      

      {/* {showLists && ( */}
        <>
          <ThemedText type="defaultSemiBold" style={{ marginVertical: 8 }}>{showLists? "Recents": "Search results"}</ThemedText>
        </>
      {/* )} */}
    </View>
  );

  const dataToRender = showLists
    ? recentData?.map((r:any, index:number) => ({ type: 'recent', id: `recent-${index}`, title: r.tag, ...r }))
        .concat(SUGGESTIONS?.map((s) => ({ type: 'suggest', id: `s-${s}`, title: s })))
    : results
    // : results.map((item: any) => ({ type: 'result', id: item.id, title: `${item.street} • ${item?.city_name}` }));

  const renderItem = ({ item, index }: {item: any, index: number}) => {
    if (item.type === 'recent' || item.type === 'suggest') {
      return (
        <Pressable
          onPress={() => { setQuery(item.title); handleSubmit(item.title); }}
          style={[styles.row, { borderColor: theme.colors.border, backgroundColor: theme.colors.card, marginTop: 0, }]}
        >
          <Ionicons name={item.type === 'recent' ? 'time-outline' : 'sparkles-outline'} size={18} color={theme.colors.textSecondary} />
          <ThemedText style={{ marginLeft: 10 }}>{item.title}</ThemedText>
        </Pressable>
      );
    }
    return (
      <TouchableOpacity
        onPress={() => handleSubmit({
          searchType: searchType as SeachFields,
          type: 'search',
          value: searchType == 'city'? item?.city?.id :
            searchType == 'postal_code'? item.postal_code: 
            item.geom,
          tag: searchType == 'city'? item?.city?.name :
            searchType == 'postal_code'? item.postal_code: 
            item.street
          },
        )}
        style={[styles.row, {borderWidth: 0, marginTop: 0, paddingHorizontal: 5, paddingVertical: 8}]}
      >
        <Ionicons name="home-outline" size={18} color={theme.colors.textSecondary} style={{backgroundColor: 'rgba(179, 223, 217, 0.9)', padding: 15, borderRadius: 8, }} />
        {ListElement(item, searchType)}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={{ paddingHorizontal: 16, gap: 12, paddingBottom: 0}}>
        {/* Top bar */}
        <View style={[styles.searchRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }] }>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" style={styles.backIcon}>
            <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Search homes, cities, or addresses"
            placeholderTextColor={theme.colors.textSecondary}
            value={query}
            onChangeText={(t) => {
              setQuery(t)
              handleChange(t)
            }}
            returnKeyType="none"
            // onSubmitEditing={() => handleSubmit}
            autoFocus
          />
          {query?.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={styles.clearIcon} accessibilityRole="button">
               <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Segmented control */}
        <View style={[{ borderColor: theme.colors.border, backgroundColor: theme.colors.backgroundSec, borderRadius: 10 }]}>
          <View style={styles.segmentInner}>
            {renderSegment('for-rent', 'For Rent', true )}
            {renderSegment('for-sale', 'For Sale', true)}
            {renderSegment('sold', 'Sold',)}
          </View>
        </View>
        {/* Lists header */}

        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8,}}>
          <Pressable onPress={requestLocation} style={[styles.locationRow, {flex: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]} accessibilityRole="button">
            <MaterialCommunityIcons name="crosshairs-gps" color={theme.colors.accent} size={20} />
            <ThemedText type="defaultSemiBold" style={{ flex:1, marginLeft: 10 }}>{locationLabel}</ThemedText>
            {usingLocation && <ActivityIndicator animating={usingLocation} size="small" color={theme.colors.accent} />}
          </Pressable>
          <TouchableOpacity style={{ }}>
            <Ionicons name='earth-sharp' size={35} color={theme.colors.accent} />
            {/* <Earth /> */}
          </TouchableOpacity>
        </View>
        {/* <Line orientation='horizontal' /> */}
      </View>
      {showLists ? (<>
        {ListHeader}
        <View style={{marginHorizontal: 12, borderWidth: 1, gap: 0, borderRadius: 16, borderColor: theme.colors.border}}>
          {dataToRender?.map((item: any, index: any) => (
            <Pressable 
              onPress={() => handleSubmit({type: 'recents', value: getSearchValuePair(item)?.value, searchType: getSearchValuePair(item)?.search})} key={index}
              style={{padding: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: index+1== dataToRender?.length ? 0:1, borderColor: theme.colors.border}}
            >
              <Ionicons name={item.type === 'recent' ? 'time-outline' : 'sparkles-outline'} size={22} color={theme.colors.accent} />
              <ThemedText style={{ marginLeft: 10, textTransform: 'capitalize', width: '100%' }}>{item.title}</ThemedText>
            </Pressable>
          ))}
        </View>
      </>):(
        <FlatList
          keyboardShouldPersistTaps="handled"
          data={results}
          keyExtractor={(it: any) => it.id || it.city.id}
          ListHeaderComponent={ListHeader}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: Platform.select({ ios: 84, android: 124 }), }}
          ListFooterComponent={loading && query ? (
            <View style={{ padding: 16 }}>
              <ActivityIndicator color={theme.colors.accent} />
            </View>
          ) : null}
        /> 
      )}
      
      <TouchableOpacity onPress={() => handleSubmit({value: query, type: 'search'})} 
        style={[styles.submitButton, { backgroundColor: theme.colors.text,}]}
      >
        <ThemedText style={{fontSize: 16, color: theme.colors.background, textAlign: 'center'}}>Search {`202+`}</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  submitButton: {
    position: 'absolute', bottom:  20, flex: 1, height: 60, width: '90%', alignSelf: 'center', borderRadius: 30, alignItems:'center', justifyContent:'center',
  },
  container: {
    flex: 1,
    paddingTop: 60
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    height: 44,
    marginTop: 8,
  },
  backIcon: {
    padding: 4,
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  clearIcon: {
    paddingHorizontal: 4,
  },
  segmentContainer: {
    marginTop: 10,
    borderWidth: 1,
  },
  segmentInner: {
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  segmentDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginTop: 10,
    marginBottom: 5,
    // flex: 1
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
});

export default RedesignedSearch;

