// screens/host/CreatePropertyStep3.tsx
import { ImageProps, usePropertyStore } from '@/stores/usePropertyStore';
import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function Photos() {
  const { theme } = useTheme();
  const photos = usePropertyStore((state) => state.photos)
  const setField = usePropertyStore((state) => state.setField)
  const [images, setImages] = useState<ImageProps[]>(photos || []);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  console.log(images)

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [16, 9],
    });

    if (!result.canceled && result.assets) {
      const newImages: ImageProps[] = result.assets.map(asset => ({
        uri: asset.uri,
        fileSize: asset.fileSize,
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName || '',
        mimeType: asset.mimeType || 'jpg'
      }));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(prev => prev - 1);
    }
  };

  const validateStep = () => {
    if (images.length === 0) {
      Alert.alert('No Images', 'Please upload at least one image of your property');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep() || 2<3) {
      if (photos !== images) setField('photos', images)

      router.push({
        pathname: '/listing/edit/pricing'
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
            Step 4 of 6
          </Text>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Photos
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: theme.colors.backgroundSec }]}>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.primary, width: '65%' }]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photos */}
        <View style={styles.section}>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Upload high-quality images of your property (minimum 1 photo)
          </Text>

          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: theme.colors.card }]}
            onPress={pickImages}
            activeOpacity={0.7}
          >
            <Ionicons name="cloud-upload-outline" size={32} color={theme.colors.primary} />
            <Text style={[styles.uploadButtonText, { color: theme.colors.text }]}>
              Upload Photos
            </Text>
            <Text style={[styles.uploadButtonSubtext, { color: theme.colors.textSecondary }]}>
              JPG, PNG up to 10MB each
            </Text>
          </TouchableOpacity>

          {/* Image Grid */}
          {images.length > 0 && (
            <View style={styles.imageGrid}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image.uri || image.cdn_url! }} style={styles.imagePreview} />
                  
                  {/* Primary Badge */}
                  {index === primaryImageIndex && (
                    <View style={[styles.primaryBadge, { backgroundColor: theme.colors.success }]}>
                      <Ionicons name="star" size={12} color="#FFFFFF" />
                      <Text style={styles.primaryBadgeText}>Primary</Text>
                    </View>
                  )}

                  {/* Actions */}
                  <View style={styles.imageActions}>
                    <TouchableOpacity
                      style={[styles.imageActionButton, { backgroundColor: theme.colors.card }]}
                      onPress={() => setPrimaryImageIndex(index)}
                    >
                      <Ionicons
                        name={index === primaryImageIndex ? 'star' : 'star-outline'}
                        size={18}
                        color={index === primaryImageIndex ? theme.colors.warning : theme.colors.text}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.imageActionButton, { backgroundColor: theme.colors.error }]}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {images.length > 0 && (
            <View style={[styles.imageCount, { backgroundColor: theme.colors.backgroundSec }]}>
              <Ionicons name="images" size={18} color={theme.colors.success} />
              <Text style={[styles.imageCountText, { color: theme.colors.text }]}>
                {images.length} {images.length === 1 ? 'photo' : 'photos'} uploaded
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
    paddingBottom: 120,
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
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  currencyText: {
    fontSize: 20,
    fontWeight: '700',
  },
  priceInput: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: '600',
  },
  periodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceHint: {
    fontSize: 13,
    marginTop: 12,
    lineHeight: 18,
  },
  uploadButton: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  uploadButtonSubtext: {
    fontSize: 13,
    marginTop: 4,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  imageContainer: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
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
  imageActions: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
  },
  imageActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  imageCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  imageCountText: {
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