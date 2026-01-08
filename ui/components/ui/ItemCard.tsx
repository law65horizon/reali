import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
// import { Card, ThemedText, useTheme } from './theme'; // Adjust imports based on your theme setup
import { useTheme } from '@/theme/theme';
import { ThemedText } from '../ThemedText';
import Card from './Card';
import ImageCarousel from './ImageCarousel'; // Adjust import based on your project structure

// Define types for the property data
interface Address {
  city?: string;
  country?: string;
}

interface Property {
  id: string;
  title: string;
  address?: Address;
  price?: number;
  rating?: number;
  reviewCount?: number;
  images: string[];
}

interface ItemCardProps {
  property: Property |any;
  imageHeight?: number;
  cardWidth?: number;
}

const { width: screenWidth } = Dimensions.get('window');
const images = [
        require('@/assets/images/image.png'),
        require('@/assets/images/living-room.jpg'),
        require('@/assets/images/image3.jpg'),
        require('@/assets/images/image.png'),
        require('@/assets/images/living-room.jpg'),
        // require('@/assets/images/image3.jpg'),
        // require('@/assets/images/image.png'),
        // require('@/assets/images/living-room.jpg'),
        // require('@/assets/images/image3.jpg'),
        // Add more images up to 25
        // ...require('@/assets/images/image4.jpg'), etc.
    ]

const ItemCard: React.FC<ItemCardProps> = ({
  property,
  imageHeight = 240,
  cardWidth = screenWidth - 40,
}) => {
  const {theme} = useTheme();
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/(guest)/(modals)/listing/[listing]',
      params: { listing: property.id },
    });
  };

  return (
    <Card elevated style={[styles.propertyCard, { backgroundColor: theme.colors.backgroundSec }]}>
      <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
        {property.title || 'Modern Apartment in City Center'}
      </ThemedText>

      <View style={styles.imageContainer}>
        <ImageCarousel imageHeight={imageHeight} width={cardWidth} images={images} modal />
      </View>

      <Pressable onPress={handlePress} style={styles.cardContent}>
        <View style={styles.propertyInfo}>
          <ThemedText type="defaultSemiBold" style={styles.propertyTitle}>
            Room in {property.address?.city || 'USA'}
          </ThemedText>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" color={theme.colors.warning} size={16} />
            <ThemedText type="body" style={styles.ratingText}>
              {property.rating?.toFixed(1) || 'N/A'} ({property.reviewCount || 0})
            </ThemedText>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <MaterialCommunityIcons name="map-marker" color={theme.colors.textSecondary} size={16} />
          <ThemedText type="caption" secondary>
            Beach getaway in {property.address?.country || 'Ton Fug'}
          </ThemedText>
        </View>

        <View style={styles.priceContainer}>
          <ThemedText type="defaultSemiBold" style={styles.priceText}>
            ${property.price || 90} USD / night
          </ThemedText>
        </View>
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  propertyCard: {
    marginBottom: 8,
    padding: 10,
    borderRadius: 16,
    // overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 12,
    flex: 1,
    // backgroundColor: 'red',
    overflow: 'hidden',
  },
  cardContent: {
    gap: 8,
  },
  propertyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyTitle: {
    fontSize: 16,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

// Memoize to prevent unnecessary re-renders
export default memo(ItemCard);