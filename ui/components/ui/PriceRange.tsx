import { useTheme } from '@/theme/theme';
import React, { useCallback, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import RangeSlider from 'rn-range-slider';
import { ThemedText } from '../ThemedText';
import InputField from './InputField';
// import InputField from './InputField';

type Props = {
  min: number;
  max: number;
  values: { min: number; max: number };
  onChange: (values: { min: number; max: number }) => void;
  showChart?: boolean
};

const CustomPriceRangeSlider: React.FC<Props> = ({ min, max, values, showChart, onChange }) => {
  const screenWidth = Dimensions.get('window').width;
  const {theme } = useTheme()
  
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

  const renderRail = useCallback(() => <View style={styles.rail} />, []);

  const renderRailSelected = useCallback(() => <View style={[styles.railSelected, {backgroundColor: theme.colors.primary}]} />, []);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Price range</ThemedText>
      {/* <Text style={styles.subtitle}>Trip price;, includes all fees</Text> */}

      {showChart && <View style={styles.chartWrapper}>
        <Svg height={maxBarHeight} width="100%">
          {histogramData.map((value, index) => (
            <Rect
              key={index}
              x={index * (barWidth + 4)}
              y={maxBarHeight - (value / maxHistogramValue) * maxBarHeight}
              width={barWidth}
              height={(value / maxHistogramValue) * maxBarHeight}
              fill={index >= minIndex && index <= maxIndex ? '#E00065' : '#D3D3D3'}
            />
          ))}
        </Svg>
      </View>}

      <View style={styles.sliderContainer}>
        <RangeSlider
          style={styles.slider}
          min={min}
          max={max}
          step={50}
          low={values.min}
          high={values.max}
          onValueChanged={handleValueChange}
          renderThumb={renderThumb}
          renderRail={renderRail}
          renderRailSelected={renderRailSelected}
        />
      </View>

      <View style={styles.priceLabels}>
        <View style={[styles.labelBox, {backgroundColor: theme.colors.backgroundSec, borderColor: theme.colors.border}]}>
          {/* <ThemedText type='caption' >Minimum</ThemedText> */}
          <InputField
            inputStyle={[styles.priceInput, {color: theme.colors.text}]}
            value={`US$${values.min.toLocaleString()}`}
            handleChangeText={handleMinInputChange}
            keyboardType="numeric"
            title='min'
            
            placeholder={`Enter Min`}
          />
        </View>
        <View style={[styles.labelBox, {backgroundColor: theme.colors.backgroundSec, borderColor: theme.colors.border}]}>
          {/* <ThemedText type='caption' >Maximum</ThemedText> */}
          <InputField
            inputStyle={[styles.priceInput, {color: theme.colors.text}]}
            value={values.max >= max ? `US$${max.toLocaleString()}+` : `US$${values.max.toLocaleString()}`}
            handleChangeText={handleMaxInputChange}
            keyboardType="numeric"
            placeholder={`Enter Max`}
            title='max'
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginBottom: 24,
    gap: 10
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
    // backgroundColor: '#E00065',
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

export default CustomPriceRangeSlider;

// import React, { useCallback, useMemo } from 'react';
// import { Dimensions, StyleSheet, Text, View } from 'react-native';
// import Svg, { Rect } from 'react-native-svg';
// import RangeSlider from 'rn-range-slider';
// import InputField from './InputField';

// type Props = {
//   min: number;
//   max: number;
//   values: { min: number; max: number };
//   onChange: (values: { min: number; max: number }) => void;
// };

// const CustomPriceRangeSlider: React.FC<Props> = ({ min, max, values, onChange }) => {
//   const screenWidth = Dimensions.get('window').width;
//   const histogramData = [
//     2, 3, 5, 10, 15, 18, 25, 30, 35, 38, 40, 42, 40, 36, 30, 25, 20, 15, 10, 5, 42, 40, 36, 30, 25, 11 
//   ];

//   const barWidth = 8;
// //   const barWidth = screenWidth-2 / histogramData.length ;
//   const maxBarHeight = 100;

//   // Memoize histogramData max to avoid recalculating
//   const maxHistogramValue = useMemo(() => Math.max(...histogramData), [histogramData]);

//   // Normalize values to map to histogram indices
//   const minIndex = useMemo(
//     () =>
//       Math.floor(((values.min - min) / (max - min)) * (histogramData.length - 1)),
//     [values.min, min, max]
//   );
//   const maxIndex = useMemo(
//     () =>
//       Math.ceil(((values.max - min) / (max - min)) * (histogramData.length - 1)),
//     [values.max, min, max]
//   );

//   // Debounce onChange to prevent rapid state updates
//   const handleValueChange = useCallback(
//     (low: number, high: number) => {
//       // Only call onChange if values have changed
//       if (low !== values.min || high !== values.max) {
//         onChange({ min: low, max: high });
//       }
//     },
//     [onChange, values.min, values.max]
//   );

//   const renderThumb = useCallback(() => (
//     <View style={styles.thumb}>
//       <View style={styles.thumbInner} />
//     </View>
//   ), []);

//   const renderRail = useCallback(() => <View style={styles.rail} />, []);

//   const renderRailSelected = useCallback(() => <View style={styles.railSelected} />, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Price range</Text>
//       <Text style={styles.subtitle}>Trip price, includes all fees</Text>

//       <View style={styles.chartWrapper}>
//         <Svg height={maxBarHeight} width="100%">
//           {histogramData.map((value, index) => (
//             <Rect
//               key={index}
//               x={index * (barWidth + 4)}
//               y={maxBarHeight - (value / maxHistogramValue) * maxBarHeight}
//               width={barWidth}
//               height={(value / maxHistogramValue) * maxBarHeight}
//               fill={index >= minIndex && index <= maxIndex ? '#E00065' : '#D3D3D3'}
//             />
//           ))}
//         </Svg>
//       </View>

//       <View style={styles.sliderContainer}>
//         <RangeSlider
//           style={styles.slider}
//           min={min}
//           max={max}
//           step={50}
//           low={values.min}
//           high={values.max}
//           onValueChanged={handleValueChange}
//           renderThumb={renderThumb}
//           renderRail={renderRail}
//           renderRailSelected={renderRailSelected}
//         />
//       </View>

//       <View style={styles.priceLabels}>
//         <View style={styles.labelBox}>
//           <Text style={styles.labelText}>Minimum</Text>
//           <Text style={styles.priceText}>US${values.min.toLocaleString()}</Text>
//         </View>
//         <View style={styles.labelBox}>
//           <Text style={styles.labelText}>Maximum</Text>
//           <Text style={styles.priceText}>
//             US${values.max >= max ? `${max.toLocaleString()}+` : values.max.toLocaleString()}
//           </Text>
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 24,
//     // paddingHorizontal: 16,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 16,
//   },
//   chartWrapper: {
//     // backgroundColor:'red'
//     // height: 120,
//     // marginBottom: 16,
//     paddingLeft: 30
//   },
//   sliderContainer: {
//     height: 1,
//     justifyContent: 'center',
//     marginBottom: 16,
//   },
//   slider: {
//     width: '100%',
//   },
//   thumb: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: '#FFFFFF',
//     // borderWidth: 2,
//     // borderColor: '#E00065',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowOffset: { width: 0, height: 1},
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//     elevation: 6,
//   },
//   thumbInner: {
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: 'white',
//   },
//   rail: {
//     flex: 1,
//     height: 1,
//     borderRadius: 2,
//     backgroundColor: '#D3D3D3',
//   },
//   railSelected: {
//     height: 1,
//     borderRadius: 2,
//     backgroundColor: '#E00065',
//   },
//   priceLabels: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 12,
//   },
//   labelBox: {
//     backgroundColor: '#f4f4f4',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 50,
//     minWidth: 150,
//     alignItems: 'center',
//   },
//   labelText: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 4,
//   },
//   priceText: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });

// export default CustomPriceRangeSlider;