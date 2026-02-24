// screens/WriteReview.tsx
import { useTheme } from '@/theme/theme';
import { gql, useMutation } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const CREATE_REVIEW = gql`
mutation CreateReview($input: ReviewInput!) {
  createReview(input: $input) {
    id
  }
}
`

export default function WriteReview({ route }: any) {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const {booking} = useLocalSearchParams()
  console.log({booking})
  const result = JSON.parse(booking as string)
  // console.log(JSON.parse(booking as string))
  // Mock booking data - in real app, get from route.params or store
  // const result = {
  //   property: {
  //     title: 'Downtown Apartment',
  //     imageUrl: 'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg',
  //     address: '789 City Blvd, City Center',
  //     city: 'City Center',
  //   },
  //   checkIn: '2025-05-01T15:00:00Z',
  //   checkOut: '2025-05-02T10:00:00Z',
  // };

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createReview, {data, error, loading}] = useMutation(CREATE_REVIEW)

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting.');
      return;
    }

    if (reviewText.trim().length < 10) {
      Alert.alert('Review Too Short', 'Please write at least 10 characters in your review.');
      return;
    }

    setIsSubmitting(true);
    try {
      const reveiw = await createReview({
        variables: {
          input: {
            bookingId: result.bookingId,
            comment: reviewText,
            rating,
          }
        }
      })

      if (reveiw.data?.createReview?.id) {
        Alert.alert('Review Submitted')
        router.back()
      }
    } catch (error: any) {
      if (error?.message == 'duplicate key value violates unique constraint "unique_booking_review"') {
        Alert.alert('Error, Review already exists')
      }
    } finally {
      setIsSubmitting(false)
    }
    
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Tap to rate';
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={{paddingTop: 20}} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Property Card */}
        <View style={[styles.propertyCard, { backgroundColor: theme.colors.card }]}>
          <Image
            source={{ uri: result.thumbnail }}
            style={styles.propertyImage}
          />
          <View style={styles.propertyInfo}>
            <Text style={[styles.propertyTitle, { color: theme.colors.text }]}>
              {result.title}
            </Text>
            <Text style={[styles.propertyLocation, { color: theme.colors.textSecondary }]}>
              {result.city}
            </Text>
            <Text style={[styles.propertyDates, { color: theme.colors.textSecondary }]}>
              {formatDate(result.checkIn)} - {formatDate(result.checkOut)}
            </Text>
          </View>
        </View>

        {/* Review Text Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Share your experience
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Tell us what you loved and what could be improved
          </Text>

          <View style={[styles.textInputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TextInput
              style={[styles.textInput, { color: theme.colors.text }]}
              placeholder="Write your review here..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              value={reviewText}
              onChangeText={setReviewText}
              maxLength={1000}
            />
          </View>

          <Text style={[styles.characterCount, { color: theme.colors.textSecondary }]}>
            {reviewText.length}/1000 characters
          </Text>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            How was your stay?
          </Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                onPressIn={() => setHoveredRating(star)}
                onPressOut={() => setHoveredRating(0)}
                activeOpacity={0.7}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= (hoveredRating || rating) ? 'star' : 'star-outline'}
                  size={48}
                  color={star <= (hoveredRating || rating) ? '#FFB800' : theme.colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.ratingLabel, { color: theme.colors.primary }]}>
            {getRatingLabel(hoveredRating || rating)}
          </Text>
        </View>

        {/* Tips Section */}
        <View style={[styles.tipsCard, { backgroundColor: theme.colors.backgroundSec }]}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
              Tips for a great review
            </Text>
          </View>
          <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
            • Mention specific details about your stay
          </Text>
          <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
            • Describe what made your experience unique
          </Text>
          <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
            • Be honest and constructive
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: rating > 0 && reviewText.trim().length >= 10
                ? theme.colors.primary
                : theme.colors.border,
            },
          ]}
          onPress={handleSubmitReview}
          disabled={isSubmitting || rating === 0 || reviewText.trim().length < 10}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <Text style={styles.submitButtonText}>Submitting...</Text>
          ) : (
            <Text style={styles.submitButtonText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  propertyCard: {
    flexDirection: 'row',
    margin: 20,
    padding: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  propertyInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 13,
    marginBottom: 4,
  },
  propertyDates: {
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  textInputContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    minHeight: 180,
    marginBottom: 8,
  },
  textInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 140,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
  },
  tipsCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});