import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    View,
    ViewProps
} from 'react-native';

import { useFormStore } from '@/stores/homeStore';
import { useTheme } from '@/theme/theme';
import WebView from 'react-native-webview';

const { width, height } = Dimensions.get('screen');

type MapProps = ViewProps & {}

const MapFAB = ({ style }: MapProps) => {
  const { theme } = useTheme();
  const { setField, address: AddressInitial } = useFormStore();

  const [initialCoords, setInitialCoords] = useState({ latitude: 0, longitude: 0 });
  const [markerCoords, setMarkerCoords]   = useState({ latitude: 0, longitude: 0 });
  const [showList, setShowList]           = useState(false);
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

 // Reverse‑geocode helper
  const fetchAddress = async (lat: number, lon: number) => {
    setLoadingAddress(true);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
      const r = await fetch(url);
      const j = await r.json();
      const addr = j.address || {};
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

  

  return (<>
     {/* <View style={{width, height: height-380, backgroundColor: 'red'}} /> */}
    
    <View style={[style, ]}>

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
    </View>
  </>);
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    height: '100%'
  },
  map: {
    flex: 1,
    // backgroundColor: 'transparent',
    height
  },
});

export default MapFAB;

// import React from 'react';
// import { Dimensions, StyleSheet, View, ViewStyle } from 'react-native';
// import WebView from 'react-native-webview';

// interface MapFABProps {
//   style?: ViewStyle;
// }
// const {width, height} = Dimensions.get('screen')
// const MapFAB: React.FC<MapFABProps> = ({ style }) => {
//   const html = `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//           html, body, #map { height: 100%; margin: 0; padding: 0; }
//         </style>
//         <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
//         <script>
//           function initMap() {
//             const map = new google.maps.Map(document.getElementById('map'), {
//               center: { lat: 37.7749, lng: -122.4194 },
//               zoom: 12,
//             });
//           }
//           window.onload = initMap;
//         </script>
//       </head>
//       <body>
//         <div id="map"></div>
//       </body>
//     </html>
//   `;

//   return (
//     <View style={[styles.container, style]}>
//       <WebView
//         source={{ html }}
//         style={styles.webview}
//         javaScriptEnabled={true}
//         domStorageEnabled={true}
//         startInLoadingState={true}
//         cacheEnabled={true}
//         cacheMode="LOAD_DEFAULT"
//         originWhitelist={['*']}
//       />
//     </View>
//     // <ThemedView style={styles.container}><ThemedText>9joijjjij</ThemedText></ThemedView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     width,
//     height,
//     backgroundColor: 'red'
//   },
//   webview: {
//     flex: 1,
//     backgroundColor: 'transparent',
//   },
// });

// export default MapFAB;