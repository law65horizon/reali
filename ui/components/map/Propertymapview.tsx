// components/map/PropertyMapView.tsx
//
// ✅ Works in Expo Go WITHOUT a Google Maps API key
// ✅ No react-native-map-clustering (pure JS clustering built-in)
// ✅ Reliable circle draw: tap to set center → slider to set radius → Apply
//
// Only peer dep needed:
//   npx expo install react-native-maps
//

import { useTheme } from '@/theme/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Circle, Marker, Region } from 'react-native-maps';

const { width, height } = Dimensions.get('screen');

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

interface RoomTypeProperty {
  address: Address;
}

export interface RoomType {
  id: string;
  property: RoomTypeProperty;
  base_price?: number;
  beds?: number;
  baths?: number;
  images?: { url: string }[];
  category?: string;
  type?: string;
}

export interface CircleArea {
  latitude: number;
  longitude: number;
  radius: number; // metres
}

interface PropertyMapViewProps {
  properties: RoomType[];
  onCircleChange?: (circle: CircleArea | null) => void;
}

// ─── Pure-JS Clustering ───────────────────────────────────────────────────────
// Groups nearby markers into clusters without any native dependency.

interface RawMarker {
  id: string;
  latitude: number;
  longitude: number;
  price: number;
}

interface ClusterItem {
  type: 'marker' | 'cluster';
  latitude: number;
  longitude: number;
  id?: string;
  price?: number;
  count?: number;
}

function clusterMarkers(markers: RawMarker[], region: Region): ClusterItem[] {
  // console.log({markers})
  const CLUSTER_RADIUS_PX = 50;
  const latPerPx = region.latitudeDelta / height;
  const lngPerPx = region.longitudeDelta / width;
  const clusterRadiusLat = CLUSTER_RADIUS_PX * latPerPx;
  const clusterRadiusLng = CLUSTER_RADIUS_PX * lngPerPx;

  const visited = new Set<string>();
  const result: ClusterItem[] = [];

  for (const marker of markers) {
    if (visited.has(marker.id)) continue;

    const neighbours = markers.filter(
      (m) =>
        !visited.has(m.id) &&
        Math.abs(m.latitude - marker.latitude) < clusterRadiusLat &&
        Math.abs(m.longitude - marker.longitude) < clusterRadiusLng
    );

    if (neighbours.length === 1) {
      visited.add(marker.id);
      result.push({
        type: 'marker',
        latitude: marker.latitude,
        longitude: marker.longitude,
        id: marker.id,
        price: marker.price,
      });
    } else {
      const avgLat =
        neighbours.reduce((s, m) => s + m.latitude, 0) / neighbours.length;
      const avgLng =
        neighbours.reduce((s, m) => s + m.longitude, 0) / neighbours.length;
      neighbours.forEach((m) => visited.add(m.id));
      result.push({
        type: 'cluster',
        latitude: avgLat,
        longitude: avgLng,
        count: neighbours.length,
      });
    }
  }

  return result;
}

// ─── PriceMarker ──────────────────────────────────────────────────────────────

