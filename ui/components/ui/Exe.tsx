import { useTheme } from '@/theme/theme';
import React, { useCallback, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import RangeSlider from 'rn-range-slider';
import { ThemedText } from '../ThemedText';
// import InputField from './InputField';

type Props = {
  min: number;
  max: number;
  values: { min: number; max: number };
  onChange: (values: { min: number; max: number }) => void;
  step?: number
};

const CustomDurationRange: React.FC<Props> = ({ min, max, values, step, onChange }) => {
  const screenWidth = Dimensions.get('window').width;
  const {theme } = useTheme()

  const dashCount = 7;
  const gap = 6; // space between dashes
  const totalGap = (dashCount - 1) * gap;
  const dashLength = (screenWidth - totalGap) / dashCount;
  
  const histogramData = [
    2, 3, 5, 10, 15, 18, 25, 30, 35, 38, 40, 42, 40, 36, 30, 25, 20, 15, 10, 5, 42, 40, 36, 30, 25, 11 
  ];

  const barWidth = 8;
  const maxBarHeight = 100;

  // Memoize histogramData max to avoid recalculating
  const maxHistogramValue = useMemo(() => Math.max(...histogramData), [histogramData]);

  // Normalize values to map to histogram indices
  const minIndex = useMemo(
    () =>
      Math.floor(((values.min - min) / (max - min)) * (histogramData.length - 1)),
    [values.min, min, max]
  );
  const maxIndex = useMemo(
    () =>
      Math.ceil(((values.max - min) / (max - min)) * (histogramData.length - 1)),
    [values.max, min, max]
  );

  console.log(max, min, values)

  // Debounce onChange to prevent rapid state updates
  const handleValueChange = useCallback(
    (low: number, high: number) => {
      // Ensure values are within bounds and min <= max
      const newMin = Math.max(min, Math.min(low, high));
      const newMax = Math.min(max, Math.max(high, low));
      if (newMin !== values.min || newMax !== values.max) {
        onChange({ min: newMin, max: newMax });
      }
    },
    [onChange, values.min, values.max, min, max]
  );

  // Handle input changes for min and max
  const handleMinInputChange = useCallback(
    (text: string) => {
      const value = parseInt(text.replace(/[^0-9]/g, '')) || min;
      handleValueChange(value, values.max);
    },
    [handleValueChange, values.max, min]
  );

  const handleMaxInputChange = useCallback(
    (text: string) => {
      const value = parseInt(text.replace(/[^0-9]/g, '')) || max;
      handleValueChange(values.min, value);
    },
    [handleValueChange, values.min, max]
  );

  const renderThumb = useCallback(() => (
    <View style={styles.thumb}>
      <View style={styles.thumbInner} />
    </View>
  ), []);

  const renderRail = useCallback(() => <Svg height="2" width="100%">
      <Line
        x1="0"
        y1="0"
        x2="100%"
        y2="0"
        stroke="#D3D3D3"
        strokeWidth="20"
        strokeDasharray={`${dashLength},${gap}`}
      />
    </Svg>, []);

  const renderRailSelected = useCallback(() => <Svg height="2" width="100%">
      <Line
        x1="0"
        y1="0"
        x2="100%"
        y2="0"
        stroke={theme.colors.primary}
        strokeWidth="20"
        strokeDasharray={`${dashLength},${gap}`} // 6 = dash length, 4 = gap length
      />
    </Svg>, []);

  return (
    <View style={styles.container}>     

      <View style={styles.sliderContainer}>
        <RangeSlider
          style={styles.slider}
          min={min}
          max={max}
          step={35.5}
          low={values.min}
          high={values.max}
          onValueChanged={handleValueChange}
          renderThumb={renderThumb}
          renderRail={renderRail}
          renderRailSelected={renderRailSelected}
        />

        
      </View>

      <View style={{flexDirection:'row', alignItems:'center', paddingLeft: 8, gap: gap}}>
          {[0,1,2,3,4,5].map((item) => (
            <ThemedText style={{width:dashLength, textAlign: 'center'}} key={item} type='caption'>
              {item+1}hrs
            </ThemedText>
          ))}
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  chartWrapper: {
    paddingLeft: 30,
  },
  sliderContainer: {
    height: 1,
    justifyContent: 'center',
    marginBottom: 16,
  },
  slider: {
    width: '100%',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
  },
  thumbInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  rail: {
    flex: 1,
    height: 1,
    borderRadius: 2,
    backgroundColor: '#D3D3D3',
  },
  railSelected: {
    height: 1,
    borderRadius: 2,
    backgroundColor: '#E00065',
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  labelBox: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth:1,
    minWidth: 150,
    alignItems: 'center',
  },
  labelText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceInput: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
});

export default CustomDurationRange;