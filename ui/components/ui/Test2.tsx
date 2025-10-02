import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons'; // Assuming Expo for icons
import React, { useState } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../ThemedText';

// TypeScript types
type FilterType = 'properties' | 'events';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (filters: any) => void; // Callback to save filters
  filterType: FilterType; // Determines if filtering properties or events
}

// Sample filter state interfaces
interface PropertyFilters {
  forSale: boolean;
  forRent: boolean;
  sold: boolean;
  includeCloseMatches: boolean;
  priceMin: number;
  priceMax: number;
  beds: string[]; // e.g., ['Any', 'Studio', '1', '2+']
  homeTypes: string[]; // e.g., ['House', 'Townhouse']
  sqFtMin: number;
  sqFtMax: number;
  lotSizeMin: number;
  lotSizeMax: number;
  storiesMin: number;
  storiesMax: number;
  yearBuiltMin: number;
  yearBuiltMax: number;
  exclude55Plus: boolean;
  listingTypes: string[]; // e.g., ['By Agent', 'FSBO']
  // Add more as needed
}

interface EventFilters {
  dateFrom: Date | null;
  dateTo: Date | null;
  categories: string[]; // e.g., ['Concert', 'Sports']
  locationRadius: number;
  priceMin: number;
  priceMax: number;
  
  // Add more event-specific filters
}

const {width, height} = Dimensions.get('screen')

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onSave, filterType }) => {
  // State management - use separate states for properties and events for clarity
  const [propertyFilters, setPropertyFilters] = useState<PropertyFilters>({
    forSale: true,
    forRent: false,
    sold: false,
    includeCloseMatches: true,
    priceMin: 0,
    priceMax: 10000000,
    beds: ['Any'],
    homeTypes: [],
    sqFtMin: 0,
    sqFtMax: Infinity,
    lotSizeMin: 0,
    lotSizeMax: Infinity,
    storiesMin: 0,
    storiesMax: Infinity,
    yearBuiltMin: 0,
    yearBuiltMax: new Date().getFullYear(),
    exclude55Plus: false,
    listingTypes: ['By Agent', 'FSBO', 'New Construction'],
  });

  const [eventFilters, setEventFilters] = useState<EventFilters>({
    dateFrom: null,
    dateTo: null,
    categories: [],
    locationRadius: 10, // miles
    priceMin: 0,
    priceMax: 1000,
  });

  const {theme} = useTheme()

  // Helper to get active filters based on type
  const activeFilters = filterType === 'properties' ? propertyFilters : eventFilters;
  const setActiveFilters = filterType === 'properties' ? setPropertyFilters : setEventFilters;

  // Reset function
  const handleReset = () => {
    if (filterType === 'properties') {
      setPropertyFilters({
        forSale: true,
        forRent: false,
        sold: false,
        includeCloseMatches: true,
        priceMin: 0,
        priceMax: 10000000,
        beds: ['Any'],
        homeTypes: [],
        sqFtMin: 0,
        sqFtMax: Infinity,
        lotSizeMin: 0,
        lotSizeMax: Infinity,
        storiesMin: 0,
        storiesMax: Infinity,
        yearBuiltMin: 0,
        yearBuiltMax: new Date().getFullYear(),
        exclude55Plus: false,
        listingTypes: ['By Agent', 'FSBO', 'New Construction'],
      });
    } else {
      setEventFilters({
        dateFrom: null,
        dateTo: null,
        categories: [],
        locationRadius: 10,
        priceMin: 0,
        priceMax: 1000,
      });
    }
  };

  // Save and close
  const handleSave = () => {
    onSave(activeFilters);
    onClose();
  };

  // Creative toggle button component
  const ToggleButton = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.toggleButton, selected ? styles.toggleButtonSelected : null]}
      onPress={onPress}
    >
      <Text style={[styles.toggleButtonText, selected ? styles.toggleButtonTextSelected : null]}>
        {label}
      </Text>
    </TouchableOpacity>
  );


  return (
    <Modal
      visible={visible}
      animationType="slide" // Full-screen slide up like modals in apps
      onRequestClose={onClose}
      transparent={false} // Full screen
    >
      <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
        {/* Header - inspired by Redfin/Zillow */}
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <ThemedText type='subtitle'>Filters</ThemedText>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom button - like "See 400+ homes" in Redfin, with gradient for creativity */}
        {/* <LinearGradient colors={['#ff416c', '#ff4b2b']} style={styles.bottomButton}>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.bottomButtonText}>See Results</Text>
          </TouchableOpacity>
        </LinearGradient> */}
      </SafeAreaView>
    </Modal>
  );
};

// Styles - modern, dark mode inspired, with creativity in shadows/gradients
const styles = StyleSheet.create({
  container: {
    flex: 1,// Dark mode
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    flex:1, 
    position: 'absolute',
    top: 0, 
    alignItems: 'center',
    width
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  toggleButtonSelected: {
    backgroundColor: '#00bfff',
  },
  toggleButtonText: {
    color: 'white',
  },
  toggleButtonTextSelected: {
    color: 'black',
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    color: 'white',
    fontSize: 16,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  sliderContainer: {
    marginBottom: 16,
  },
  histogramPlaceholder: {
    height: 50,
    borderRadius: 8,
    opacity: 0.8,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  minMaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: 'white',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  minMaxInputRow: {
    flexDirection: 'column',
    marginBottom: 16,
    color: 'white',
  },
  checkboxGroup: {
    flexDirection: 'column',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bottomButton: {
    padding: 16,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
  bottomButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FilterModal;