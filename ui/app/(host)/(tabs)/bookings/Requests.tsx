// screens/host/RequestsTabScreen.tsx

import { useTheme } from '@/theme/theme';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
// import { differenceInHours, formatDistanceToNow } from 'date-fns';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const mock = {
  "data": {
    "myBookingsByStatus": [
      {
        "__typename": "Booking",
        "id": "book_7721",
        "amountPaid": 45000,
        "totalPrice": 120000,
        "currency": "NGN",
        "status": "CONFIRMED",
        "payment_status": "PARTIAL",
        specialRequests: "geoiwow",
        "source": "DIRECT",
        "guestCount": 2,
        "cancellationPolicy": "MODERATE",
        "checkIn": "2026-03-15T14:00:00Z",
        "checkOut": "2026-03-20T11:00:00Z",
        "created_at": "2026-02-01T09:30:00Z",
        "guest": {
          "__typename": "User",
          "id": "user_990",
          "name": "Chidi Okoro",
          "email": "chidi@example.com",
          "phone": "+2348031234567"
        },
        "property": {
          "__typename": "Property",
          "id": "prop_441",
          "title": "Luxury Penthouse Victoria Island",
          "property_type": "APARTMENT"
        },
        "room_type": {
          "__typename": "RoomType",
          "id": "room_552",
          "name": "Executive Suite",
          "base_price": 24000
        },
        "unit": {
          "__typename": "RoomUnit",
          "id": "unit_101",
          "unit_code": "VI-P-101"
        }
      }
    ]
  }
}


const GET_PENDING_BOOKINGS = gql`
  query GetPendingBookings {
    getPendingBookings {
      id
      check_in
      check_out
      total_price
      amount_paid
      currency
      status
      payment_status
      guest_count
      special_requests
      created_at
      nights
      property {
        id
        title
        property_type
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
      guest {
        id
        name
        email
        phone
      }
    }
  }
`;

const APPROVE_BOOKING = gql`
  mutation ApproveBooking($input: ApproveBookingInput!) {
    approveBooking(input: $input) {
      success
      message
    }
  }
`;

const DECLINE_BOOKING = gql`
  mutation DeclineBooking($input: DeclineBookingInput!) {
    declineBooking(input: $input) {
      success
      message
    }
  }
`;

