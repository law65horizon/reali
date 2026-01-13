import { useFavoritesStore } from '@/stores';
import { useTheme } from '@/theme/theme';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import Card from './Card';
import ImageCarousel from './ImageCarousel';

interface PropertyCardProps {
  property: any;
  width_?: number;
}

const {width} = Dimensions.get('screen')
const PropertyCard = ({ property, width_ }: PropertyCardProps) => {
  // console.log({property: property.property})
  const { theme } = useTheme();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  
  // Memoize favorite status to prevent unnecessary re-renders
  const isFav = () => isFavorite(property.id);
  // const isFav = useMemo(() => isFavorite(property.id), [property.id, isFavorite]);

  // console.log({isFav: [isFav, property?.id]})

  // Memoize all derived values
  const propertyData = useMemo(() => {
    const price = property?.basePrice ?? 0;
    const city = property?.property?.address?.city || 'Unknown';
    const country = property?.property?.address?.country || '';
    const type = (property?.property?.property_type || property?.type || 'Home') as string;
    const beds = property?.bedCount ?? ((price % 3) + 2);
    const baths = property?.bathroomCount ?? ((price % 2) + 1);
    const sqft = property?.sizeSqft ?? (900 + (price % 5) * 120);
    
    return { price, city, country, type, beds, baths, sqft };
  }, [property]);

  // Memoize tags computation
  const tags = useMemo(() => {
    const t: string[] = [];
    if (propertyData.price && propertyData.price < 100) t.push('Deal');
    if ((property?.images?.length || 0) > 1) t.push('3D Walkthrough');
    if ((property?.status || 'ACTIVE') === 'PENDING') t.push('New');
    return t;
  }, [propertyData.price, property?.images?.length, property?.status]);

  // Memoize images array
  const images = useMemo(
    () => property?.images?.map((i: any) => i.url),
    [property?.images]
  );

  // Stable callback reference
  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(property.id);
  }, [property.id, toggleFavorite]);

  const { price, city, country, type, beds, baths, sqft } = propertyData;

  return (
    <Card key={property.id} elevated style={[styles.card, { backgroundColor: theme.colors.backgroundSec }]} 
    onPress={
      () => router.push({
        pathname: '/(guest)/(modals)/experienceDetail/[query]',
        params: {query: property.id}
      })
    }
    >
      <ImageCarousel
        images={images}
        imageHeight={220}
        width={width_ || width - 20}
        uri
      />

      <View style={styles.cardBody}>
        <View style={styles.headerRow}>
          <View style={styles.flex1}>
            <ThemedText type="defaultSemiBold" style={styles.price}>
              ${price?.toLocaleString?.() || price} {type === 'apartment' ? 'mo' : ''}
            </ThemedText>

            <View style={styles.row}>
              <ThemedText type="body" secondary>
                {beds} beds
              </ThemedText>
              <View style={styles.dot} />
              <ThemedText type="body" secondary>
                {baths} baths
              </ThemedText>
              <View style={styles.dot} />
              <ThemedText type="body" secondary>
                {sqft} sq.ft
              </ThemedText>
            </View>
          </View>
          
          <Pressable onPress={handleToggleFavorite} hitSlop={8}>
            <Entypo
              name={isFav() ? 'heart' : 'heart-outlined'}
              color={isFav() ? theme.colors.primary : theme.colors.text}
              size={26}
            />
          </Pressable>
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={theme.colors.textSecondary}
            />
            <ThemedText type="caption" secondary>
              {city}
              {country ? `, ${country}` : ''}
            </ThemedText>
          </View>
          <View style={[styles.typePill, { backgroundColor: theme.colors.border }]}>
            <ThemedText type="caption">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </ThemedText>
          </View>
        </View>
      </View>

      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((t, idx) => (
            <View
              key={`${property.id}-tag-${idx}`}
              style={[styles.tag, { backgroundColor: theme.colors.background }]}
            >
              <ThemedText type="caption">{t}</ThemedText>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
};

// Memoize with custom comparison to prevent unnecessary re-renders
// export default memo(PropertyCard, (prevProps, nextProps) => {
//   // Only re-render if property id or width changes
//   return (
//     prevProps.property.id === nextProps.property.id &&
//     prevProps.width_ === nextProps.width_  && 
//   );
// });

export default PropertyCard;


const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  price: {
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#999',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagsContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
});