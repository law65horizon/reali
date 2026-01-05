import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';

interface PriceRangeSliderProps {
  priceData: number[];
  minPrice?: number;
  maxPrice?: number;
  initialMinValue?: number;
  initialMaxValue?: number;
  onRangeChange?: (min: number, max: number) => void;
  histogramColor?: string;
  sliderColor?: string;
  thumbColor?: string;
  containerStyle?: object;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  priceData = [],
  minPrice,
  maxPrice,
  initialMinValue,
  initialMaxValue,
  onRangeChange,
  histogramColor = '#4A90E2',
  sliderColor = '#2563EB',
  thumbColor = '#FFFFFF',
  containerStyle,
}) => {
  const SLIDER_HEIGHT = 40;
  const HISTOGRAM_HEIGHT = 120;
  const THUMB_SIZE = 24;
  const BAR_WIDTH = 8;
  const BAR_GAP = 2;
  const MAX_RANGE_DIFF = 1250;

  // Calculate price range
  const priceRange = useMemo(() => {
    if (priceData.length === 0) {
      return { min: minPrice || 0, max: maxPrice || 1000 };
    }
    const min = minPrice !== undefined ? minPrice : Math.min(...priceData);
    const max = maxPrice !== undefined ? maxPrice : Math.max(...priceData);
    return { min, max };
  }, [priceData, minPrice, maxPrice]);

  // Create histogram bins
  const histogram = useMemo(() => {
    if (priceData.length === 0) return [];

    const numBins = Math.min(50, Math.ceil((priceRange.max - priceRange.min) / 25));
    const binSize = (priceRange.max - priceRange.min) / numBins;
    const bins = Array(numBins).fill(0);

    priceData.forEach(price => {
      const binIndex = Math.min(
        Math.floor((price - priceRange.min) / binSize),
        numBins - 1
      );
      if (binIndex >= 0) bins[binIndex]++;
    });

    const maxCount = Math.max(...bins, 1);
    return bins.map(count => count / maxCount);
  }, [priceData, priceRange]);

  const [sliderWidth, setSliderWidth] = useState(Dimensions.get('window').width - 40);
  const histogramWidth = Math.min(
    histogram.length * (BAR_WIDTH + BAR_GAP),
    sliderWidth
  );

  const [minValue, setMinValue] = useState(initialMinValue || priceRange.min);
  const [maxValue, setMaxValue] = useState(initialMaxValue || priceRange.max);

  const minPosition = useSharedValue(0);
  const maxPosition = useSharedValue(sliderWidth);
  const startMinPosition = useSharedValue(0);
  const startMaxPosition = useSharedValue(sliderWidth);

  // Convert price to position
  const priceToPosition = useCallback(
    (price: number) => {
      const ratio = (price - priceRange.min) / (priceRange.max - priceRange.min);
      return ratio * sliderWidth;
    },
    [priceRange, sliderWidth]
  );

  // Convert position to price
  const positionToPrice = useCallback(
    (position: number) => {
      const ratio = position / sliderWidth;
      return priceRange.min + ratio * (priceRange.max - priceRange.min);
    },
    [priceRange, sliderWidth]
  );

  // Min thumb gesture
  const minGesture = Gesture.Pan()
    .onStart(() => {
      startMinPosition.value = minPosition.value;
    })
    .onUpdate((event) => {
      const newPosition = Math.max(
        0,
        Math.min(startMinPosition.value + event.translationX, maxPosition.value - THUMB_SIZE)
      );
      
      // Snap to first histogram bar if beyond histogram width
      if (histogramWidth < sliderWidth && newPosition > histogramWidth) {
        return;
      }
      
      const newPrice = positionToPrice(newPosition);
      const priceDiff = maxValue - newPrice;
      
      if (priceDiff <= MAX_RANGE_DIFF) {
        minPosition.value = newPosition;
      }
    })
    .onEnd(() => {
      const newPrice = Math.round(positionToPrice(minPosition.value));
      const clampedPrice = Math.max(priceRange.min, Math.min(newPrice, maxValue - 1));
      setMinValue(clampedPrice);
      onRangeChange?.(clampedPrice, maxValue);
    });

  // Max thumb gesture
  const maxGesture = Gesture.Pan()
    .onStart(() => {
      startMaxPosition.value = maxPosition.value;
    })
    .onUpdate((event) => {
      const newPosition = Math.min(
        sliderWidth,
        Math.max(startMaxPosition.value + event.translationX, minPosition.value + THUMB_SIZE)
      );
      
      // Snap to first histogram bar if beyond histogram width
      if (histogramWidth < sliderWidth && newPosition > histogramWidth) {
        return;
      }
      
      const newPrice = positionToPrice(newPosition);
      const priceDiff = newPrice - minValue;
      
      if (priceDiff <= MAX_RANGE_DIFF) {
        maxPosition.value = newPosition;
      }
    })
    .onEnd(() => {
      const newPrice = Math.round(positionToPrice(maxPosition.value));
      const clampedPrice = Math.min(priceRange.max, Math.max(newPrice, minValue + 1));
      
      // Final check for max range
      if (clampedPrice - minValue <= MAX_RANGE_DIFF) {
        setMaxValue(clampedPrice);
        onRangeChange?.(minValue, clampedPrice);
      } else {
        // Revert if exceeded
        maxPosition.value = withSpring(priceToPosition(maxValue));
      }
    });

  const minThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: minPosition.value }],
  }));

  const maxThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: maxPosition.value - THUMB_SIZE }],
  }));

  const rangeStyle = useAnimatedStyle(() => ({
    left: minPosition.value,
    width: maxPosition.value - minPosition.value,
  }));

  // Initialize positions
  React.useEffect(() => {
    minPosition.value = withSpring(priceToPosition(minValue));
    maxPosition.value = withSpring(priceToPosition(maxValue));
    startMinPosition.value = priceToPosition(minValue);
    startMaxPosition.value = priceToPosition(maxValue);
  }, [sliderWidth]);

  return (
    <GestureHandlerRootView style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <Text style={styles.priceText}>${minValue.toLocaleString()}</Text>
        <Text style={styles.priceText}>${maxValue.toLocaleString()}</Text>
      </View>

      {/* Histogram */}
      <View style={styles.histogramContainer}>
        <Svg width={sliderWidth} height={HISTOGRAM_HEIGHT}>
          {histogram.map((value, index) => {
            const x = index * (BAR_WIDTH + BAR_GAP);
            const barHeight = value * HISTOGRAM_HEIGHT;
            const y = HISTOGRAM_HEIGHT - barHeight;

            return (
              <Rect
                key={index}
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={barHeight}
                fill={histogramColor}
                opacity={0.7}
              />
            );
          })}
        </Svg>
      </View>

      {/* Slider */}
      <View
        style={styles.sliderContainer}
        onLayout={e => setSliderWidth(e.nativeEvent.layout.width)}
      >
        {/* Track */}
        <View style={styles.track} />
        
        {/* Active Range */}
        <Animated.View style={[styles.activeRange, rangeStyle, { backgroundColor: sliderColor }]} />

        {/* Min Thumb */}
        <GestureDetector gesture={minGesture}>
          <Animated.View style={[styles.thumb, minThumbStyle, { backgroundColor: thumbColor, borderColor: sliderColor }]}>
            <View style={styles.thumbInner} />
          </Animated.View>
        </GestureDetector>

        {/* Max Thumb */}
        <GestureDetector gesture={maxGesture}>
          <Animated.View style={[styles.thumb, maxThumbStyle, { backgroundColor: thumbColor, borderColor: sliderColor }]}>
            <View style={styles.thumbInner} />
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  histogramContainer: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    width: '100%',
  },
  track: {
    position: 'absolute',
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  activeRange: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  thumbInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
});

export default PriceRangeSlider;