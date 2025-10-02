import PreviousNextUI from "@/components/ui/PreviousNextUI";
import { useExperienceStore } from "@/store/experienceStore";
import { useTheme } from "@/theme/theme";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { EventRegister } from "react-native-event-listeners";
import Animated, { SlideInUp, SlideOutDown } from "react-native-reanimated";
import { WebView } from "react-native-webview";

type AddressDetails = {
  country?: string;
  state?: string;
  city?: string;
  street?: string;
  postcode?: string;
  road?: string;
  display_name?: string;
  latitude?: number;
  longitude?: number;
};

const {width } = Dimensions.get('screen')

export default function LocationScreen() {
  const { theme } = useTheme();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    postcode: "",
  });
  const [markerCoords, setMarkerCoords] = useState({
    latitude: 0,
    longitude: 0,
  });
  const { setField, address: AddressInitial } = useExperienceStore();
  const [address, setAddress] = useState<AddressDetails | null>(AddressInitial || null);
  const [loadingAddress, setLoadingAddress] = useState(false);


  useEffect(() => {
    const unsubscribe: any = EventRegister.addEventListener('LOCA_SAVE', data => {
      console.log('isojswio')
      save_state()
    } )

    return () => {
      EventRegister.removeEventListener(unsubscribe)
    };
  }, [address]);

  const save_state = () => {
    if (address === AddressInitial) return;
    setField('address', address);
  }

  // preload approximate location
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        const { latitude, longitude } = data;
        setMarkerCoords({ latitude, longitude });
      })
      .catch(() => {
        setMarkerCoords({ latitude: 6.5244, longitude: 3.3792 }); // fallback: Lagos
      });
  }, []);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNavigation = (dir: 'next' | 'prev') => {
    if (dir === 'next' && !address) return;
    // setField('availability', { ...address });
    setField('address', address);
    router.push(dir === 'next' ? '/(host)/(tabs)/listing/experiences/aboutYou' : '/(host)/(tabs)/listing/experiences/experienceBasics');
  };


  const handleFormSubmit = async () => {
    const query = `${formData.street}, ${formData.city}, ${formData.state}, ${formData.country} ${formData.postcode}`;
    setLoadingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`
      );
      const data = await res.json();
      if (data[0]) {
        const { lat, lon } = data[0];
        setMarkerCoords({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        });
        setIsMapOpen(true);
        fetchAddress(parseFloat(lat), parseFloat(lon));
      }
    } finally {
      setLoadingAddress(false);
    }
  };

  const fetchAddress = async (lat: number, lon: number) => {
    setLoadingAddress(true);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
      const r = await fetch(url);
      const j = await r.json();
      const addr = j.address || {};
      const details: AddressDetails = {
        country: addr.country,
        state: addr.state,
        city: addr.city || addr.town || addr.village,
        postcode: addr.postcode,
        road: addr.road,
        display_name: j.display_name,
        latitude: lat,
        longitude: lon,
      };
      setAddress(details);
    } finally {
      setLoadingAddress(false);
    }
  };

  // 🔹 Use expo-location to fetch user location
  const handleUseCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission denied to access location");
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;
    setMarkerCoords({ latitude, longitude });
    setIsMapOpen(true);
    fetchAddress(latitude, longitude);
  };

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
          const map = L.map('map').setView([lat, lng], 16);

          // 🔹 Switch to a tileset with landmarks/buildings
          L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',{
            maxZoom: 20,
            attribution: '&copy; OpenStreetMap contributors, HOT'
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

  const onWebMessage = (evt: any) => {
    try {
      const { lat, lng } = JSON.parse(evt.nativeEvent.data);
      setMarkerCoords({ latitude: lat, longitude: lng });
      fetchAddress(lat, lng);
    } catch {}
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 12, paddingBottom: 100, }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16, color: theme.colors.text }}>
          Enter your address
        </Text>

        {["street", "city", "state", "country", "postcode"].map((field) => (
          <TextInput
            key={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            placeholderTextColor={theme.colors.textSecondary}
            value={formData[field as keyof typeof formData]}
            onChangeText={(text) => handleChange(field, text)}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 10,
              padding: 14,
              marginBottom: 12,
              fontSize: 16,
              color: theme.colors.text,
              backgroundColor: theme.colors.card,
              shadowColor: theme.colors.shadow,
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          />
        ))}

        {/* Locate button */}
        <TouchableOpacity
          onPress={handleFormSubmit}
          style={{
            backgroundColor: theme.colors.primary,
            padding: 16,
            borderRadius: 10,
            alignItems: "center",
            marginTop: 10,
          }}
        >
          {loadingAddress ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Locate on Map
            </Text>
          )}
        </TouchableOpacity>

        {/* Use Current Location button */}
        <TouchableOpacity
          onPress={handleUseCurrentLocation}
          style={{
            backgroundColor: theme.colors.accent,
            padding: 16,
            borderRadius: 10,
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            Use Current Location
          </Text>
        </TouchableOpacity>

        

        {address && (
          <View
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 14,
              backgroundColor: theme.colors.backgroundSec,
            }}
          >
            <Text style={{ fontWeight: "700", fontSize: 16, color: theme.colors.text }}>
              Resolved Address
            </Text>
            <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
              {address.display_name}
            </Text>
          </View>
        )}
      </ScrollView>

      <PreviousNextUI
          style={styles.navigation}
          prevFunc={() => handleNavigation('prev')}
          nextFunc={() => handleNavigation('next')}
          disabled={!address}
      />

      {/* Map Modal */}
      <Modal visible={isMapOpen} transparent animationType="none">
        <Animated.View
          entering={SlideInUp.springify().damping(15)}
          exiting={SlideOutDown}
          style={{
            flex: 1,
            backgroundColor: theme.colors.card,
            // paddingVertical:
            overflow: "hidden",
            paddingTop: 60
          }}
        >
          <View style={{ flex: 1, }}>
            <WebView
              source={{ html: mapHTML }}
              onMessage={onWebMessage}
              style={{ flex: 1, borderTopLeftRadius: 24,
            borderTopRightRadius: 24,}}
            />
          </View>
          <TouchableOpacity
            onPress={() => setIsMapOpen(false)}
            style={{
              padding: 16,
              alignItems: "center",
              backgroundColor: theme.colors.primary,
              paddingBottom: 30
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Confirm Location
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  navigation: { position: 'absolute', bottom: 0, width, zIndex: 1,  },
})


// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import PreviousNextUI from '@/components/ui/PreviousNextUI';
// import { useExperienceStore } from '@/store/experienceStore';
// import { useTheme } from '@/theme/theme';
// import { router } from 'expo-router';
// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   ActivityIndicator,
//   Dimensions,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import WebView from 'react-native-webview';
// // import Icon from 'react-native-vector-icons/MaterialIcons';

// const { width, height } = Dimensions.get('window');

// interface AddressDetails {
//   country?: string;
//   state?: string;
//   city?: string;
//   postcode?: string;
//   road?: string;
//   display_name?: string;
//   latitude?: number;
//   longitude?: number;
// }

// const LocationScreen = () => {
//   const { theme } = useTheme();
//   const { setField, address: AddressInitial } = useExperienceStore();

//   const [isMapOpen, setIsMapOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     street: '',
//     city: '',
//     state: '',
//     country: '',
//     postcode: '',
//   });
//   const [markerCoords, setMarkerCoords] = useState({ latitude: 0, longitude: 0 });
//   const [address, setAddress] = useState<AddressDetails | null>(AddressInitial || null);
//   const [loadingAddress, setLoadingAddress] = useState(false);

//   useEffect(() => {
//     fetch('https://ipapi.co/json/')
//       .then(r => r.json())
//       .then(data => {
//         const { latitude, longitude } = data;
//         setMarkerCoords({ latitude, longitude });
//       })
//       .catch(() => {
//         setMarkerCoords({ latitude: 6.5244, longitude: 3.3792 });
//       });
//   }, []);

//   const handleFormSubmit = async () => {
//     const query = `${formData.street}, ${formData.city}, ${formData.state}, ${formData.country} ${formData.postcode}`;
//     setLoadingAddress(true);
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
//       );
//       const data = await res.json();
//       if (data[0]) {
//         const { lat, lon } = data[0];
//         setMarkerCoords({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
//         setIsMapOpen(true);
//         fetchAddress(parseFloat(lat), parseFloat(lon));
//       }
//     } catch {
//       // Handle error silently
//     } finally {
//       setLoadingAddress(false);
//     }
//   };

//   const fetchAddress = async (lat: number, lon: number) => {
//     setLoadingAddress(true);
//     try {
//       const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
//       const r = await fetch(url);
//       const j = await r.json();
//       const addr = j.address || {};
//       const details: AddressDetails = {
//         country: addr.country,
//         state: addr.state,
//         city: addr.city || addr.town || addr.village,
//         postcode: addr.postcode,
//         road: addr.road,
//         display_name: j.display_name,
//         latitude: lat,
//         longitude: lon,
//       };
//       setAddress(details);
//       setField('address', details);
//     } finally {
//       setLoadingAddress(false);
//     }
//   };

//   const mapHTML = useMemo(() => {
//     return `
//       <!DOCTYPE html><html><head>
//         <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"/>
//         <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
//         <style>body,html,#map{margin:0;padding:0;height:100%;width:100%;}</style>
//       </head><body>
//         <div id="map"></div>
//         <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
//         <script>
//           const lat = ${markerCoords.latitude};
//           const lng = ${markerCoords.longitude};
//           const map = L.map('map').setView([lat, lng], 15);
//           L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
//             maxZoom: 19,
//             attribution: '&copy; OpenStreetMap contributors'
//           }).addTo(map);
//           const marker = L.marker([lat, lng], { draggable:true }).addTo(map);
//           marker.on('dragend', () => {
//             const { lat, lng } = marker.getLatLng();
//             window.ReactNativeWebView.postMessage(JSON.stringify({ lat, lng }));
//           });
//         </script>
//       </body></html>
//     `;
//   }, [markerCoords.latitude, markerCoords.longitude]);

//   const onWebMessage = (evt: any) => {
//     try {
//       const { lat, lng } = JSON.parse(evt.nativeEvent.data);
//       setMarkerCoords({ latitude: lat, longitude: lng });
//       fetchAddress(lat, lng);
//     } catch {}
//   };

//   const handleNavigation = (dir: 'next' | 'prev') => {
//     if (dir === 'next' && !address) return;
//     setField('availability', { ...address });
//     router.push(dir === 'next' ? '/(host)/(tabs)/listing/experiences/aboutYou' : '/(host)/(tabs)/listing/experiences/experienceBasics');
//   };

//   return (
//     <ThemedView plain secondary style={styles.container}>
//       <ThemedText style={styles.header}>Enter Your Location</ThemedText>

//       {/* Accordion Toggle */}
//       {isMapOpen &&
//       <TouchableOpacity
//         style={[styles.accordionHeader, { backgroundColor: theme.colors.backgroundSec }]}
//         onPress={() => setIsMapOpen(!isMapOpen)}
//       >
//         <ThemedText>{isMapOpen ? 'Edit Address' : 'View Map'}</ThemedText>
//         {/* <Icon name={isMapOpen ? 'expand-more' : 'expand-less'} size={24} color={theme.colors.text} /> */}
//       </TouchableOpacity>
//      }

//       {/* Form Section */}
//       {!isMapOpen && (
//         <View style={styles.formContainer}>
//           <View style={{gap: 10}}>
//           {['street', 'city', 'state', 'country', 'postcode'].map((field) => (
//             <View key={field} style={styles.inputWrapper}>
//               <TextInput
//                 style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
//                 placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
//                 value={formData[field as keyof typeof formData]}
//                 onChangeText={(text) => setFormData({ ...formData, [field]: text })}
//               />
              
//             </View>
//           ))}
//           </View>
//           <TouchableOpacity
//             style={[styles.confirmButton, { backgroundColor: theme.colors.primary }]}
//             // onPress={handleFormSubmit}
//             onPress={() => setIsMapOpen(true)}
//             disabled={loadingAddress}
//           >
//             <ThemedText style={styles.buttonText}>Confirm Address</ThemedText>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Map Section */}
//       {isMapOpen && (
//         <View style={[styles.mapContainer, {backgroundColor: theme.colors.background}]}>
//           <WebView
//             originWhitelist={['*']}
//             source={{ html: mapHTML }}
//             style={styles.map}
//             onMessage={onWebMessage}
//           />
//           {loadingAddress && <ActivityIndicator size="large" style={StyleSheet.absoluteFill} />}
//           {address?.display_name && (
//             <View style={styles.addressPreview}>
//               <ThemedText>{address.display_name}</ThemedText>
//             </View>
//           )}
//         </View>
//       )}

//       <PreviousNextUI
//         style={styles.navigation}
//         prevFunc={() => handleNavigation('prev')}
//         nextFunc={() => handleNavigation('next')}
//       />
//     </ThemedView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { width, height, paddingVertical: 22, },
//   header: { marginBottom: 12, paddingHorizontal: 10 },
//   accordionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     marginHorizontal: 0,
//     marginBottom: 12,
//   },
//   formContainer: { paddingHorizontal: 10, flex:1, justifyContent: 'space-between', paddingBottom: 160 },
//   inputWrapper: { flexDirection: 'row', alignItems: 'center', },
//   input: {
//     flex: 1,
//     height: 50,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//   },
//   tipButton: { padding: 8 },
//   confirmButton: {
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   buttonText: { color: '#fff' },
//   mapContainer: { flex: 1, marginHorizontal: 10, borderRadius: 12, marginBottom: 170  },
//   map: { flex: 1, backgroundColor: 'transparent', borderRadius: 8 },
//   addressPreview: { padding: 12, borderEndStartRadius: 8, borderEndEndRadius: 8 },
//   navigation: { position: 'absolute', bottom: 90, width, zIndex: 1,  },
// });

// export default LocationScreen;