const PriceMarker = React.memo(
  ({ price, selected, theme }: { price: number; selected: boolean; theme: any }) => (
    <View
      style={[
        styles.priceMarker,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.background,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <Text style={[styles.priceMarkerText, { color: selected ? '#fff' : theme.colors.text }]}>
        ${price >= 1000 ? `${(price / 1000).toFixed(0)}k` : price}
      </Text>
    </View>
  )
);

// ─── ClusterMarker ────────────────────────────────────────────────────────────

const ClusterMarker = React.memo(({ count, theme }: { count: number; theme: any }) => (
  <View style={[styles.clusterMarker, { backgroundColor: theme.colors.primary }]}>
    <Text style={styles.clusterMarkerText}>{count}</Text>
  </View>
));

// ─── FloatingPropertyCard ─────────────────────────────────────────────────────

const FloatingPropertyCard = React.memo(
  ({
    property,
    slideAnim,
    theme,
    onDismiss,
  }: {
    property: RoomType;
    slideAnim: Animated.Value;
    theme: any;
    onDismiss: () => void;
  }) => {
    const price = property.base_price ?? 0;
    const beds = property.beds ?? 2;
    const baths = property.baths ?? 1;
    const city = property.property?.address?.city ?? '';
    const imageUrl = property.images?.[0]?.url ?? null;
    const type = (property.category ?? property.type ?? 'Home') as string;

    return (
      <Animated.View
        style={[
          styles.floatingCard,
          {
            backgroundColor: theme.colors.background,
            transform: [{ translateY: slideAnim }],
            shadowColor: '#000',
          },
        ]}
      >
        <Pressable
          style={[styles.dismissButton, { backgroundColor: theme.colors.backgroundSec }]}
          onPress={onDismiss}
          hitSlop={8}
        >
          <Ionicons name="close" size={16} color={theme.colors.text} />
        </Pressable>

        <Pressable
          style={styles.floatingCardInner}
          onPress={() =>
            router.push({
              pathname: '/(guest)/(modals)/experienceDetail/[query]',
              params: { query: property.id },
            })
          }
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.floatingCardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.floatingCardImage, { backgroundColor: theme.colors.border }]} />
          )}

          <View style={styles.floatingCardInfo}>
            <Text
              style={[styles.floatingCardPrice, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              ${price?.toLocaleString()}
              {type === 'apartment' ? '/mo' : ''}
            </Text>
            <Text
              style={[styles.floatingCardMeta, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {beds} bd · {baths} ba{city ? ` · ${city}` : ''}
            </Text>
            <View style={[styles.typePill, { backgroundColor: theme.colors.border }]}>
              <Text style={[styles.typePillText, { color: theme.colors.text }]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
            style={{ alignSelf: 'center', marginRight: 4 }}
          />
        </Pressable>
      </Animated.View>
    );
  }
);

// ─── Custom touch-based Slider (no external dep) ─────────────────────────────

const MAX_RADIUS_M = 20000;

const SliderTrack = ({
  value,
  min,
  max,
  color,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  color: string;
  onChange: (v: number) => void;
}) => {
  const trackWidthRef = useRef(0);
  const pct = (value - min) / (max - min);

  return (
    <Pressable
      onLayout={(e) => { trackWidthRef.current = e.nativeEvent.layout.width; }}
      onPress={(e) => {
        if (!trackWidthRef.current) return;
        const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / trackWidthRef.current));
        onChange(Math.round(min + ratio * (max - min)));
      }}
    >
      <View style={[styles.track, { backgroundColor: color + '33' }]}>
        <View style={[styles.trackFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
        <View style={[styles.thumb, { left: `${pct * 100}%` as any, backgroundColor: color }]} />
      </View>
    </Pressable>
  );
};

const RadiusSliderPanel = ({
  radius,
  onRadiusChange,
  onConfirm,
  onCancel,
  theme,
}: {
  radius: number;
  onRadiusChange: (r: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
  theme: any;
}) => {
  const label = radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${Math.round(radius)} m`;

  return (
    <View
      style={[
        styles.sliderPanel,
        { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
      ]}
    >
      <Text style={[styles.sliderTitle, { color: theme.colors.text }]}>
        Search radius: {label}
      </Text>

      <View style={styles.sliderRow}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>100m</Text>
        <View style={{ flex: 1 }}>
          <SliderTrack
            value={radius}
            min={100}
            max={MAX_RADIUS_M}
            color={theme.colors.primary}
            onChange={onRadiusChange}
          />
        </View>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>20km</Text>
      </View>

      <View style={styles.sliderActions}>
        <Pressable
          onPress={onCancel}
          style={[styles.sliderBtn, { borderColor: theme.colors.border }]}
        >
          <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={onConfirm}
          style={[styles.sliderBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Apply</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

type DrawMode = 'idle' | 'placingCenter' | 'adjustingRadius';

export default function PropertyMapView({ properties, onCircleChange }: PropertyMapViewProps) {
  // const properties = [dod[0]]
  const { theme } = useTheme();
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region>({
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  });

  // ── Marker selection & floating card ──────────────────────────────────────

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedProperty = useMemo(
    () => properties.find((p) => p.id === selectedId) ?? null,
    [selectedId, properties]
  );

  const slideAnim = useRef(new Animated.Value(200)).current;

  const showCard = useCallback(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
  }, [slideAnim]);

  const hideCard = useCallback((cb?: () => void) => {
    Animated.timing(slideAnim, { toValue: 200, duration: 180, useNativeDriver: true }).start(cb);
  }, [slideAnim]);

  useEffect(() => {
    if (selectedProperty) showCard();
  }, [selectedProperty]);

  const handleDismissCard = useCallback(() => {
    hideCard(() => setSelectedId(null));
  }, [hideCard]);

  const handleMarkerPress = useCallback(
    (id: string) => {
      if (selectedId === id) {
        handleDismissCard();
      } else {
        setSelectedId(id);
      }
    },
    [selectedId, handleDismissCard]
  );

  // ── Circle draw ───────────────────────────────────────────────────────────
  // idle → "Draw Area" tapped → placingCenter
  // → user taps map → adjustingRadius (slider panel appears)
  // → "Apply" → idle (circle committed) | "Cancel" → idle

  const [drawMode, setDrawMode] = useState<DrawMode>('idle');
  const drawModeRef = useRef(drawMode);
  useEffect(() => { drawModeRef.current = drawMode; }, [drawMode]);

  const [circle, setCircle] = useState<CircleArea | null>(null);
  const [draftCircle, setDraftCircle] = useState<CircleArea | null>(null);

  const handleMapPress = useCallback(
    (e: any) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;

      if (drawModeRef.current === 'placingCenter') {
        setDraftCircle({ latitude, longitude, radius: 2000 }); // default 2km
        setDrawMode('adjustingRadius');
        return;
      }

      if (selectedId) handleDismissCard();
    },
    [selectedId, handleDismissCard]
  );

  const handleConfirmCircle = useCallback(() => {
    if (!draftCircle) return;
    setCircle(draftCircle);
    setDraftCircle(null);
    setDrawMode('idle');
    onCircleChange?.(draftCircle);
  }, [draftCircle, onCircleChange]);

  const handleCancelDraw = useCallback(() => {
    setDraftCircle(null);
    setDrawMode('idle');
  }, []);

  const handleClearCircle = useCallback(() => {
    setCircle(null);
    setDraftCircle(null);
    setDrawMode('idle');
    onCircleChange?.(null);
  }, [onCircleChange]);

  // ── Init map to first property ─────────────────────────────────────────────

  useEffect(() => {
    if (properties.length === 0) return;
    const first = properties[0];
    const lat = first.property?.address?.latitude;
    const lng = first.property?.address?.longitude;
    if (lat && lng) {
      const r: Region = { latitude: lat, longitude: lng, latitudeDelta: 0.12, longitudeDelta: 0.12 };
      setRegion(r);
      setTimeout(() => mapRef.current?.animateToRegion(r, 600), 300);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cluster markers ────────────────────────────────────────────────────────

  const rawMarkers = useMemo<RawMarker[]>(
    () =>
      properties
        .filter((p) => p.property?.address?.latitude != null && p.property?.address?.longitude != null)
        .map((p) => ({
          id: p.id,
          latitude: p.property.address.latitude,
          longitude: p.property.address.longitude,
          price: p.base_price ?? 0,
        })),
    [properties]
  );

  const clustered = useMemo(() => clusterMarkers(rawMarkers, region), [rawMarkers, region]);

  console.log({selectedId, clustered})

  const activeCircle = draftCircle ?? circle;
  // setSelectedId(properties[0].id)

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* ── MapView — no PROVIDER_GOOGLE, works without API key ── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        pitchEnabled={false}
        scrollEnabled={drawMode !== 'placingCenter'}
        // Disable map interaction while slider is open so accidental taps don't register
        pointerEvents={drawMode === 'adjustingRadius' ? 'none' : 'auto'}
      >
        {clustered.map((item, idx) => {
          if (item.type === 'cluster') {
            return (
              <Marker
                key={`cluster-${idx}`}
                coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                tracksViewChanges={false}
                onPress={() =>
                  mapRef.current?.animateToRegion(
                    {
                      latitude: item.latitude,
                      longitude: item.longitude,
                      latitudeDelta: region.latitudeDelta / 3,
                      longitudeDelta: region.longitudeDelta / 3,
                    },
                    400
                  )
                }
              >
                <ClusterMarker count={item.count!} theme={theme} />
              </Marker>
            );
          }

          return (
            <Marker
              key={item.id}
              coordinate={{ latitude: item.latitude, longitude: item.longitude }}
              tracksViewChanges={false}
              onPress={() => handleMarkerPress(item.id!)}
              zIndex={selectedId === item.id ? 10 : 1}
            >
              <PriceMarker
                price={item.price!}
                selected={selectedId === item.id}
                theme={theme}
              />
            </Marker>
          );
        })}

        {activeCircle && activeCircle.radius > 0 && (
          <Circle
            center={{ latitude: activeCircle.latitude, longitude: activeCircle.longitude }}
            radius={activeCircle.radius}
            strokeColor={theme.colors.primary}
            strokeWidth={2}
            fillColor={`${theme.colors.primary}22`}
          />
        )}
      </MapView>

      {/* ── My Location FAB ── */}
      <Pressable
        style={[styles.fabButton, { backgroundColor: theme.colors.background, bottom: 240, right: 16 }]}
        onPress={() =>
          // mapRef.current?.animateToRegion({ ...region, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 500)
          setSelectedId(properties[0].id)
        }
      >
        <Ionicons name="locate" size={22} color={theme.colors.primary} />
      </Pressable>

      {/* ── Draw Area / Clear button (only in idle) ── */}
      {drawMode === 'idle' &&
        (circle ? (
          <Pressable
            style={[styles.drawButton, { backgroundColor: theme.colors.background, bottom: 180, right: 16 }]}
            onPress={handleClearCircle}
          >
            <Ionicons name="close-circle-outline" size={20} color="tomato" />
            <Text style={[styles.drawButtonText, { color: 'tomato' }]}>Clear Area</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.drawButton, { backgroundColor: theme.colors.background, bottom: 180, right: 16 }]}
            onPress={() => setDrawMode('placingCenter')}
          >
            <MaterialCommunityIcons name="circle-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.drawButtonText, { color: theme.colors.primary }]}>Draw Area</Text>
          </Pressable>
        ))}

      {/* ── "Tap to place center" instruction ── */}
      {drawMode === 'placingCenter' && (
        <View style={styles.instructionRow}>
          <View style={[styles.instructionPill, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.instructionText}>Tap the map to set search center</Text>
          </View>
          <Pressable onPress={handleCancelDraw} hitSlop={8}>
            <Ionicons name="close-circle" size={28} color="tomato" />
          </Pressable>
        </View>
      )}

      {/* ── Radius slider panel ── */}
      {drawMode === 'adjustingRadius' && draftCircle && (
        <RadiusSliderPanel
          radius={draftCircle.radius}
          onRadiusChange={(r) => setDraftCircle((prev) => (prev ? { ...prev, radius: r } : prev))}
          onConfirm={handleConfirmCircle}
          onCancel={handleCancelDraw}
          theme={theme}
        />
      )}

      {/* ── Floating property card ── */}
      {selectedProperty && (
        <FloatingPropertyCard
          property={selectedProperty}
          slideAnim={slideAnim}
          theme={theme}
          onDismiss={handleDismissCard}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  priceMarker: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  priceMarkerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  clusterMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  clusterMarkerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  floatingCard: {
    position: 'absolute',
    bottom: 170,
    left: 16,
    right: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCardInner: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    padding: 10,
  },
  floatingCardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  floatingCardInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  floatingCardPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  floatingCardMeta: {
    fontSize: 13,
  },
  typePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '500',
  },
  fabButton: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  drawButton: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  drawButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  instructionRow: {
    position: 'absolute',
    top: 130,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  },
  instructionPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  instructionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  sliderPanel: {
    position: 'absolute',
    bottom: 175,
    left: 16,
    right: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  sliderTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 14,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sliderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  sliderBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  track: {
    height: 6,
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  trackFill: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    top: -7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});


// // components/map/PropertyMapView.tsx
// import { useTheme } from '@/theme/theme';
// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { router } from 'expo-router';
// import React, {
//     useCallback,
//     useEffect,
//     useMemo,
//     useRef,
//     useState,
// } from 'react';
// import {
//     Animated,
//     Dimensions,
//     Image,
//     Pressable,
//     StyleSheet,
//     Text,
//     View
// } from 'react-native';
// import MapViewClustering from 'react-native-map-clustering';
// import MapView, {
//     Circle,
//     Marker,
//     PROVIDER_GOOGLE,
//     Region,
// } from 'react-native-maps';

// const { width, height } = Dimensions.get('screen');

// // ─── Types ───────────────────────────────────────────────────────────────────

// interface Address {
//   lat: number;
//   lng: number;
//   city?: string;
//   country?: string;
// }

// interface Property {
//   address: Address;
// }

// interface RoomType {
//   id: string;
//   property: Property;
//   price?: number;
//   beds?: number;
//   baths?: number;
//   images?: { url: string }[];
//   category?: string;
//   type?: string;
// }

// interface CircleArea {
//   latitude: number;
//   longitude: number;
//   radius: number; // metres
// }

// interface PropertyMapViewProps {
//   properties: RoomType[];
//   onCircleChange?: (circle: CircleArea | null) => void;
// }

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// /**
//  * Returns the distance in metres between two lat/lng points (Haversine).
//  */
// function haversineDistance(
//   lat1: number,
//   lng1: number,
//   lat2: number,
//   lng2: number
// ): number {
//   const R = 6371000;
//   const toRad = (v: number) => (v * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLng = toRad(lng2 - lng1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// }

// /**
//  * Converts a pixel offset from a map's centre into a lat/lng delta,
//  * given the current region. Approximation valid for small offsets.
//  */
// function pixelOffsetToLatLng(
//   centerLat: number,
//   centerLng: number,
//   pixelX: number,
//   pixelY: number,
//   region: Region
// ): { latitude: number; longitude: number } {
//   const latPerPixel = region.latitudeDelta / height;
//   const lngPerPixel = region.longitudeDelta / width;
//   return {
//     latitude: centerLat - pixelY * latPerPixel,
//     longitude: centerLng + pixelX * lngPerPixel,
//   };
// }

// // ─── Sub-components ──────────────────────────────────────────────────────────

// /** Price marker rendered as a pill on the map. */
// const PriceMarker = React.memo(
//   ({
//     price,
//     selected,
//     theme,
//   }: {
//     price: number;
//     selected: boolean;
//     theme: any;
//   }) => (
//     <View
//       style={[
//         styles.priceMarker,
//         {
//           backgroundColor: selected
//             ? theme.colors.primary
//             : theme.colors.background,
//           borderColor: selected ? theme.colors.primary : theme.colors.border,
//         },
//       ]}
//     >
//       <Text
//         style={[
//           styles.priceMarkerText,
//           {
//             color: selected ? '#fff' : theme.colors.text,
//           },
//         ]}
//       >
//         ${price >= 1000 ? `${(price / 1000).toFixed(0)}k` : price}
//       </Text>
//     </View>
//   )
// );

// /** Floating mini-card shown when a marker is tapped. */
// const FloatingPropertyCard = React.memo(
//   ({
//     property,
//     slideAnim,
//     theme,
//     onDismiss,
//   }: {
//     property: RoomType;
//     slideAnim: Animated.Value;
//     theme: any;
//     onDismiss: () => void;
//   }) => {
//     const price = property.price ?? 0;
//     const beds = property.beds ?? 2;
//     const baths = property.baths ?? 1;
//     const city = property.property?.address?.city ?? '';
//     const imageUrl = property.images?.[0]?.url ?? null;
//     const type = (property.category ?? property.type ?? 'Home') as string;

//     return (
//       <Animated.View
//         style={[
//           styles.floatingCard,
//           {
//             backgroundColor: theme.colors.background,
//             transform: [{ translateY: slideAnim }],
//             shadowColor: '#000',
//           },
//         ]}
//       >
//         {/* Dismiss button */}
//         <Pressable
//           style={[styles.dismissButton, { backgroundColor: theme.colors.backgroundSec }]}
//           onPress={onDismiss}
//           hitSlop={8}
//         >
//           <Ionicons name="close" size={16} color={theme.colors.text} />
//         </Pressable>

//         <Pressable
//           style={styles.floatingCardInner}
//           onPress={() =>
//             router.push({
//               pathname: '/(guest)/(modals)/experienceDetail/[query]',
//               params: { query: property.id },
//             })
//           }
//         >
//           {/* Thumbnail */}
//           {imageUrl ? (
//             <Image
//               source={{ uri: imageUrl }}
//               style={styles.floatingCardImage}
//               resizeMode="cover"
//             />
//           ) : (
//             <View
//               style={[
//                 styles.floatingCardImage,
//                 { backgroundColor: theme.colors.border },
//               ]}
//             />
//           )}

//           {/* Info */}
//           <View style={styles.floatingCardInfo}>
//             <Text
//               style={[styles.floatingCardPrice, { color: theme.colors.text }]}
//               numberOfLines={1}
//             >
//               ${price?.toLocaleString()}
//               {type === 'apartment' ? '/mo' : ''}
//             </Text>
//             <Text
//               style={[
//                 styles.floatingCardMeta,
//                 { color: theme.colors.textSecondary },
//               ]}
//               numberOfLines={1}
//             >
//               {beds} bd · {baths} ba{city ? ` · ${city}` : ''}
//             </Text>
//             <View
//               style={[
//                 styles.typePill,
//                 { backgroundColor: theme.colors.border },
//               ]}
//             >
//               <Text
//                 style={[styles.typePillText, { color: theme.colors.text }]}
//               >
//                 {type.charAt(0).toUpperCase() + type.slice(1)}
//               </Text>
//             </View>
//           </View>

//           {/* Chevron */}
//           <Ionicons
//             name="chevron-forward"
//             size={20}
//             color={theme.colors.textSecondary}
//             style={{ alignSelf: 'center', marginRight: 4 }}
//           />
//         </Pressable>
//       </Animated.View>
//     );
//   }
// );

// // ─── Main Component ───────────────────────────────────────────────────────────

// type DrawMode = 'idle' | 'placing_center' | 'dragging_radius';

// export default function PropertyMapView({
//   properties,
//   onCircleChange,
// }: PropertyMapViewProps) {
//   const { theme } = useTheme();
//   const mapRef = useRef<MapView>(null);

//   // Region tracked for pixel→latLng conversions during circle drag
//   const [region, setRegion] = useState<Region>({
//     latitude: 0,
//     longitude: 0,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   });

//   // Selected marker
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const selectedProperty = useMemo(
//     () => properties.find((p) => p.id === selectedId) ?? null,
//     [selectedId, properties]
//   );

//   // Floating card animation
//   const slideAnim = useRef(new Animated.Value(200)).current;

//   const showCard = useCallback(() => {
//     Animated.spring(slideAnim, {
//       toValue: 0,
//       useNativeDriver: true,
//       tension: 80,
//       friction: 10,
//     }).start();
//   }, [slideAnim]);

//   const hideCard = useCallback(
//     (cb?: () => void) => {
//       Animated.timing(slideAnim, {
//         toValue: 200,
//         duration: 200,
//         useNativeDriver: true,
//       }).start(cb);
//     },
//     [slideAnim]
//   );

//   useEffect(() => {
//     if (selectedProperty) {
//       showCard();
//     }
//   }, [selectedProperty]);

//   const handleDismissCard = useCallback(() => {
//     hideCard(() => setSelectedId(null));
//   }, [hideCard]);

//   const handleMarkerPress = useCallback(
//     (id: string) => {
//       if (selectedId === id) {
//         handleDismissCard();
//       } else {
//         if (selectedId) {
//           // swap without animation glitch
//           setSelectedId(id);
//         } else {
//           setSelectedId(id);
//         }
//       }
//     },
//     [selectedId, handleDismissCard]
//   );

//   // ── Circle draw state ──────────────────────────────────────────────────────

//   const [drawMode, setDrawMode] = useState<DrawMode>('idle');
//   const [circle, setCircle] = useState<CircleArea | null>(null);

//   // Store refs for PanResponder (avoids stale closures)
//   const drawModeRef = useRef(drawMode);
//   const regionRef = useRef(region);
//   const circleCenterRef = useRef<{ latitude: number; longitude: number } | null>(null);

//   useEffect(() => {
//     drawModeRef.current = drawMode;
//   }, [drawMode]);
//   useEffect(() => {
//     regionRef.current = region;
//   }, [region]);

//   const handleMapPress = useCallback(
//     (e: any) => {
//       const { latitude, longitude } = e.nativeEvent.coordinate;

//       if (drawModeRef.current === 'placing_center') {
//         circleCenterRef.current = { latitude, longitude };
//         setCircle({ latitude, longitude, radius: 0 });
//         setDrawMode('dragging_radius');
//         return;
//       }

//       // Dismiss selected card on blank map tap
//       if (selectedId) {
//         handleDismissCard();
//       }
//     },
//     [selectedId, handleDismissCard]
//   );

//   const handleMapPanDrag = useCallback((e: any) => {
//     if (drawModeRef.current !== 'dragging_radius') return;
//     if (!circleCenterRef.current) return;
//     const { latitude, longitude } = e.nativeEvent.coordinate;
//     const radius = haversineDistance(
//       circleCenterRef.current.latitude,
//       circleCenterRef.current.longitude,
//       latitude,
//       longitude
//     );
//     setCircle({
//       ...circleCenterRef.current,
//       radius: Math.max(radius, 100), // minimum 100m
//     });
//   }, []);

//   const handleMapPressEnd = useCallback(() => {
//     if (drawModeRef.current !== 'dragging_radius') return;
//     setDrawMode('idle');
//     if (circle && circle.radius > 100) {
//       onCircleChange?.(circle);
//     }
//   }, [circle, onCircleChange]);

//   const clearCircle = useCallback(() => {
//     setCircle(null);
//     setDrawMode('idle');
//     onCircleChange?.(null);
//   }, [onCircleChange]);

//   // ── Initialise map to first property ──────────────────────────────────────

//   useEffect(() => {
//     if (properties.length > 0) {
//       const first = properties[0];
//       const lat = first.property?.address?.lat;
//       const lng = first.property?.address?.lng;
//       if (lat && lng) {
//         const initialRegion: Region = {
//           latitude: lat,
//           longitude: lng,
//           latitudeDelta: 0.1,
//           longitudeDelta: 0.1,
//         };
//         setRegion(initialRegion);
//         mapRef.current?.animateToRegion(initialRegion, 600);
//       }
//     }
//   }, []);

//   // ── Markers ───────────────────────────────────────────────────────────────

//   const markers = useMemo(
//     () =>
//       properties
//         .filter(
//           (p) =>
//             p.property?.address?.lat != null &&
//             p.property?.address?.lng != null
//         )
//         .map((p) => ({
//           id: p.id,
//           latitude: p.property.address.lat,
//           longitude: p.property.address.lng,
//           price: p.price ?? 0,
//         })),
//     [properties]
//   );

//   return (
//     <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
//       {/* ── Map ── */}
//       <MapViewClustering
//         ref={mapRef}
//         provider={PROVIDER_GOOGLE}
//         style={StyleSheet.absoluteFill}
//         region={region}
//         onRegionChangeComplete={setRegion}
//         onPress={handleMapPress}
//         onPanDrag={handleMapPanDrag}
//         onTouchEnd={handleMapPressEnd}
//         showsUserLocation
//         showsMyLocationButton={false}
//         clusterColor={theme.colors.primary}
//         clusterTextColor="#fff"
//         clusterFontFamily={undefined}
//         radius={60}
//         // Disable map scroll while placing circle center so drag works correctly
//         scrollEnabled={drawMode !== 'dragging_radius'}
//         pitchEnabled={false}
//         customMapStyle={mapStyle}
//       >
//         {markers.map((m) => (
//           <Marker
//             key={m.id}
//             coordinate={{ latitude: m.latitude, longitude: m.longitude }}
//             tracksViewChanges={false}
//             onPress={() => handleMarkerPress(m.id)}
//             zIndex={selectedId === m.id ? 10 : 1}
//           >
//             <PriceMarker
//               price={m.price}
//               selected={selectedId === m.id}
//               theme={theme}
//             />
//           </Marker>
//         ))}

//         {/* Circle overlay */}
//         {circle && circle.radius > 0 && (
//           <Circle
//             center={{ latitude: circle.latitude, longitude: circle.longitude }}
//             radius={circle.radius}
//             strokeColor={theme.colors.primary}
//             strokeWidth={2}
//             fillColor={`${theme.colors.primary}22`}
//           />
//         )}
//       </MapViewClustering>

//       {/* ── My Location button ── */}
//       <Pressable
//         style={[
//           styles.fabButton,
//           {
//             backgroundColor: theme.colors.background,
//             bottom: 240,
//             right: 16,
//           },
//         ]}
//         onPress={() => {
//           mapRef.current?.animateToRegion(
//             { ...region, latitudeDelta: 0.02, longitudeDelta: 0.02 },
//             500
//           );
//         }}
//       >
//         <Ionicons name="locate" size={22} color={theme.colors.primary} />
//       </Pressable>

//       {/* ── Draw Area controls ── */}
//       {circle ? (
//         <Pressable
//           style={[
//             styles.drawButton,
//             { backgroundColor: theme.colors.background, bottom: 180, right: 16 },
//           ]}
//           onPress={clearCircle}
//         >
//           <Ionicons name="close-circle-outline" size={20} color="tomato" />
//           <Text style={[styles.drawButtonText, { color: 'tomato' }]}>
//             Clear Area
//           </Text>
//         </Pressable>
//       ) : (
//         <Pressable
//           style={[
//             styles.drawButton,
//             {
//               backgroundColor:
//                 drawMode === 'placing_center'
//                   ? theme.colors.primary
//                   : theme.colors.background,
//               bottom: 180,
//               right: 16,
//             },
//           ]}
//           onPress={() =>
//             setDrawMode((m) =>
//               m === 'placing_center' ? 'idle' : 'placing_center'
//             )
//           }
//         >
//           <MaterialCommunityIcons
//             name="circle-outline"
//             size={20}
//             color={
//               drawMode === 'placing_center' ? '#fff' : theme.colors.primary
//             }
//           />
//           <Text
//             style={[
//               styles.drawButtonText,
//               {
//                 color:
//                   drawMode === 'placing_center' ? '#fff' : theme.colors.primary,
//               },
//             ]}
//           >
//             {drawMode === 'placing_center' ? 'Tap to set centre' : 'Draw Area'}
//           </Text>
//         </Pressable>
//       )}

//       {/* Instruction pill shown while dragging radius */}
//       {drawMode === 'dragging_radius' && (
//         <View
//           style={[
//             styles.instructionPill,
//             { backgroundColor: theme.colors.primary },
//           ]}
//         >
//           <Text style={styles.instructionText}>
//             Drag on the map to set the radius
//           </Text>
//         </View>
//       )}

//       {/* ── Floating property card ── */}
//       {selectedProperty && (
//         <FloatingPropertyCard
//           property={selectedProperty}
//           slideAnim={slideAnim}
//           theme={theme}
//           onDismiss={handleDismissCard}
//         />
//       )}
//     </View>
//   );
// }

// // ─── Subtle map style (removes POI clutter) ───────────────────────────────────

// const mapStyle = [
//   { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
//   { featureType: 'transit', stylers: [{ visibility: 'off' }] },
// ];

// // ─── Styles ───────────────────────────────────────────────────────────────────

// const styles = StyleSheet.create({
//   priceMarker: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 20,
//     borderWidth: 1.5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//     elevation: 4,
//   },
//   priceMarkerText: {
//     fontSize: 12,
//     fontWeight: '700',
//   },
//   floatingCard: {
//     position: 'absolute',
//     bottom: 170, // sits above the bottom sheet handle at 18%
//     left: 16,
//     right: 16,
//     borderRadius: 16,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.18,
//     shadowRadius: 12,
//     elevation: 8,
//     overflow: 'hidden',
//   },
//   dismissButton: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     zIndex: 10,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   floatingCardInner: {
//     flexDirection: 'row',
//     alignItems: 'stretch',
//     gap: 12,
//     padding: 10,
//   },
//   floatingCardImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 10,
//   },
//   floatingCardInfo: {
//     flex: 1,
//     justifyContent: 'center',
//     gap: 4,
//   },
//   floatingCardPrice: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   floatingCardMeta: {
//     fontSize: 13,
//   },
//   typePill: {
//     alignSelf: 'flex-start',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 999,
//   },
//   typePillText: {
//     fontSize: 11,
//     fontWeight: '500',
//   },
//   fabButton: {
//     position: 'absolute',
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   drawButton: {
//     position: 'absolute',
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   drawButtonText: {
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   instructionPill: {
//     position: 'absolute',
//     top: 130,
//     alignSelf: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   instructionText: {
//     color: '#fff',
//     fontSize: 13,
//     fontWeight: '600',
//   },
// });