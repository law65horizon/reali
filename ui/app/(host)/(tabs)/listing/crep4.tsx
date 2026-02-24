// screens/host/CreatePropertyStep4.tsx
import { useTheme } from '@/theme/theme';
import { gql, useMutation } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const CREATE_PROPERTY = gql`
  mutation CreateProperty($input: CreatePropertyInput!) {
    createProperty(input: $input) {
      id
      title
      status
    }
  }
`;

export default function CreatePropertyStep4() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const propertyData = JSON.parse(params.data as string);
  
  const [createProperty, { loading }] = useMutation(CREATE_PROPERTY);
  const [publishImmediately, setPublishImmediately] = useState(false);

  const handleSubmit = async () => {
    try {
      const input = {
        property_type: propertyData.propertyType,
        sale_status: propertyData.saleStatus,
        title: propertyData.title,
        speciality: propertyData.speciality,
        description: propertyData.description,
        price: propertyData.price,
        amenities: propertyData.amenities,
        status: publishImmediately ? 'published' : 'draft',
        address: propertyData.address,
        images: propertyData.images,
        primaryImageIndex: propertyData.primaryImageIndex,
      };

      const { data } = await createProperty({ variables: { input } });

      Alert.alert(
        'Success!',
        `Your property has been ${publishImmediately ? 'published' : 'saved as a draft'}`,
        [
          {
            text: 'View Property',
            // onPress: () => router.push({
            //   pathname: '/host/properties/edit/[id]',
            //   params: { id: data.createProperty.id }
            // }),
          },
          {
            text: 'Back to Dashboard',
            onPress: () => router.push('/(host)/(tabs)/listing'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create property. Please try again.');
      console.error('Create property error:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const renderInfoRow = (icon: string, label: string, value: string) => (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={20} color={theme.colors.textSecondary} />
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerStep, { color: theme.colors.textSecondary }]}>
            Step 4 of 4
          </Text>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Review & Submit
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: theme.colors.backgroundSec }]}>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.primary, width: '100%' }]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.summaryHeader}>
            <Ionicons name="checkmark-circle" size={32} color={theme.colors.success} />
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
              Almost there!
            </Text>
            <Text style={[styles.summarySubtitle, { color: theme.colors.textSecondary }]}>
              Review your property details before submitting
            </Text>
          </View>
        </View>

        {/* Property Type & Listing */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Property Information
          </Text>
          {renderInfoRow('business-outline', 'Property Type', propertyData.propertyType)}
          {renderInfoRow('pricetag-outline', 'Listing Type', `For ${propertyData.saleStatus}`)}
          {renderInfoRow('home-outline', 'Title', propertyData.title)}
          {propertyData.speciality && renderInfoRow('star-outline', 'Speciality', propertyData.speciality)}
        </View>

        {/* Location */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Location
          </Text>
          {renderInfoRow(
            'location-outline',
            'Address',
            `${propertyData.address.street}, ${propertyData.address.city}, ${propertyData.address.country}`
          )}
          {propertyData.address.postalCode && renderInfoRow('mail-outline', 'Postal Code', propertyData.address.postalCode)}
        </View>

        {/* Pricing */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Pricing
          </Text>
          <View style={styles.priceDisplay}>
            <Text style={[styles.priceAmount, { color: theme.colors.primary }]}>
              ${propertyData.price.toLocaleString()}
            </Text>
            <Text style={[styles.pricePeriod, { color: theme.colors.textSecondary }]}>
              per night
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Description
          </Text>
          <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
            {propertyData.description}
          </Text>
        </View>

        {/* Amenities */}
        {propertyData.amenities.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Amenities ({propertyData.amenities.length})
            </Text>
            <View style={styles.amenitiesList}>
              {propertyData.amenities.map((amenity: string, index: number) => (
                <View key={index} style={[styles.amenityChip, { backgroundColor: theme.colors.backgroundSec }]}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={[styles.amenityText, { color: theme.colors.text }]}>
                    {amenity}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Photos */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Photos ({propertyData.images.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
            {propertyData.images.map((uri: string, index: number) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri }} style={styles.photo} />
                {index === propertyData.primaryImageIndex && (
                  <View style={[styles.primaryBadge, { backgroundColor: theme.colors.success }]}>
                    <Ionicons name="star" size={12} color="#FFFFFF" />
                    <Text style={styles.primaryBadgeText}>Primary</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Publish Option */}
        <View style={[styles.publishOption, { backgroundColor: theme.colors.card }]}>
          <View style={styles.publishOptionContent}>
            <View style={styles.publishOptionText}>
              <Text style={[styles.publishOptionTitle, { color: theme.colors.text }]}>
                Publish Immediately
              </Text>
              <Text style={[styles.publishOptionSubtitle, { color: theme.colors.textSecondary }]}>
                Make your property visible to guests right away
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                { backgroundColor: publishImmediately ? theme.colors.success : theme.colors.backgroundSec }
              ]}
              onPress={() => setPublishImmediately(!publishImmediately)}
            >
              <View style={[
                styles.toggleKnob,
                { backgroundColor: '#FFFFFF' },
                publishImmediately && styles.toggleKnobActive
              ]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Room Types Info */}
        {(propertyData.propertyType === 'apartment' || propertyData.propertyType === 'hotel') && (
          <View style={[styles.infoBox, { backgroundColor: theme.colors.primary + '15' }]}>
            <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
            <Text style={[styles.infoBoxText, { color: theme.colors.text }]}>
              After creating this property, you can add room types with specific details like bed count, capacity, and individual pricing.
            </Text>
          </View>
        )}
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
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.success },
            loading && { opacity: 0.7 }
          ]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>
                {publishImmediately ? 'Publish Property' : 'Save as Draft'}
              </Text>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </>
          )}
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
    paddingBottom: 180,
  },
  summaryCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryHeader: {
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  summarySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  priceDisplay: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 4,
  },
  pricePeriod: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  amenityText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  photoScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  photoContainer: {
    width: 200,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  primaryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  publishOption: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  publishOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  publishOptionText: {
    flex: 1,
    marginRight: 16,
  },
  publishOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  publishOptionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  toggle: {
    width: 56,
    height: 32,
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 30,
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
  submitButton: {
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
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});