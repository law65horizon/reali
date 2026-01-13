// screens/BookingDetails.tsx params
import { useBookingsStore } from '@/stores/bookingStore';
import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';


import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

const mockBookingsData = [
  {
    id: 'booking1',
    type: 'hotel',
    status: 'upcoming',
    property: {
      id: 'property1',
      title: 'Luxury Beachfront Resort',
      address: '123 Beach Ave, Sunny Beach',
      city: 'Sunny Beach',
      country: 'USA',
      imageUrl: 'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg',
      rating: 4.8,
      reviewCount: 150,
    },
    host: {
      id: 'host1',
      name: 'John Doe',
      avatar: 'https://example.com/host1.jpg',
      phone: '+1 234 567 890',
      email: 'johndoe@example.com',
      responseTime: '1 hour',
    },
    checkIn: '2025-12-01T14:00:00Z',
    checkOut: '2025-12-07T11:00:00Z',
    guests: 2,
    totalPrice: 1200,
    currency: 'USD',
    bookingReference: 'ABC12345',
    createdAt: '2025-10-01T10:00:00Z',
    payments: [
      {
        id: 'payment1',
        amount: 1200,
        currency: 'USD',
        date: '2025-10-01T10:00:00Z',
        status: 'paid',
        method: 'credit card',
        type: 'full',
      },
    ],
    specialRequests: 'Late check-in at 10 PM.',
    cancellationPolicy: 'Free cancellation until 24 hours before check-in.',
    checkInInstructions: 'Check-in at the front desk after 2 PM.',
    accessCode: 'XYZ987654321',
    securityDeposit: {
      amount: 200,
      status: 'held',
      returnDate: '2025-12-15T00:00:00Z',
    },
    canModify: true,
    canCancel: true,
  },
  {
    id: 'booking2',
    type: 'rental',
    status: 'active',
    property: {
      id: 'property2',
      title: 'Cozy Mountain Cabin',
      address: '456 Mountain Rd, Mountain Town',
      city: 'Mountain Town',
      country: 'Canada',
      imageUrl: 'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg',
      rating: 4.5,
      reviewCount: 75,
    },
    host: {
      id: 'host2',
      name: 'Alice Smith',
      avatar: 'https://example.com/host2.jpg',
      phone: '+1 555 123 4567',
      email: 'alicesmith@example.com',
      responseTime: '2 hours',
    },
    checkIn: '2025-11-15T16:00:00Z',
    checkOut: '2025-11-20T12:00:00Z',
    guests: 4,
    totalPrice: 800,
    currency: 'CAD',
    bookingReference: 'XYZ98765',
    createdAt: '2025-08-20T08:30:00Z',
    payments: [
      {
        id: 'payment2',
        amount: 800,
        currency: 'CAD',
        date: '2025-08-20T08:30:00Z',
        status: 'paid',
        method: 'bank transfer',
        type: 'deposit',
      },
    ],
    specialRequests: 'Pet-friendly cabin, please.',
    cancellationPolicy: '50% refund if cancelled 7 days before check-in.',
    checkInInstructions: 'Key pickup at local office.',
    accessCode: 'CABIN12345',
    securityDeposit: {
      amount: 150,
      status: 'pending',
    },
    canModify: false,
    canCancel: true,
  },
  {
    id: 'booking3',
    type: 'purchase',
    status: 'completed',
    property: {
      id: 'property3',
      title: 'Downtown Apartment',
      address: '789 City Blvd, City Center',
      city: 'City Center',
      country: 'UK',
      imageUrl: 'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg',
      rating: 4.9,
      reviewCount: 200,
    },
    host: {
      id: 'host3',
      name: 'Emma Johnson',
      avatar: 'https://example.com/host3.jpg',
      phone: '+44 1234 567890',
      email: 'emmajohnson@example.com',
      responseTime: '30 minutes',
    },
    checkIn: '2025-05-01T15:00:00Z',
    checkOut: '2025-05-02T10:00:00Z',
    guests: 1,
    totalPrice: 350000,
    currency: 'GBP',
    bookingReference: 'LMN67890',
    createdAt: '2025-03-15T12:00:00Z',
    payments: [
      {
        id: 'payment3',
        amount: 350000,
        currency: 'GBP',
        date: '2025-03-15T12:00:00Z',
        status: 'paid',
        method: 'mortgage',
        type: 'full',
      },
    ],
    specialRequests: 'Please include parking spot.',
    cancellationPolicy: 'No cancellations after purchase.',
    checkInInstructions: 'Owner will meet at the property for keys.',
    accessCode: 'DTA12345',
    securityDeposit: {
      amount: 5000,
      status: 'returned',
      returnDate: '2025-05-05T00:00:00Z',
    },
    canModify: false,
    canCancel: false,
  },
  {
    id: 'booking4',
    type: 'rental',
    status: 'cancelled',
    property: {
      id: 'property4',
      title: 'Luxe Beach House',
      address: '101 Ocean Ave, Coastal Town',
      city: 'Coastal Town',
      country: 'Australia',
      imageUrl: 'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg',
      rating: 4.7,
      reviewCount: 50,
    },
    host: {
      id: 'host4',
      name: 'David Miller',
      avatar: 'https://example.com/host4.jpg',
      phone: '+61 412 345 678',
      email: 'davidmiller@example.com',
      responseTime: '4 hours',
    },
    checkIn: '2025-07-10T14:00:00Z',
    checkOut: '2025-07-17T11:00:00Z',
    guests: 3,
    totalPrice: 2500,
    currency: 'AUD',
    bookingReference: 'OPQ45678',
    createdAt: '2025-06-05T15:00:00Z',
    payments: [
      {
        id: 'payment4',
        amount: 2500,
        currency: 'AUD',
        date: '2025-06-05T15:00:00Z',
        status: 'pending',
        method: 'credit card',
        type: 'full',
      },
    ],
    specialRequests: 'Include breakfast service.',
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
    checkInInstructions: 'Check-in at front desk.',
    accessCode: 'BEACH12345',
    securityDeposit: {
      amount: 300,
      status: 'held',
    },
    canModify: true,
    canCancel: true,
  },
];

