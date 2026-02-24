// screens/host/BookingDetailsScreen.tsx
import { useTheme } from '@/theme/theme';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const GET_BOOKING_DETAILS = gql`
  query getBooking($bookingId: ID!) {
    getBooking(id: $bookingId) {
      id
      checkIn
      checkOut
      totalPrice
      amountPaid
      currency
      status
      payment_status
      guestCount
      specialRequests
      source
      created_at
      updated_at
      guest {
        id
        name
        email
        phone
        created_at
      }
      property {
        id
        title
        property_type
        address {
          street
          postal_code
          city 
          country 
        }
      }
      room_type {
        id
        name
        base_price
      }
      unit {
        id
        unit_code
      }
      payments {
        id
        amount
        status
        created_at
        payment_method
      }
    }
  }
`;

const UPDATE_HOST_NOTES = gql`
  mutation UpdateBookingNotes($bookingId: Int!, $notes: String!) {
    updateBookingNotes(bookingId: $bookingId, notes: $notes) {
      id
      hostNotes
    }
  }
`;

export default function BookingDetailsScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  console.log(params.id)
  const bookingId = params.id ? parseInt(params.id as string) : null;
  
  const [hostNotes, setHostNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  console.log({bookingId})
  const { data, loading, refetch } = useQuery(GET_BOOKING_DETAILS, {
    variables: { bookingId },
    skip: !bookingId,
  });

  const [updateNotes] = useMutation(UPDATE_HOST_NOTES, {
    onCompleted: () => {
      setIsEditingNotes(false);
      Alert.alert('Success', 'Notes saved successfully');
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', paddingBottom: 100 }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 60 }} />
      </View>
    );
  }

  const booking = data?.getBooking;
  if (!booking) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, alignItems: 'center' }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Booking not found</Text>
      </View>
    );
  }

  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  );
  const nightly_rate = booking.room_type?.base_price || booking.totalPrice / nights;
  const cleaning_fee = 50; // This should come from DB
  const service_fee = booking.totalPrice * 0.1;
  const platform_fee = booking.totalPrice * 0.1;
  const host_payout = booking.totalPrice - platform_fee;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'cancelled':
        return theme.colors.error;
      case 'active':
        return theme.colors.accent;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return theme.colors.success;
      case 'partial':
        return theme.colors.warning;
      case 'unpaid':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const handleCall = () => {
    if (booking.guest.phone) {
      Linking.openURL(`tel:${booking.guest.phone}`);
    }
  };

  const handleEmail = () => {
    if (booking.guest.email) {
      Linking.openURL(`mailto:${booking.guest.email}`);
    }
  };

  const handleMessage = () => {
    // Navigate to messaging screen
    Alert.alert('Message', 'Open chat with guest');
  };

  const handleModify = () => {
    Alert.alert('Modify Booking', 'Modify dates, price, or guest count');
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => console.log('Cancelled') },
      ]
    );
  };

  const timelineEvents = [
    {
      icon: 'create-outline',
      label: 'Booking requested',
      date: booking.created_at,
      color: theme.colors.textSecondary,
    },
    {
      icon: 'checkmark-circle',
      label: 'Booking confirmed',
      date: booking.updated_at,
      color: theme.colors.success,
    },
    {
      icon: 'card',
      label: 'Payment received',
      date: booking.payments?.[0]?.created_at,
      color: theme.colors.success,
    },
    {
      icon: 'calendar',
      label: 'Check-in',
      date: booking.checkIn,
      color: theme.colors.primary,
      upcoming: new Date(booking.checkIn) > new Date(),
    },
  ];


  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header with Status */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Booking Details</Text>
          <Text style={[styles.bookingId, { color: theme.colors.textSecondary }]}>
            #{booking.id}
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Status Badge */}
      <View style={[styles.statusContainer, { backgroundColor: theme.colors.card }]}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
          <Ionicons
            name={
              booking.status === 'confirmed'
                ? 'checkmark-circle'
                : booking.status === 'pending'
                ? 'time'
                : 'close-circle'
            }
            size={20}
            color={getStatusColor(booking.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
            {booking.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Property Information */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="business" size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Property Information
          </Text>
        </View>
        <View style={styles.sectionContent}>
          <Text style={[styles.propertyName, { color: theme.colors.text }]}>
            {booking.property.title}
          </Text>
          <Text style={[styles.unitInfo, { color: theme.colors.textSecondary }]}>
            {booking.room_type?.name} • Unit {booking.unit?.unit_code}
          </Text>
          {booking.property.address && (
            <Text style={[styles.address, { color: theme.colors.textSecondary }]}>
              {booking.property.address.street}, {booking.property.address.city.name},{' '}
              {booking.property.address.postal_code}
            </Text>
          )}
          <TouchableOpacity
            style={styles.viewPropertyButton}
            onPress={() => router.push({
              pathname: '/listing/properties'
            })}
          >
            <Text style={[styles.viewPropertyText, { color: theme.colors.primary }]}>
              View Property →
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Guest Information */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person" size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Guest Information
          </Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.guestHeader}>
            <View style={[styles.guestAvatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.avatarText}>{booking.guest.name.charAt(0)}</Text>
            </View>
            <View style={styles.guestInfo}>
              <Text style={[styles.guestName, { color: theme.colors.text }]}>
                {booking.guest.name}
              </Text>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: theme.colors.success + '20' }]}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                  <Text style={[styles.badgeText, { color: theme.colors.success }]}>
                    Verified
                  </Text>
                </View>
                <Text style={[styles.memberSince, { color: theme.colors.textSecondary }]}>
                  Joined {new Date(booking.guest.created_at).getFullYear()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.contactInfo}>
            <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
              <Ionicons name="call" size={18} color={theme.colors.textSecondary} />
              <Text style={[styles.contactText, { color: theme.colors.text }]}>
                {booking.guest.phone || 'No phone'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
              <Ionicons name="mail" size={18} color={theme.colors.textSecondary} />
              <Text style={[styles.contactText, { color: theme.colors.text }]}>
                {booking.guest.email}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble" size={18} color="#FFF" />
              <Text style={styles.actionBtnText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.colors.backgroundSec }]}
              onPress={() => Alert.alert('View Profile', 'Show full guest profile')}
            >
              <Text style={[styles.actionBtnTextSecondary, { color: theme.colors.text }]}>
                View Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Booking Dates */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Booking Dates</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>
                Check-in
              </Text>
              <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                {new Date(booking.checkIn).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
              <Text style={[styles.dateTime, { color: theme.colors.textSecondary }]}>3:00 PM</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.textSecondary} />
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>
                Check-out
              </Text>
              <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                {new Date(booking.checkOut).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
              <Text style={[styles.dateTime, { color: theme.colors.textSecondary }]}>
                11:00 AM
              </Text>
            </View>
          </View>
          <View style={styles.durationRow}>
            <View style={styles.durationItem}>
              <Ionicons name="moon" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.durationText, { color: theme.colors.text }]}>
                {nights} nights
              </Text>
            </View>
            <View style={styles.durationItem}>
              <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.durationText, { color: theme.colors.text }]}>
                Booked {new Date(parseInt(booking.created_at)).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Guests */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people" size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Guests</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.guestCountRow}>
            <Text style={[styles.guestCountLabel, { color: theme.colors.textSecondary }]}>
              Total guests
            </Text>
            <Text style={[styles.guestCountValue, { color: theme.colors.text }]}>
              {booking.guestCount || 1}
            </Text>
          </View>
        </View>
      </View>

      {/* Payment Details */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="card" size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Payment Details
          </Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
              ${nightly_rate.toFixed(2)} × {nights} nights
            </Text>
            <Text style={[styles.priceValue, { color: theme.colors.text }]}>
              ${(nightly_rate * nights).toFixed(2)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
              Cleaning fee
            </Text>
            <Text style={[styles.priceValue, { color: theme.colors.text }]}>
              ${cleaning_fee.toFixed(2)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
              Service fee
            </Text>
            <Text style={[styles.priceValue, { color: theme.colors.text }]}>
              ${service_fee.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.priceRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Guest paid</Text>
            <Text style={[styles.totalValue, { color: theme.colors.text }]}>
              ${booking.totalPrice.toFixed(2)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
              Platform fee (10%)
            </Text>
            <Text style={[styles.priceValue, { color: theme.colors.error }]}>
              -${platform_fee.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.priceRow}>
            <Text style={[styles.payoutLabel, { color: theme.colors.text }]}>
              Your payout
            </Text>
            <Text style={[styles.payoutValue, { color: theme.colors.text }]}>
              ${host_payout.toFixed(2)} ✓
            </Text>
          </View>

          <View
            style={[
              styles.paymentStatus,
              { backgroundColor: getPaymentStatusColor(booking.payment_status) + '20' },
            ]}
          >
            <Ionicons
              name={booking.payment_status === 'paid' ? 'checkmark-circle' : 'time'}
              size={18}
              color={getPaymentStatusColor(booking.payment_status)}
            />
            <Text
              style={[
                styles.paymentStatusText,
                { color: getPaymentStatusColor(booking.payment_status) },
              ]}
            >
              Payment status: {booking.payment_status.toUpperCase()}
            </Text>
          </View>
          {booking.payment_status === 'paid' && (
            <Text style={[styles.payoutDate, { color: theme.colors.textSecondary }]}>
              Payout date:{' '}
              {new Date(
                new Date(booking.checkOut).getTime() + 24 * 60 * 60 * 1000
              ).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      {/* Special Requests */}
      {booking.specialRequests && (
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbox" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Special Requests
            </Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={[styles.specialRequestText, { color: theme.colors.text }]}>
              "{booking.specialRequests}"
            </Text>
          </View>
        </View>
      )}

      {/* Host Notes */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text" size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Host Notes (Private)
          </Text>
        </View>
        <View style={styles.sectionContent}>
          {isEditingNotes ? (
            <>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    backgroundColor: theme.colors.backgroundInput,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Add private notes about this booking..."
                placeholderTextColor={theme.colors.textPlaceholder}
                multiline
                numberOfLines={4}
                value={hostNotes}
                onChangeText={setHostNotes}
              />
              <View style={styles.notesActions}>
                <TouchableOpacity
                  style={[styles.notesBtn, { backgroundColor: theme.colors.backgroundSec }]}
                  onPress={() => setIsEditingNotes(false)}
                >
                  <Text style={[styles.notesBtnText, { color: theme.colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.notesBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={() => updateNotes({ variables: { bookingId: booking.id, notes: hostNotes } })}
                >
                  <Text style={styles.notesBtnTextPrimary}>Save</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity onPress={() => setIsEditingNotes(true)}>
              <Text
                style={[
                  styles.notesPlaceholder,
                  { color: theme.colors.textPlaceholder },
                ]}
              >
                {hostNotes || 'Add private notes about this booking...'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Booking Timeline */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time" size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Booking Timeline
          </Text>
        </View>
        <View style={styles.sectionContent}>
          {timelineEvents.map((event, index) => (
            <View key={index} style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: event.color },
                  event.upcoming && { borderWidth: 2, borderColor: event.color, backgroundColor: 'transparent' },
                ]}
              >
                <Ionicons
                  name={event.icon as any}
                  size={14}
                  color={event.upcoming ? event.color : '#FFF'}
                />
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, { color: theme.colors.text }]}>
                  {event.label}
                </Text>
                <Text style={[styles.timelineDate, { color: theme.colors.textSecondary }]}>
                  {new Date(parseInt(event.date)).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  {event.upcoming && ' (upcoming)'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Documents & Receipts */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document" size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Documents & Receipts
          </Text>
        </View>
        <View style={styles.sectionContent}>
          <TouchableOpacity style={styles.documentButton}>
            <Ionicons name="download" size={18} color={theme.colors.primary} />
            <Text style={[styles.documentText, { color: theme.colors.primary }]}>
              Download Receipt
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.documentButton}>
            <Ionicons name="download" size={18} color={theme.colors.primary} />
            <Text style={[styles.documentText, { color: theme.colors.primary }]}>
              Download Invoice
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.documentButton}>
            <Ionicons name="eye" size={18} color={theme.colors.primary} />
            <Text style={[styles.documentText, { color: theme.colors.primary }]}>
              View Contract
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.bottomActions}>
        <View style={{gap: 10, flexDirection:'row'}}>
          <TouchableOpacity
            style={[styles.bottomBtn, {flex: 1, backgroundColor: theme.colors.success + 20 }]}
            onPress={handleMessage}
          >
            <Ionicons name="chatbubble-outline" size={20} color={theme.colors.text} />
            <Text style={[styles.bottomBtnText, { color: theme.colors.success }]}>
              Message Guest
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bottomBtn, { flex: 1, backgroundColor: theme.colors.backgroundSec }]}
            onPress={handleModify}
          >
            <Ionicons name="pencil-outline" size={20} color={theme.colors.text} />
            <Text style={[styles.bottomBtnText, { color: theme.colors.text }]}>
              Modify Booking
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.bottomBtn, { backgroundColor: theme.colors.error + '20' }]}
          onPress={handleCancel}
        >
          <Ionicons name="close-circle-outline" size={20} color={theme.colors.error} />
          <Text style={[styles.bottomBtnText, { color: theme.colors.error }]}>
            Cancel Booking
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  backButton: { padding: 4 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  bookingId: { fontSize: 13, marginTop: 2 },
  statusContainer: {
    padding: 16,
    // alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: { fontSize: 14, fontWeight: '700' },
  section: {
    marginTop: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionContent: { gap: 12 },
  propertyName: { fontSize: 18, fontWeight: '700' },
  unitInfo: { fontSize: 14 },
  address: { fontSize: 13, lineHeight: 20 },
  viewPropertyButton: { marginTop: 8 },
  viewPropertyText: { fontSize: 14, fontWeight: '600' },
  guestHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  guestAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  guestInfo: { flex: 1, gap: 6 },
  guestName: { fontSize: 18, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  memberSince: { fontSize: 12 },
  contactInfo: { gap: 10, marginTop: 8 },
  contactRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  contactText: { fontSize: 15 },
  actionButtons: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  actionBtnTextSecondary: { fontSize: 14, fontWeight: '600' },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10
  },
  dateItem: { gap: 4 },
  dateLabel: { fontSize: 12, fontWeight: '600' },
  dateValue: { fontSize: 16, fontWeight: '700' },
  dateTime: { fontSize: 13 },
  durationRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  durationItem: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  durationText: { fontSize: 13 },
  guestCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guestCountLabel: { fontSize: 14 },
  guestCountValue: { fontSize: 16, fontWeight: '700' },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 16, fontWeight: '700' },
  payoutLabel: { fontSize: 16, fontWeight: '700' },
  payoutValue: { fontSize: 18, fontWeight: '800' },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  paymentStatusText: { fontSize: 13, fontWeight: '600' },
  payoutDate: { fontSize: 12, marginTop: 8 },
  specialRequestText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  notesActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  notesBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  notesBtnText: { fontSize: 14, fontWeight: '600' },
  notesBtnTextPrimary: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  notesPlaceholder: { fontSize: 14, padding: 12 },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineContent: { flex: 1, gap: 2 },
  timelineLabel: { fontSize: 14, fontWeight: '600' },
  timelineDate: { fontSize: 12 },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  documentText: { fontSize: 14, fontWeight: '600' },
  bottomActions: {
    padding: 16,
    gap: 10,
  },
  bottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bottomBtnText: { fontSize: 15, fontWeight: '600' },
  errorText: { textAlign: 'center', marginTop: 60, fontSize: 16 },
});