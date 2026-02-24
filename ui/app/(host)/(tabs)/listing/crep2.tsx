// screens/host/CreatePropertyStep2.tsx
import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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

const AMENITIES = [
  { id: 'wifi', icon: 'wifi', label: 'WiFi' },
  { id: 'parking', icon: 'car', label: 'Parking' },
  { id: 'pool', icon: 'water', label: 'Pool' },
  { id: 'gym', icon: 'fitness', label: 'Gym' },
  { id: 'ac', icon: 'snow', label: 'Air Conditioning' },
  { id: 'heating', icon: 'flame', label: 'Heating' },
  { id: 'kitchen', icon: 'restaurant', label: 'Kitchen' },
  { id: 'washer', icon: 'reload', label: 'Washer/Dryer' },
  { id: 'tv', icon: 'tv', label: 'TV' },
  { id: 'elevator', icon: 'arrow-up', label: 'Elevator' },
  { id: 'balcony', icon: 'leaf', label: 'Balcony' },
  { id: 'petFriendly', icon: 'paw', label: 'Pet Friendly' },
];

export default function CreatePropertyStep2() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const validateStep = () => {
    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please provide a property description');
      return false;
    }
    if (description.trim().length < 50) {
      Alert.alert('Description Too Short', 'Please provide a more detailed description (at least 50 characters)');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      const stepData = {
        ...JSON.parse(params.data as string),
        description,
        amenities: selectedAmenities,
      };

      router.push({
        pathname: '/listing/crep3',
        params: { data: JSON.stringify(stepData) }
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerStep, { color: theme.colors.textSecondary }]}>
            Step 2 of 4
          </Text>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Description & Amenities
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: theme.colors.backgroundSec }]}>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.primary, width: '50%' }]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Property Description *
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Describe your property and what makes it special
          </Text>

          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: theme.colors.backgroundInput, color: theme.colors.text }
            ]}
            placeholder="Tell guests about your property. Mention unique features, nearby attractions, and what makes it a great place to stay..."
            placeholderTextColor={theme.colors.textPlaceholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>
            {description.length} characters (minimum 50)
          </Text>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Amenities
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Select all amenities available at your property
          </Text>

          <View style={styles.amenitiesGrid}>
            {AMENITIES.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity.id);
              return (
                <TouchableOpacity
                  key={amenity.id}
                  style={[
                    styles.amenityCard,
                    { backgroundColor: theme.colors.card },
                    isSelected && {
                      backgroundColor: theme.colors.primary + '15',
                      borderColor: theme.colors.primary,
                      borderWidth: 2,
                    }
                  ]}
                  onPress={() => toggleAmenity(amenity.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={amenity.icon as any}
                    size={24}
                    color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.amenityLabel,
                      { color: theme.colors.text },
                      isSelected && { color: theme.colors.primary, fontWeight: '700' }
                    ]}
                  >
                    {amenity.label}
                  </Text>
                  {isSelected && (
                    <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedAmenities.length > 0 && (
            <View style={[styles.selectedCount, { backgroundColor: theme.colors.backgroundSec }]}>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
              <Text style={[styles.selectedCountText, { color: theme.colors.text }]}>
                {selectedAmenities.length} {selectedAmenities.length === 1 ? 'amenity' : 'amenities'} selected
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[styles.backNavButton, { backgroundColor: theme.colors.card }]}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          <Text style={[styles.backNavText, { color: theme.colors.text }]}>Back</Text>
        </TouchableOpacity>

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
    paddingBottom: 170,
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
  textArea: {
    minHeight: 150,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityCard: {
    width: '31%',
    aspectRatio: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  amenityLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 100,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  backNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backNavText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
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