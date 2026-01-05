import { useTheme } from '@/theme/theme';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
// import { useTheme } from '@/hooks/useTheme';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface PropertyCardSkeletonProps {
  width_?: number;
}

export const PropertyCardSkeleton = ({ width_ }: PropertyCardSkeletonProps) => {
  const { theme } = useTheme();
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]),
  }));

  const skeletonColor = theme.colors.border || '#E0E0E0';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.backgroundSec, width: width_ || width - 20 },
      ]}
    >
      {/* Image Skeleton */}
      <Animated.View
        style={[
          styles.imageSkeleton,
          { backgroundColor: skeletonColor },
          animatedStyle,
        ]}
      />

      <View style={styles.cardBody}>
        {/* Price and Heart Row */}
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            {/* Price Skeleton */}
            <Animated.View
              style={[
                styles.priceSkeleton,
                { backgroundColor: skeletonColor },
                animatedStyle,
              ]}
            />

            {/* Beds/Baths/Sqft Row */}
            <View style={styles.detailsRow}>
              <Animated.View
                style={[
                  styles.detailSkeleton,
                  { backgroundColor: skeletonColor },
                  animatedStyle,
                ]}
              />
              <Animated.View
                style={[
                  styles.detailSkeleton,
                  { backgroundColor: skeletonColor },
                  animatedStyle,
                ]}
              />
              <Animated.View
                style={[
                  styles.detailSkeleton,
                  { backgroundColor: skeletonColor },
                  animatedStyle,
                ]}
              />
            </View>
          </View>

          {/* Heart Icon Skeleton */}
          <Animated.View
            style={[
              styles.heartSkeleton,
              { backgroundColor: skeletonColor },
              animatedStyle,
            ]}
          />
        </View>

        {/* Bottom Row - Location and Type */}
        <View style={styles.bottomRow}>
          <Animated.View
            style={[
              styles.locationSkeleton,
              { backgroundColor: skeletonColor },
              animatedStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.typeSkeleton,
              { backgroundColor: skeletonColor },
              animatedStyle,
            ]}
          />
        </View>
      </View>

      {/* Tags Skeleton */}
      {/* <View style={styles.tagsContainer}>
        <Animated.View
          style={[
            styles.tagSkeleton,
            { backgroundColor: skeletonColor },
            animatedStyle,
          ]}
        />
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    // marginBottom: 16,
  },
  imageSkeleton: {
    height: 220,
    width: '100%',
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceSkeleton: {
    height: 24,
    width: '60%',
    borderRadius: 4,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  detailSkeleton: {
    height: 14,
    width: 50,
    borderRadius: 4,
  },
  heartSkeleton: {
    height: 26,
    width: 26,
    borderRadius: 13,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationSkeleton: {
    height: 14,
    width: 120,
    borderRadius: 4,
  },
  typeSkeleton: {
    height: 24,
    width: 70,
    borderRadius: 12,
  },
  tagsContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 8,
  },
  tagSkeleton: {
    height: 24,
    width: 60,
    borderRadius: 12,
  },
});