import { useTheme } from '@/theme/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CustomDayProps {
    date:any
    state: any;
    marking: any
    onPress: () => void
}

const CustomDay = ({ date, state, marking, onPress }:CustomDayProps) => {
  const isDisabled = marking?.disabled || state === 'disabled';
  const {theme} = useTheme()
  // console.log({date, state, marking})

  return (
    <TouchableOpacity onPress={() => onPress()} style={[
      styles.container,
      marking?.selected && {backgroundColor: theme.colors.primary, borderRadius: '50%',}
    ]}>
      <Text
        style={[
          styles.text,
          state === 'today' && styles.todayText,
          isDisabled && styles.disabledText,
        ]}
      >
        {date.day}
      </Text>

      {isDisabled && <View style={[styles.strike, {backgroundColor: theme.colors.textSecondary}]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: 40,
    height: 40,
    margin:0,
    padding: 0
  },
  text: {
    fontSize: 16,
  },
  todayText: {
    fontWeight: 'bold',
    color: 'red'
  },
  selectedStyles: {
    backgroundColor: 'red',
    padding: 10, 
    borderRadius: '50%'
  },
  disabledText: {
    opacity: 0.4,
  },
  strike: {
    position: 'absolute',
    width: '50%',
    height: 1.8, // red strike line — change as needed
    top: '50%',
  },
});

export default CustomDay