export default function RequestsTabScreen() {
  const { theme } = useTheme();
  const { data, loading, refetch } = useQuery(GET_PENDING_BOOKINGS, {
    // pollInterval: 30000,
  });

  const [approveBooking, { loading: approving }] = useMutation(APPROVE_BOOKING);
  const [declineBooking, { loading: declining }] = useMutation(DECLINE_BOOKING);

  const bookings = mock.data?.myBookingsByStatus || [];
  console.log({bookings})
//   const bookings = data?.getPendingBookings || [];

  const handleApprove = async (bookingId: string) => {
    Alert.alert(
      'Approve Booking',
      'Confirm this booking request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              const { data } = await approveBooking({
                variables: {
                  input: { booking_id: bookingId },
                },
              });

              if (data?.approveBooking?.success) {
                Alert.alert('Success', 'Booking approved!');
                // refetch();
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to approve booking');
            }
          },
        },
      ]
    );
  };

  const handleDecline = async (bookingId: string) => {
    Alert.alert(
      'Decline Booking',
      'Are you sure you want to decline this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data } = await declineBooking({
                variables: {
                  input: {
                    booking_id: bookingId,
                    reason: 'Host declined',
                  },
                },
              });

              if (data?.declineBooking?.success) {
                Alert.alert('Declined', 'Booking request declined');
                // refetch();
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to decline booking');
            }
          },
        },
      ]
    );
  };

  const renderBookingCard = (booking: any) => {
    // const requestedAgo = formatDistanceToNoW(new Date(booking.created_at), { addSuffix: true });
    // const hoursOld = differenceInHours(new Date(), new Date(booking.created_at));
    const requestedAgo = 10
    const hoursOld = 10
    const isUrgent = hoursOld >= 20; // Urgent if > 20 hours old

    return (
      <View
        key={booking.id}
        style={[
          styles.bookingCard,
          { backgroundColor: theme.colors.card },
          isUrgent && { borderLeftWidth: 4, borderLeftColor: theme.colors.error },
        ]}
      >
        {/* Urgent Badge */}
        {true && (
          <View style={[styles.urgentBadge, { backgroundColor: 'transparent' }]}>
            <Ionicons name="warning" size={14} color="#FFFFFF" />
            <Text style={styles.urgentText}>Respond soon</Text>
          </View>
        )}

        {/* Property Info */}
        <TouchableOpacity
          style={styles.propertySection}
        //   onPress={() => router.push({
        //     pathname: '/host/bookings/details/[id]',
        //     params: { id: booking.id }
        //   })}
          activeOpacity={0.7}
        >
          <View style={styles.propertyHeader}>
            <View style={[styles.propertyIcon, { backgroundColor: theme.colors.primary + '15' }]}>
              <Ionicons name="business" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.propertyInfo}>
              <Text style={[styles.propertyTitle, { color: theme.colors.text }]} numberOfLines={1}>
                {booking.property.title}
              </Text>
              <Text style={[styles.propertySubtitle, { color: theme.colors.textSecondary }]}>
                {booking.room_type.name} • Unit {booking.unit.unit_code}
              </Text>
            </View>
            <Text style={[styles.bookingId, { color: theme.colors.textSecondary }]}>
              #{booking.id}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Guest Info */}
        <View style={styles.guestSection}>
          <View style={styles.guestHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.avatarText}>
                {booking.guest.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.guestInfo}>
              <Text style={[styles.guestName, { color: theme.colors.text }]}>
                {booking.guest.name}
              </Text>
              <Text style={[styles.guestContact, { color: theme.colors.textSecondary }]}>
                {booking.guest.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Check-in
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {new Date(booking.checkIn).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Check-out
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {new Date(booking.checkOut).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="moon-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Nights
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {booking.nights}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Guests
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {booking.guestCount || 1}
              </Text>
            </View>

            <View style={[styles.detailItem, { flex: 2 }]}>
              <Ionicons name="cash-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Total
              </Text>
              <Text style={[styles.priceValue, { color: theme.colors.primary }]}>
                ${booking.totalPrice.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Special Requests */}
        {booking.specialRequests && (
          <View style={[styles.requestsSection, { backgroundColor: theme.colors.backgroundSec }]}>
            <View style={styles.requestsHeader}>
              <Ionicons name="chatbox-ellipses-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.requestsLabel, { color: theme.colors.textSecondary }]}>
                Special Request:
              </Text>
            </View>
            <Text style={[styles.requestsText, { color: theme.colors.text }]} numberOfLines={2}>
              "{booking.specialRequests}"
            </Text>
          </View>
        )}

        {/* Time Info */}
        <View style={styles.timeInfo}>
          <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
            Requested {requestedAgo}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton, { backgroundColor: theme.colors.error + '15' }]}
            onPress={() => handleDecline(booking.id)}
            disabled={declining}
          >
            {declining ? (
              <ActivityIndicator size="small" color={theme.colors.error} />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color={theme.colors.error} />
                <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
                  Decline
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton, { backgroundColor: theme.colors.backgroundSec }]}
            onPress={() => {
              // TODO: Open messaging
              Alert.alert('Coming Soon', 'Messaging feature');
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color={theme.colors.text} />
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
              Message
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton, { backgroundColor: theme.colors.success }]}
            onPress={() => handleApprove(booking.id)}
            disabled={approving}
          >
            {approving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                  Approve
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

//   if (loading) {
//     return (
//       <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
//         <ActivityIndicator size="large" color={theme.colors.primary} />
//       </View>
//     );
//   }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refetch} />
      }
    >
      {bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.backgroundSec }]}>
            <Ionicons name="checkmark-done" size={48} color={theme.colors.success} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            All caught up! 🎉
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            No pending booking requests at the moment
          </Text>
        </View>
      ) : (
        <>
          {bookings.map((booking: any) => renderBookingCard(booking))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  bookingCard: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  urgentBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  propertySection: {
    marginBottom: 16,
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  propertyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  propertySubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  bookingId: {
    fontSize: 12,
    fontWeight: '600',
  },
  guestSection: {
    marginBottom: 16,
  },
  guestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  guestContact: {
    fontSize: 13,
  },
  detailsSection: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    gap: 4,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  requestsSection: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  requestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  requestsLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestsText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  declineButton: {
    flex: 0.8,
  },
  messageButton: {
    flex: 1,
  },
  approveButton: {
    flex: 1.2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});