// screens/host/CreatePropertyStep1.tsx
import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type PropertyType = 'apartment' | 'house' | 'hotel';
type SaleStatus = 'rent' | 'sale';

export default function CreatePropertyStep1() {
  const { theme } = useTheme();
  
  // Form state
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [saleStatus, setSaleStatus] = useState<SaleStatus>('rent');
  const [title, setTitle] = useState('');
  const [speciality, setSpeciality] = useState('');
  
  // Location state
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  const propertyTypes = [
    {
      type: 'apartment' as PropertyType,
      icon: 'business',
      title: 'Apartment',
      description: 'Multi-unit residential building',
      supportsRooms: true,
    },
    {
      type: 'house' as PropertyType,
      icon: 'home',
      title: 'House',
      description: 'Single-family residence',
      supportsRooms: false,
    },
    {
      type: 'hotel' as PropertyType,
      icon: 'bed',
      title: 'Hotel',
      description: 'Commercial accommodation',
      supportsRooms: true,
    },
  ];

  const validateStep = () => {
    if (!propertyType) {
      Alert.alert('Missing Information', 'Please select a property type');
      return false;
    }
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a property title');
      return false;
    }
    if (!street.trim() || !city.trim() || !country.trim()) {
      Alert.alert('Missing Information', 'Please complete all address fields');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      // Save data to state management (Context/Redux) or AsyncStorage
      const stepData = {
        propertyType,
        saleStatus,
        title,
        speciality,
        address: {
          street,
          city,
          postalCode,
          country,
        },
      };
      
    //   Navigate to step 2
      router.push({
        pathname: '/listing/edit/crep2',
        params: { data: JSON.stringify(stepData) }
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerStep, { color: theme.colors.textSecondary }]}>
            Step 1 of 4
          </Text>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Basic Information
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: theme.colors.backgroundSec }]}>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.primary, width: '25%' }]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Property Type Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Property Type
          </Text> 
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Choose the type of property you want to list
          </Text>

          <View style={styles.typeGrid}>
            {propertyTypes.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.typeCard,
                  { backgroundColor: theme.colors.card },
                  propertyType === item.type && {
                    backgroundColor: theme.colors.primary + '15',
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => setPropertyType(item.type)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon as any}
                  size={32}
                  color={propertyType === item.type ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeTitle,
                    { color: theme.colors.text },
                    propertyType === item.type && { color: theme.colors.primary, fontWeight: '700' }
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={[styles.typeDescription, { color: theme.colors.textSecondary }]}>
                  {item.description}
                </Text>
                {item.supportsRooms && (
                  <View style={[styles.roomBadge, { backgroundColor: theme.colors.backgroundSec }]}>
                    <Ionicons name="bed-outline" size={12} color={theme.colors.primary} />
                    <Text style={[styles.roomBadgeText, { color: theme.colors.textSecondary }]}>
                      Room Types
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Listing Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Listing Type
          </Text>
          <View style={styles.saleTypeContainer}>
            <TouchableOpacity
              style={[
                styles.saleTypeButton,
                { backgroundColor: theme.colors.card },
                saleStatus === 'rent' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setSaleStatus('rent')}
            >
              <Ionicons
                name="key-outline"
                size={20}
                color={saleStatus === 'rent' ? '#FFFFFF' : theme.colors.text}
              />
              <Text
                style={[
                  styles.saleTypeText,
                  { color: theme.colors.text },
                  saleStatus === 'rent' && { color: '#FFFFFF' }
                ]}
              >
                For Rent
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saleTypeButton,
                { backgroundColor: theme.colors.card },
                saleStatus === 'sale' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setSaleStatus('sale')}
            >
              <Ionicons
                name="pricetag-outline"
                size={20}
                color={saleStatus === 'sale' ? '#FFFFFF' : theme.colors.text}
              />
              <Text
                style={[
                  styles.saleTypeText,
                  { color: theme.colors.text },
                  saleStatus === 'sale' && { color: '#FFFFFF' }
                ]}
              >
                For Sale
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Property Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Property Details
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Property Title *
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.colors.backgroundInput, color: theme.colors.text }
              ]}
              placeholder="e.g., Modern Downtown Apartment"
              placeholderTextColor={theme.colors.textPlaceholder}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Speciality (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.colors.backgroundInput, color: theme.colors.text }
              ]}
              placeholder="e.g., Luxury, Budget-Friendly, Pet-Friendly"
              placeholderTextColor={theme.colors.textPlaceholder}
              value={speciality}
              onChangeText={setSpeciality}
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Location
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Street Address *
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.colors.backgroundInput, color: theme.colors.text }
              ]}
              placeholder="123 Main Street"
              placeholderTextColor={theme.colors.textPlaceholder}
              value={street}
              onChangeText={setStreet}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                City *
              </Text>
              <TextInput
                style={[ 
                  styles.input,
                  { backgroundColor: theme.colors.backgroundInput, color: theme.colors.text }
                ]}
                placeholder="New York"
                placeholderTextColor={theme.colors.textPlaceholder}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Postal Code
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.backgroundInput, color: theme.colors.text }
                ]}
                placeholder="10001"
                placeholderTextColor={theme.colors.textPlaceholder}
                value={postalCode}
                onChangeText={setPostalCode}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Country *
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.colors.backgroundInput, color: theme.colors.text }
              ]}
              placeholder="United States"
              placeholderTextColor={theme.colors.textPlaceholder}
              value={country}
              onChangeText={setCountry}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerStep: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  progressContainer: {
    height: 4,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  typeGrid: {
    gap: 12,
  },
  typeCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 13,
    textAlign: 'center',
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roomBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  saleTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  saleTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saleTypeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});