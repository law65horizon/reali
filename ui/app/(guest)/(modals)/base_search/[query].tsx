import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
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

type Segment = 'for-sale' | 'for-rent' | 'sold';

const SUGGESTIONS = [
  '2 bedroom in Paris',
  'Homes near Central Park',
  'Beachfront apartment',
  'Modern condo in Berlin',
];

const RedesignedSearch = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string }>();

  const [query, setQuery] = useState<string>('');
  // const [query, setQuery] = useState<string>(params?.query || '');
  const [segment, setSegment] = useState<Segment>('for-sale');
  const [recent, setRecent] = useState<string[]>(['London', 'Tokyo loft', 'Affordable homes']);
  const [usingLocation, setUsingLocation] = useState<boolean>(false);
  const [locationLabel, setLocationLabel] = useState<string>('Current Location');

  const inputRef = useRef<TextInput>(null);

  // Fetch properties (mock-aware); filter locally for demo search UX
  // const { data, loading } = useProperties();
  const data:any = [];
  const loading = false
  const results = useMemo(() => {
    if (!query) return [] as any[];
    const normalized = query.toLowerCase();
    return (data || []).filter((p: any) => {
      const inTitle = p.title?.toLowerCase().includes(normalized);
      const inCity = p.address?.city?.toLowerCase().includes(normalized);
      // simple segment filter demo: map status/category to segment
      const isSale = segment === 'for-sale';
      const isRent = segment === 'for-rent';
      const isSold = segment === 'sold';
      const status = (p.status || 'ACTIVE').toLowerCase();
      const bySegment = isSale ? status !== 'sold' : isRent ? true : status === 'sold';
      return bySegment && (inTitle || inCity);
    });
  }, [data, query, segment]);

  const showLists = !query || (query && !results.length && !loading);

  const handleSubmit = (text?: string) => {
    const value = (text ?? query).trim();
    // if (!value) return;
    // setRecent((prev) => [value, ...prev.filter((v) => v !== value)].slice(0, 8));
    // router.push({
    //   pathname: '/(guest)/(tabs)/home/(search)/[query]',
    //   params: {query: JSON.stringify('')}
    // })
    // router.push('/(guest)/(tabs)/home/(search)/[query]')
    router.dismissAll()
    router.push({
      pathname: '/(guest)/(tabs)/home/(search)/[query]',
      params: { query: JSON.stringify('') }
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
      console.log(loc.coords)
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
        <ThemedText type="defaultSemiBold" style={{ color: theme.colors.text }}>{label}</ThemedText>
      </Pressable>
      {/* {divider && segment == 'sold' ? <View style={[styles.segmentDivider, { backgroundColor: theme.colors.border }]} />: null}
      {divider && segment == 'for-rent' ? <View style={[styles.segmentDivider, { backgroundColor: theme.colors.border }]} />: null} */}
    </>
  );

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
    ? recent.map((r) => ({ type: 'recent', id: `recent-${r}`, title: r }))
        .concat(SUGGESTIONS.map((s) => ({ type: 'suggest', id: `s-${s}`, title: s })))
    : results.map((p: any) => ({ type: 'result', id: p.id, title: `${p.title} • ${p.address?.city}` }));

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
        onPress={() => handleSubmit()}
        style={[styles.row, {borderWidth: 0, marginTop: 0, paddingHorizontal: 5, paddingVertical: 8}]}
      >
        <Ionicons name="home-outline" size={18} color={theme.colors.textSecondary} style={{backgroundColor: 'rgba(179, 223, 217, 0.9)', padding: 15, borderRadius: 8, }} />
        <View style={{justifyContent: 'space-between', height: 40}}>
          <ThemedText type='defaultSemiBold' style={{ marginLeft: 10 }}>{item.title}</ThemedText>
          <ThemedText style={{ marginLeft: 10 }}>Lorem ipsum dolor sit </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={{ paddingHorizontal: 16, gap: 12, paddingBottom: 20}}>
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
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => handleSubmit}
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
            {usingLocation && <ActivityIndicator size="small" color={theme.colors.accent} />}
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
          {dataToRender.map((item: any, index: any) => (
            <Pressable 
              onPress={() => handleSubmit()} key={index}
              style={{padding: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: index+1== dataToRender.length ? 0:1, borderColor: theme.colors.border}}
            >
              <Ionicons name={item.type === 'recent' ? 'time-outline' : 'sparkles-outline'} size={22} color={theme.colors.accent} />
              <ThemedText style={{ marginLeft: 10 }}>{item.title}</ThemedText>
            </Pressable>
          ))}
        </View>
      </>):(
        <FlatList
          keyboardShouldPersistTaps="handled"
          data={dataToRender}
          keyExtractor={(it: any) => it.id}
          ListHeaderComponent={ListHeader}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: Platform.select({ ios: 24, android: 16 }), }}
          ListFooterComponent={loading && query ? (
            <View style={{ padding: 16 }}>
              <ActivityIndicator color={theme.colors.accent} />
            </View>
          ) : null}
        /> 
      )}
      {/* <FlatList
        keyboardShouldPersistTaps="handled"
        data={dataToRender}
        keyExtractor={(it: any) => it.id}
        ListHeaderComponent={ListHeader}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: Platform.select({ ios: 24, android: 16 }), }}
        ListFooterComponent={loading && query ? (
          <View style={{ padding: 16 }}>
            <ActivityIndicator color={theme.colors.accent} />
          </View>
        ) : null}
      /> */}
      {/* {ListHeader}
      <View style={{marginHorizontal: 12, borderWidth: 1, gap: 0, borderRadius: 16, borderColor: theme.colors.border}}>
        {dataToRender.map((item: any, index: any) => (
          <Pressable style={{padding: 12, flexDirection: 'row', borderBottomWidth: index+1== dataToRender.length ? 0:1, borderColor: theme.colors.border}}>
            <Ionicons name={item.type === 'recent' ? 'time-outline' : 'sparkles-outline'} size={22} color={theme.colors.accent} />
            <ThemedText style={{ marginLeft: 10 }}>{item.title}</ThemedText>
          </Pressable>
        ))}
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
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