export default function BookingDetails({ route}: any) {
//   const { bookingId } = route.params;
  const bookingId = 4
  const { theme } = useTheme();
//   const booking = useBookingsStore((state:any) =>
//     state.bookings.find((b:any) => b.id === bookingId)
//   );
  const booking = mockBookingsData[2]
  const cancelBooking = useBookingsStore((state:any) => state.cancelBooking);
  
  const headerHeight = 60; // Height of the header
  const imageHeight = 320;

  const [showQR, setShowQR] = useState(false);

  const lastScrollY = useRef(0);
  const isPulling = useRef(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation()


  if (!booking) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Booking not found</Text>
      </View>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCall = () => {
    if (booking.host?.phone) {
      Linking.openURL(`tel:${booking.host.phone}`);
    }
  };

  const handleEmail = () => {
    if (booking.host?.email) {
      Linking.openURL(`mailto:${booking.host.email}`);
    }
  };

  const handleGetDirections = () => {
    const address = encodeURIComponent(
      `${booking.property.address}, ${booking.property.city}`
    );
    Linking.openURL(`https://maps.google.com/?q=${address}`);
  };

  const handleCopyReference = async () => {
    await Clipboard.setStringAsync(booking.bookingReference);
    Alert.alert('Copied', 'Booking reference copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My booking at ${booking.property.title}\nReference: ${booking.bookingReference}\nCheck-in: ${formatDate(booking.checkIn)}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            cancelBooking(bookingId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getStatusColor = () => {
    switch (booking.status) {
      case 'upcoming':
        return theme.colors.primary;
      case 'active':
        return theme.colors.success;
      case 'completed':
        return theme.colors.textSecondary;
      case 'cancelled':
        return theme.colors.error;
      case 'pending':
        return theme.colors.warning;
    }
  };

  useFocusEffect(
      React.useCallback(() => {
        scrollY.setValue(0)
        isPulling.current = false
        // scrollRef.current?.scale
      }, [])
    )  

  const handleScroll = Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      {
        useNativeDriver: false,
        listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
          const currentScrollY = event.nativeEvent.contentOffset.y;
          const isAtTop = currentScrollY <= 0;
  
          // if (currentScrollY < -130 && !isPulling.current) {
          //   isPulling.current = true;
          //   navigation.goBack();
          // }
  
          lastScrollY.current = currentScrollY;
          // console.log('ops',lastScrollY.current)
        },
      }
    );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Image */}
        <Animated.View style={[
          styles.headerOverlay,
          {
            backgroundColor: scrollY.interpolate({
              inputRange: [0, imageHeight - headerHeight - 35],
              // outputRange: ['transparent', 'rgba(0, 0, 0, 0.)'],
              outputRange: ['transparent', [theme.colors.background].toString()],
              extrapolate: 'clamp',
            }),
            borderBottomWidth: scrollY.interpolate({
              inputRange: [imageHeight - headerHeight, imageHeight - 35],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            borderBottomColor: theme.colors.backgroundSec,
            top: 0,
            // paddingTop: scrollY.interpolate({
            //   inputRange: [-130, 0],
            //   outputRange: [165, 40],
            //   extrapolate: 'clamp'
            // })
          },
        ]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      
      <ScrollView onScroll={handleScroll} contentContainerStyle={{paddingBottom: 100}} showsVerticalScrollIndicator={false}>
        <View>
          <Image
            source={{ uri: booking.property.imageUrl }}
            style={styles.headerImage}
          />
           <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor() },
          ]}
        >
          <Text style={styles.statusText}>
            {booking.status.toUpperCase()}
          </Text>
        </View>
        </View>
        {/* Property Info */}
        <View style={styles.section}>
          <Text style={[styles.propertyTitle, { color: theme.colors.text }]}>
            {booking.property.title}
          </Text>
          
          <View style={styles.locationRow}>
            <Ionicons
              name="location"
              size={16}
              color={theme.colors.primary}
            />
            <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>
              {booking.property.address}, {booking.property.city}
            </Text>
          </View>

          {booking.property.rating && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text style={[styles.ratingText, { color: theme.colors.text }]}>
                {booking.property.rating} ({booking.property.reviewCount} reviews)
              </Text>
            </View>
          )}
        </View>

        {/* Booking Reference */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="qr-code-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Booking Reference
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.referenceContainer}
            onPress={handleCopyReference}
          >
            <Text style={[styles.referenceText, { color: theme.colors.text }]}>
              {booking.bookingReference}
            </Text>
            <Ionicons
              name="copy-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.qrButton, { backgroundColor: theme.colors.backgroundSec }]}
            onPress={() => setShowQR(!showQR)}
          >
            <Text style={[styles.qrButtonText, { color: theme.colors.text }]}>
              {showQR ? 'Hide QR Code' : 'Show QR Code'}
            </Text>
          </TouchableOpacity>

          {showQR && (
            <View style={styles.qrContainer}>
              <QRCode
                value={booking.bookingReference}
                size={200}
                backgroundColor="white"
              />
            </View>
          )}
        </View>

        {/* Check-in/Check-out */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Stay Details
            </Text>
          </View>

          <View style={styles.dateGrid}>
            <View style={styles.dateGridItem}>
              <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>
                CHECK-IN
              </Text>
              <Text style={[styles.dateText, { color: theme.colors.text }]}>
                {formatDate(booking.checkIn)}
              </Text>
              <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                After 3:00 PM
              </Text>
            </View>

            <View style={[styles.dateDivider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.dateGridItem}>
              <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>
                CHECK-OUT
              </Text>
              <Text style={[styles.dateText, { color: theme.colors.text }]}>
                {formatDate(booking.checkOut)}
              </Text>
              <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                Before 11:00 AM
              </Text>
            </View>
          </View>

          <View style={styles.guestsRow}>
            <Ionicons
              name="people-outline"
              size={18}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.guestsText, { color: theme.colors.text }]}>
              {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
            </Text>
          </View>
        </View>

        {/* Access Instructions */}
        {booking.accessCode && (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="key-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Access Code
              </Text>
            </View>
            
            <View style={[styles.accessCodeBox, { backgroundColor: theme.colors.backgroundSec }]}>
              <Text style={[styles.accessCode, { color: theme.colors.primary }]}>
                {booking.accessCode}
              </Text>
            </View>
            
            {booking.checkInInstructions && (
              <Text style={[styles.instructions, { color: theme.colors.textSecondary }]}>
                {booking.checkInInstructions}
              </Text>
            )}
          </View>
        )}

        {/* Host Information */}
        {booking.host && (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Your Host
              </Text>
            </View>

            <View style={styles.hostInfo}>
              <Image
                source={{
                  uri: booking.host.avatar || 'https://via.placeholder.com/50',
                }}
                style={styles.hostAvatar}
              />
              <View style={styles.hostDetails}>
                <Text style={[styles.hostName, { color: theme.colors.text }]}>
                  {booking.host.name}
                </Text>
                {booking.host.responseTime && (
                  <Text style={[styles.hostMeta, { color: theme.colors.textSecondary }]}>
                    Usually responds in {booking.host.responseTime}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: theme.colors.backgroundSec }]}
                onPress={handleCall}
              >
                <Ionicons name="call-outline" size={20} color={theme.colors.text} />
                <Text style={[styles.contactButtonText, { color: theme.colors.text }]}>
                  Call
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: theme.colors.backgroundSec }]}
                onPress={handleEmail}
              >
                <Ionicons name="mail-outline" size={20} color={theme.colors.text} />
                <Text style={[styles.contactButtonText, { color: theme.colors.text }]}>
                  Email
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: theme.colors.backgroundSec }]}
                onPress={() => {}}
              >
                <Ionicons name="chatbubble-outline" size={20} color={theme.colors.text} />
                <Text style={[styles.contactButtonText, { color: theme.colors.text }]}>
                  Message
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Payment Summary */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="wallet-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Payment Summary
            </Text>
          </View>

          {booking.payments.map((payment:any) => (
            <View key={payment.id} style={styles.paymentRow}>
              <View style={styles.paymentLeft}>
                <Text style={[styles.paymentType, { color: theme.colors.text }]}>
                  {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)} Payment
                </Text>
                <Text style={[styles.paymentDate, { color: theme.colors.textSecondary }]}>
                  {new Date(payment.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.paymentAmount, { color: theme.colors.text }]}>
                {payment.currency} {payment.amount.toLocaleString()}
              </Text>
            </View>
          ))}

          <View style={[styles.totalRow, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
              Total Paid
            </Text>
            <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>
              {booking.currency} {booking.totalPrice.toLocaleString()}
            </Text>
          </View>

          {booking.securityDeposit && (
            <View style={[styles.depositBox, { backgroundColor: theme.colors.backgroundSec }]}>
              <View style={styles.depositRow}>
                <Text style={[styles.depositLabel, { color: theme.colors.textSecondary }]}>
                  Security Deposit
                </Text>
                <Text style={[styles.depositAmount, { color: theme.colors.text }]}>
                  {booking.currency} {booking.securityDeposit.amount}
                </Text>
              </View>
              <Text style={[styles.depositStatus, { color: theme.colors.textSecondary }]}>
                Status: {booking.securityDeposit.status}
              </Text>
            </View>
          )}
        </View>

        {/* Special Requests */}
        {booking.specialRequests && (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="list-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Special Requests
              </Text>
            </View>
            <Text style={[styles.requestsText, { color: theme.colors.textSecondary }]}>
              {booking.specialRequests}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleGetDirections}
          >
            <Ionicons name="navigate" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Get Directions</Text>
          </TouchableOpacity>

          {booking.canModify && booking.status === 'upcoming' && (
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
              // onPress={() => navigation.navigate('ModifyBooking', { bookingId })}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                Modify Booking
              </Text>
            </TouchableOpacity>
          )}

          {booking.canCancel && booking.status !== 'cancelled' && (
            <TouchableOpacity
              style={[styles.dangerButton, { borderColor: theme.colors.error }]}
              onPress={handleCancelBooking}
            >
              <Text style={[styles.dangerButtonText, { color: theme.colors.error }]}>
                Cancel Booking
              </Text>
            </TouchableOpacity>
          )}

          {true && (
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
              // onPress={() => navigation.navigate('WriteReview', { bookingId })}
            >
              <Ionicons name="star-outline" size={20} color={theme.colors.text} />
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                Write a Review
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: 320,
    backgroundColor: '#f0f0f0',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 50,
    zIndex: 30
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    paddingBottom: 10,
  },
  propertyTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  referenceText: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 2,
  },
  qrButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  qrButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  dateGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateGridItem: {
    flex: 1,
  },
  dateDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 13,
  },
  guestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  guestsText: {
    fontSize: 15,
    fontWeight: '600',
  },
  accessCodeBox: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  accessCode: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 4,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 20,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  hostAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  hostDetails: {
    flex: 1,
  },
  hostName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  hostMeta: {
    fontSize: 13,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  paymentLeft: {
    flex: 1,
  },
  paymentType: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '700',
  },
  depositBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  depositRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  depositLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  depositAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  depositStatus: {
    fontSize: 12,
  },
  requestsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  dangerButton: {
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});