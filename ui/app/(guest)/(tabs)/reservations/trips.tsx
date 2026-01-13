// screens/TripsDashboard.tsx
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// import { useBookingsStore, Booking, BookingStatus } from '../store/bookingsStore';
import { Booking } from '@/stores/bookingStore';
import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

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

export default function TripsDashboard({ navigation }: any) {
  const { theme } = useTheme();
//   const bookings = useBookingsStore((state) => state.bookings);
  const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'past'>('current');
  const bookings = mockBookingsData
  const categorizedBookings = useMemo(() => {
    const now = new Date();
    
    const current = bookings.filter(
      (b) =>
        b.status === 'active' ||
        (b.status === 'upcoming' &&
          new Date(b.checkIn) <= new Date(now.getTime() + 24 * 60 * 60 * 1000))
    );

    const upcoming = bookings.filter(
      (b) =>
        b.status === 'upcoming' &&
        new Date(b.checkIn) > new Date(now.getTime() + 24 * 60 * 60 * 1000)
    );

    const past = bookings.filter(
      (b) => b.status === 'completed' || b.status === 'cancelled'
    );

    return { current, upcoming, past };
  }, [bookings]);

  const activeBookings = categorizedBookings[activeTab];

  const getDaysInfo = (booking: Booking) => {
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    
    if (booking.status === 'active') {
      const daysLeft = Math.ceil((checkOut.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { label: 'Days remaining', value: daysLeft };
    } else if (booking.status === 'upcoming') {
      const daysUntil = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { label: 'Days until check-in', value: daysUntil };
    } else {
      const totalDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return { label: 'Duration', value: totalDays };
    }
  };

  const formatDateRange = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    
    const monthStart = start.toLocaleDateString('en-US', { month: 'short' });
    const monthEnd = end.toLocaleDateString('en-US', { month: 'short' });
    const dayStart = start.getDate();
    const dayEnd = end.getDate();
    
    if (monthStart === monthEnd) {
      return `${monthStart} ${dayStart} - ${dayEnd}`;
    }
    return `${monthStart} ${dayStart} - ${monthEnd} ${dayEnd}`;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'hotel':
        return 'Hotel Stay';
      case 'rental':
        return 'Rental Property';
      case 'purchase':
        return 'Property Purchase';
      default:
        return type;
    }
  };

  const renderTripCard = (booking: any) => {
    const daysInfo = getDaysInfo(booking);
    const isToday = new Date(booking.checkIn).toDateString() === new Date().toDateString();

    return (
      <TouchableOpacity
        key={booking.id}
        style={[styles.tripCard, { backgroundColor: theme.colors.card }]}
        // onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
        onPress={() => router.push('/reservations/details')}
        activeOpacity={0.9}
      >
        {/* Image Section with Gradient Overlay */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: booking.property.imageUrl }}
            style={styles.tripImage}
          />
          {/* <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          /> */}
          
          {/* Type Badge */}
          <View style={[styles.typeBadge, { backgroundColor: theme.colors.card }]}>
            <Ionicons
              name={booking.type === 'hotel' ? 'bed' : booking.type === 'rental' ? 'home' : 'key'}
              size={14}
              color={theme.colors.primary}
            />
            <Text style={[styles.typeText, { color: theme.colors.text }]}>
              {getTypeLabel(booking.type)}
            </Text>
          </View>

          {/* Today Badge */}
          {isToday && (
            <View style={[styles.todayBadge, { backgroundColor: theme.colors.success }]}>
              <Text style={styles.todayText}>TODAY</Text>
            </View>
          )}

          {/* Location on Image */}
          <View style={styles.locationOverlay}>
            <Text style={styles.cityText}>{booking.property.city}</Text>
            <Text style={styles.countryText}>{booking.property.country}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.cardContent}>
          <Text style={[styles.propertyName, { color: theme.colors.text }]} numberOfLines={2}>
            {booking.property.title}
          </Text>

          <View style={styles.dateRow}>
            <Ionicons name="calendar" size={16} color={theme.colors.primary} />
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {formatDateRange(booking.checkIn, booking.checkOut)}
            </Text>
          </View>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <View style={[styles.infoBox, { backgroundColor: theme.colors.backgroundSec }]}>
              <Text style={[styles.infoValue, { color: theme.colors.primary }]}>
                {daysInfo.value}
              </Text>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                {daysInfo.label}
              </Text>
            </View>

            <View style={[styles.infoBox, { backgroundColor: theme.colors.backgroundSec }]}>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {booking.guests}
              </Text>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                {booking.guests === 1 ? 'Guest' : 'Guests'}
              </Text>
            </View>

            <View style={[styles.infoBox, { backgroundColor: theme.colors.backgroundSec }]}>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {booking.currency}
              </Text>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                {booking.totalPrice.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.backgroundSec }]}
            onPress={() => {
              if (booking.status === 'active' || isToday) {
                // Navigate to check-in instructions or directions
                navigation.navigate('BookingDetails', { bookingId: booking.id });
              } else {
                navigation.navigate('BookingDetails', { bookingId: booking.id });
              }
            }}
          >
            <Text style={[styles.actionButtonText, {color: theme.colors.text}]}>
              {booking.status === 'active' ? 'Get directions' : isToday ? 'Check-in Info' : 'View Trip'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Your Journey
            </Text>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Trips
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: theme.colors.card }]}
            onPress={() => {}}
          >
            <Ionicons name="options-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Trips List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.backgroundSec }]}>
              <Ionicons
                name={
                  activeTab === 'current'
                    ? 'location-outline'
                    : activeTab === 'upcoming'
                    ? 'calendar-outline'
                    : 'time-outline'
                }
                size={48}
                color={theme.colors.textSecondary}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              {activeTab === 'current' && "No current trips"}
              {activeTab === 'upcoming' && "No upcoming trips"}
              {activeTab === 'past' && "No past trips"}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              {activeTab === 'past'
                ? "Your completed bookings will appear here"
                : "Start exploring to book your next adventure"}
            </Text>
            {activeTab !== 'past' && (
              <TouchableOpacity
                style={[styles.exploreButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('Explore')}
              >
                <Text style={styles.exploreButtonText}>Explore Properties</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          activeBookings.map((booking) => renderTripCard(booking))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
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
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    // marginBottom: 24,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  tripCard: {
    borderRadius: 24,
    marginBottom: 20,
    // overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    padding: 10
  },
  imageSection: {
    position: 'relative',
    height: 240,
  },
  tripImage: {
    width: '100%',
    height: '100%',
    // backgroundColor: '#f0f0f0',
    borderRadius: 25
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  typeBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  todayBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  todayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  locationOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  cityText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  countryText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  cardContent: {
    paddingHorizontal: 10,
    paddingVertical: 20
  },
  propertyName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 26,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  infoBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
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
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  shadow: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});