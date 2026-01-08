// import { useTheme } from '@/theme/theme';
// import { BlurView } from 'expo-blur';
// import React, { useState } from 'react';
// import {
//     FlatList,
//     Pressable,
//     StyleSheet,
//     TouchableOpacity,
//     View
// } from 'react-native';
// import { ThemedText } from '../ThemedText';

// interface DropdownProps {
//     options: string[];
//     defaultValue?: string;
//     onSelect?: (value: string) => void;
// }

// const Dropdown = ({ options, defaultValue, onSelect }: DropdownProps) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [selected, setSelected] = useState(defaultValue || options[0]);
//   const { theme } = useTheme();

//   const handleSelect = (item: any) => {
//     setSelected(item);
//     setIsOpen(false);
//     if (onSelect) onSelect(item);
//   };

//   return (
//     <View style={styles.container}>
//       <Pressable
//         style={[styles.dropdownButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
//         onPress={() => setIsOpen(!isOpen)}
//         accessibilityRole="button"
//         accessibilityLabel={`Sort by ${selected}, tap to change`}
//       >
//         <ThemedText >{selected}</ThemedText>
//       </Pressable>
//       {isOpen && (
//         <BlurView style={[styles.dropdownContent,]}  intensity={90} tint='default'>
//           <FlatList
//             data={options}
//             keyExtractor={(item) => item}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={[styles.option, {borderColor: theme.colors.border}]}
//                 onPress={() => handleSelect(item)}
//                 accessibilityRole="menuitem"
//               >
//                 <ThemedText >{item}</ThemedText>
//                 {selected === item && (
//                   <ThemedText style={styles.checkmark}>✓</ThemedText>
//                 )}
//               </TouchableOpacity>
//             )}
//           />
//         </BlurView>

//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {flex:1,  marginVertical: 10 },
//   dropdownButton: {
//     padding: 10,
//     borderWidth: 1,
//     borderRadius: 5,
//     maxWidth: 100,
//   },
//   dropdownContent: {
//     position: 'absolute',
//     top: 55, // Position below the button (adjust based on button height)
//     left: 0, // Align to the left of the screen
//     borderRadius: 10,
//     width: '100%', // Match the button width
//     maxHeight: 200, // Limit height for scrolling
//     elevation: 5, // Shadow for Android
//     shadowColor: '#000', // Shadow for iOS
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     zIndex: 10, // Ensure it appears above other content
//   },
//   option: {
//     padding: 15,
//     borderBottomWidth: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   optionText: { fontSize: 16, color: '#333' },
//   checkmark: { fontSize: 16, },
// });

// export default Dropdown;

import { useTheme } from '@/theme/theme';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedText } from '../ThemedText';

interface DropdownProps {
  options: string[];
  defaultValue?: string;
  onSelect?: (value: string) => void;
}

const Dropdown = ({ options, defaultValue, onSelect }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || options[0]);
  const { theme } = useTheme();

  const handleSelect = (item: string) => {
    setSelected(item);
    setIsOpen(false);
    if (onSelect) onSelect(item);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.dropdownButton,
          { borderColor: isOpen? theme.colors.accent: theme.colors.border, backgroundColor: theme.colors.card },
        ]}
        onPress={() => setIsOpen(!isOpen)}
        accessibilityRole="button"
        accessibilityLabel={`Sort by ${selected}, tap to change`}
      >
        <ThemedText>{selected}</ThemedText>
      </Pressable>
      {isOpen && (
        <View style={[styles.dropdownContentWrapper, { borderRadius: 10 }]}>
          <BlurView style={styles.dropdownContent} intensity={90} tint="default">
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, { borderColor: theme.colors.border }]}
                  onPress={() => handleSelect(item)}
                  accessibilityRole="menuitem"
                >
                  <ThemedText>{item}</ThemedText>
                  {selected === item && (
                    <ThemedText style={styles.checkmark}>✓</ThemedText>
                  )}
                </TouchableOpacity>
              )}
            />
          </BlurView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginVertical: 10 },
  dropdownButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    maxWidth: 100,
  },
  dropdownContentWrapper: {
    position: 'absolute',
    top: 55, // Position below the button (adjust based on button height)
    left: 0, // Align to the left of the screen
    width: '100%', // Match the button width
    maxHeight: 200, // Limit height for scrolling
    overflow: 'hidden', // Clip the BlurView to the rounded corners
    zIndex: 10,
  },
  dropdownContent: {
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10, // Ensure it appears above other content
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkmark: { fontSize: 20 },
});

export default Dropdown;