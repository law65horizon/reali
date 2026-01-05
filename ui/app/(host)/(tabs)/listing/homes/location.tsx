import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import PreviousNextUI from '@/components/ui/PreviousNextUI';
import { useHomeStore } from '@/stores/homeStore';
import { useTheme } from '@/theme/theme';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('screen');

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export interface AddressDetails {
  country?: string;
  state?: string;
  city?: string;
  postcode?: string;
  road?: string;
  display_name?: string;
  latitude?: number
  longitude?: number
}

const Location = () => {
  const { theme } = useTheme();
  const { setField, address: AddressInitial } = useHomeStore();

  const [initialCoords, setInitialCoords] = useState({ latitude: 0, longitude: 0 });
  const [markerCoords, setMarkerCoords]   = useState({ latitude: 0, longitude: 0 });
  const [query, setQuery]                 = useState('');
  const [suggestions, setSuggestions]     = useState<Suggestion[]>([]);
  const [showList, setShowList]           = useState(false);
  const [address, setAddress]             = useState<AddressDetails | null>(AddressInitial || null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // 1) Center via IP
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        const { latitude, longitude } = data;
        setInitialCoords({ latitude, longitude });
        setMarkerCoords({ latitude, longitude });
      })
      .catch(() => {
        setInitialCoords({ latitude: 6.5244, longitude: 3.3792 });
        setMarkerCoords({ latitude: 6.5244, longitude: 3.3792 });
      });
  }, []);

  // 2) Autocomplete
  useEffect(() => {
    if (query.length < 3) return setSuggestions([]);
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=5`
    )
      .then(r => r.json())
      .then((res: Suggestion[]) => setSuggestions(res))
      .catch(() => setSuggestions([]));
  }, [query]);

  // When user picks suggestion
  const onSuggestionPress = (item: Suggestion) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setMarkerCoords({ latitude: lat, longitude: lon });
    console.log(item)
    setQuery(item.display_name);
    setShowList(false);
    setAddress(item)
    // trigger reverse geocode below via onMessage workaround
  };

  // Reverse‑geocode helper
  const fetchAddress = async (lat: number, lon: number) => {
    setLoadingAddress(true);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
      const r = await fetch(url);
      const j = await r.json();
      const addr = j.address || {};
      const details: AddressDetails = {
        country: addr.country,
        state:   addr.state,
        city:    addr.city || addr.town || addr.village,
        postcode: addr.postcode,
        road:    addr.road,
        display_name: j.display_name,
      };
      console.log(details)
      setAddress(details);
      // setField('address', details);  // save into your form store
    } catch {
      // ignore
    } finally {
      setLoadingAddress(false);
    }
  };

  // Build HTML for WebView, injecting markerCoords
  const mapHTML = useMemo(() => {
    return `
      <!DOCTYPE html><html><head>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"/>
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
        <style>body,html,#map{margin:0;padding:0;height:100%;width:100%;}</style>
      </head><body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
          const lat = ${markerCoords.latitude};
          const lng = ${markerCoords.longitude};
          const map = L.map('map').setView([lat, lng], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          const marker = L.marker([lat, lng], { draggable:true }).addTo(map);
          marker.on('dragend', () => {
            const { lat, lng } = marker.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify({ lat, lng }));
          });
        </script>
      </body></html>
    `;
  }, [markerCoords.latitude, markerCoords.longitude]);

  // Handle messages from WebView when the marker is dragged
  const onWebMessage = (evt: any) => {
    try {
      const { lat, lng } = JSON.parse(evt.nativeEvent.data);
      setMarkerCoords({ latitude: lat, longitude: lng });
      console.log('chexi')
      fetchAddress(lat, lng);
    } catch {}
  };

  const handleNavigation = (dir: 'next' | 'prev') => {
    // at this point, address state contains your full address object
    setField('address', {...address, longitude: markerCoords?.longitude, latitude: markerCoords?.latitude})
    console.log('sosio')
    console.log('isos', address)
    if (!address ) return;
    router.push(dir === 'next' ? '/listing/homes/upload_media' : '/listing/homes/specialize');
  };

  return (
    <ThemedView plain secondary style={{ width, height, paddingVertical: 22 }}>
      <ThemedText style={{ marginBottom: 12, paddingHorizontal: 22 }}>
        Please pick your exact location
      </ThemedText>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
          placeholder="Search for address..."
          value={query}
          onChangeText={t => {
            setQuery(t);
            setShowList(true);
          }}
        />
        {showList && suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={i => i.lat + i.lon}
            style={[styles.suggestionList, { backgroundColor: theme.colors.background }]}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => onSuggestionPress(item)}
              >
                <ThemedText>{item.display_name}</ThemedText>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Leaflet map in a WebView */}
      <View style={styles.mapContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHTML }}
          style={styles.map}
          onMessage={onWebMessage}
        />
        {loadingAddress && (
          <ActivityIndicator
            size="large"
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>

      {/* Show collected address */}
      {address?.display_name ? (
        <View style={{ padding: 16 }}>
          <ThemedText>Street: {address.road}</ThemedText>
          <ThemedText>City: {address.city}</ThemedText>
          <ThemedText>State: {address.state}</ThemedText>
          <ThemedText>Postcode: {address.postcode}</ThemedText>
          <ThemedText>Country: {address.country}</ThemedText>
        </View>
      ) : null}

      <PreviousNextUI
        style={{ position: 'absolute', bottom: 100, width, zIndex: 1 }}
        prevFunc={() => handleNavigation('prev')}
        nextFunc={() => handleNavigation('next')}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    position: 'absolute',
    top: 60,
    left: 22,
    right: 22,
    zIndex: 10,
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  suggestionList: {
    marginTop: 4,
    borderRadius: 8,
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  mapContainer: {
    flex: 1,
    marginTop: 100,
    marginBottom: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default Location;
