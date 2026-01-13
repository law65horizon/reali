

// ReservationScreen.tsx
import DraggableModal from '@/components/DraggableModal';
import { ThemedText } from '@/components/ThemedText';
import CustomDay from '@/components/ui/CustomDay';
import { useTheme } from '@/theme/theme';
import { gql, useQuery } from '@apollo/client';
import { Entypo } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useLocalSearchParams, useNavigation, } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { ScreenWidth } from 'react-native-elements/dist/helpers';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function formatTimestamp(timestamp:string) {
  const date = new Date(parseInt(timestamp));
  
  // Extract the year, month, and day
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so we add 1
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}


// GraphQL Queries
const GET_ROOM_TYPE = gql`
  query GetRoomType($id: ID!) {
    getRoomType(id: $id) {
      id
      name
      description
      capacity
      basePrice
      weeklyRate
      monthlyRate
      currency
      amenities
      property {
        id
        title
      }
    }
  }
`;

const GET_RATE_CALENDAR = gql`
  query GetRateCalendar($id: ID!, $startDate: String!, $endDate: String!) {
    getAvailability(id: $id, startDate: $startDate, endDate: $endDate) {
      date
      nightly_rate
      min_stay
      is_blocked
    }
  }
`;



// const CREATE_BOOKING = gql`
//   mutation CreateBooking($input: CreateBookingInput!) {
//     createBooking(input: $input) {
//       success
//       message
//       booking {
//         id
//         checkIn
//         checkOut
//         totalPrice
//         status
//       }
//       errors
//     }
//   }
// `;

type RentalType = 'daily' | 'monthly';

const ReservationScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  // const route = useRoute();
  const { query } = useLocalSearchParams()

  const [selectedDates, setSelectedDates] = useState<{
    [key: string]: { selected: boolean; marked?: boolean; dotColor?: string };
  }>({});
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(null);
  const [duration, setDuration] = useState(1);
  const [guests, setGuests] = useState(1);
  const [paymentOption, setPaymentOption] = useState('full');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);

  // GraphQL Hooks
  const { data: roomTypeData, loading: roomTypeLoading } = useQuery(GET_ROOM_TYPE, {
    variables: { id: query }
  });

  // const [getRateCalendar, { data: rateCalendarData, loading: calendarLoading }] = useLazyQuery(
  //   GET_RATE_CALENDAR
  // );

  const { data: rateCalendarData, loading: calendarLoading } = useQuery(
    GET_RATE_CALENDAR, {
      variables: {
        id: query,
        startDate: "2025-11-21",
        endDate: "2026-11-21"
      }
    }
  );

  // console.log({dos: rateCalendarData?.getAvailability})

  // const [calculatePrice, { data: priceData, loading: priceLoading }] = useLazyQuery(
  //   CALCULATE_BOOKING_PRICE
  // );

  const priceData = {
    calculateBookingPrice: {
      nights: 8,
      useNightlyRates: false,
      total: 10,
      currency: 'usd',
      checkIn: "2025-11-21",
      checkOut: "2025-11-21",
      breakdown: {
        periodType: 'weekly',
        subtotal: 10.0,
        periodRate: 4,
        cleaningFee: 0,
        serviceFee: 0,
        serviceFeePercent: 20,
        discount: 10,
        discountPercent: 10,
        nightlyRateDetails: {
          date: '2024-2-11',
          rate: 20
        }
      }
    }
  }
  // const [createBooking, { loading: bookingLoading }] = useMutation(CREATE_BOOKING);

  // Fetch rate calendar for next 6 months when component mounts
  useEffect(() => {
    const startDate = dayjs().format('YYYY-MM-DD');
    const endDate = dayjs().add(6, 'month').format('YYYY-MM-DD');
    
    
  }, [query]);

  // Process rate calendar to get disabled dates
  const disabledDates = useMemo(() => {
    if (!rateCalendarData?.getAvailability) return {};
    
    const disabled: { [key: string]: { disabled: boolean; disableTouchEvent: boolean } } = {};
    
    rateCalendarData.getAvailability.forEach((day: any) => {
      if (day.is_blocked === true) {
        console.log('disabled:', new Date(parseInt(day.date)), day.is_blocked)
        disabled[formatTimestamp(day.date)] = { disabled: true, disableTouchEvent: true };
      }
    });
    
    return disabled;
  }, [rateCalendarData]);

  console.log({selectedDates})

  const mergedMarkedDates = useMemo(() => {
    return { ...disabledDates, ...selectedDates };
  }, [disabledDates, selectedDates]);

  // Handle date selection for range
  const handleDayPress = (day: any) => {
    console.log({day})
    const dateStr = day.dateString;
    
    if (disabledDates[dateStr]) {
      Alert.alert('Date Unavailable', 'This date is not available for booking.');
      return;
    }

    setSelectedDates({
        [dateStr]: { selected: true, marked: true }
      });
    // if (!checkInDate || (checkInDate && checkOutDate)) {
    //   // Start new selection
    //   setCheckInDate(dateStr);
    //   setCheckOutDate(null);
    //   setSelectedDates({
    //     [dateStr]: { selected: true, marked: true }
    //   });
    // } else {
    //   // Complete the range
    //   if (dayjs(dateStr).isBefore(dayjs(checkInDate))) {
    //     // Selected date is before check-in, swap them
    //     setCheckOutDate(checkInDate);
    //     setCheckInDate(dateStr);
    //   } else {
    //     setCheckOutDate(dateStr);
    //   }
      
    //   // Mark all dates in range
    //   const start = dayjs(checkInDate).isBefore(dayjs(dateStr)) ? checkInDate : dateStr;
    //   const end = dayjs(checkInDate).isBefore(dayjs(dateStr)) ? dateStr : checkInDate;
    //   const marked: typeof selectedDates = {};
      
    //   let current = dayjs(start);
    //   while (current.isBefore(dayjs(end)) || current.isSame(dayjs(end), 'day')) {
    //     marked[current.format('YYYY-MM-DD')] = {
    //     selected: true,
    //     marked: true,
    //     dotColor: theme.colors.primary
    //     };
    //     current = current.add(1, 'day');
    //   }
      
    //   setSelectedDates(marked);
    // }
  };

  // Validation
  const isValidReservation = useMemo(() => {
    if (!roomTypeData?.roomType) return false;
    
    const hasValidDates = checkInDate && checkOutDate
    
    const meetsMinStay = priceData?.calculateBookingPrice?.nights >= 1;
    const withinCapacity = guests > 0 && guests <= roomTypeData.roomType.capacity;
    
    return hasValidDates && meetsMinStay && withinCapacity && agreedToTerms;
  }, [checkInDate, checkOutDate, guests, agreedToTerms, priceData, roomTypeData]);

  // Handle booking submission
  const handleCreateBooking = async () => {
    console.error({createBooking: "moiwoewiw"})
    if (!isValidReservation) return;

    try {
      // const { data } = await createBooking({
      //   variables: {
      //     input: {
      //       query,
      //       checkIn: checkInDate,
      //       checkOut: rentalType === 'daily' ? checkOutDate : dayjs(checkInDate).add(duration, 'month').format('YYYY-MM-DD'),
      //       guestCount: guests,
      //       paymentOption: paymentOption.toUpperCase()
      //     }
      //   }
      // });

      // if (data?.createBooking?.success) {
      //   Alert.alert(
      //     'Booking Confirmed!',
      //     'Your reservation has been successfully created.',
      //     [
      //       {
      //         text: 'OK',
      //         onPress: () => navigation.goBack()
      //       }
      //     ]
      //   );
      // } else {
      //   Alert.alert(
      //     'Booking Failed',
      //     data?.createBooking?.message || 'Unable to create booking',
      //     [{ text: 'OK' }]
      //   );
      // }
    } catch (error: any) {
      Alert.alert('Error', error.message, [{ text: 'OK' }]);
    }
  };

  if (roomTypeLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const roomType = roomTypeData?.roomType;
  const pricing = priceData?.calculateBookingPrice;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginVertical: 20, alignSelf: 'flex-end'}}>
          <Entypo name='cross' size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image 
            source={{ uri: roomType?.property?.images?.[0]?.url || 'https://via.placeholder.com/60' }} 
            style={styles.thumbnail} 
          />
          <View style={styles.headerText}>
            <Text style={[styles.propertyTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {roomType?.name || 'Loading...'}
            </Text>
            <Text style={[styles.priceText, { color: theme.colors.text }]}>
              {/* ${rentalType === 'daily' ? roomType?.basePrice : roomType?.monthlyRate}
              <Text style={styles.priceUnit}>/{rentalType === 'daily' ? 'night' : 'month'}</Text> */}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Rental Type Selector */}
        {/* <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Rental Type</Text>
          <View style={[styles.segment, {backgroundColor: theme.mode == 'light'? '#E5E7EB': theme.colors.background2}]}>
            {(['daily', 'monthly'] as RentalType[]).map(type => {
              const isActive = rentalType === type;
              return (
                <TouchableOpacity 
                  key={type} 
                  style={[styles.segmentBtn, isActive && styles.segmentBtnActive, isActive && {backgroundColor: theme.colors.background}]} 
                  onPress={() => {
                    setRentalType(type);
                    setCheckInDate(null);
                    setCheckOutDate(null);
                    setDuration(1);
                    setSelectedDates({});
                  }}
                >
                  <ThemedText style={styles.segmentText}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View> */}
        
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {'Check-in & Check-out'}
          </Text>
          
          <TouchableOpacity
            style={[styles.dateButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.backgroundSec }]}
            onPress={() => setDateModalVisible(true)}
          >
            <View style={styles.dateButtonContent}>
              <View>
                <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>Check-in</Text>
                <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                  {checkInDate ? dayjs(checkInDate).format('MMM D, YYYY') : 'Select date'}
                </Text>
              </View>
              
              <>
                <Text style={[styles.dateSeparator, { color: theme.colors.textSecondary }]}>→</Text>
                <View>
                  <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>Check-out</Text>
                  <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                    {checkOutDate ? dayjs(checkOutDate).format('MMM D, YYYY') : 'Select date'}
                  </Text>
                </View>
              </>
            </View>
          </TouchableOpacity>

          <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
            {pricing.nights} {pricing.nights === 1 ? 'night' : 'nights'}
            {pricing.useNightlyRates ? ' • Using nightly rates' : ` • Using ${pricing.breakdown.periodType} rates`}
          </Text>
        </View>

        {/* Guest Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Guests</Text>
          <View style={styles.guestContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              Number of guests (Max {roomType?.capacity || 4})
            </Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={[styles.stepperButton, { borderColor: theme.colors.border }]}
                onPress={() => setGuests(Math.max(1, guests - 1))}
              >
                <Text style={[styles.stepperButtonText, { color: theme.colors.text }]}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.durationValue, { color: theme.colors.text }]}>{guests}</Text>
              <TouchableOpacity
                style={[styles.stepperButton, { borderColor: theme.colors.border }]}
                onPress={() => setGuests(Math.min(roomType?.capacity || 4, guests + 1))}
              >
                <Text style={[styles.stepperButtonText, { color: theme.colors.text }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Pricing Summary */}
        {pricing && (
          <View style={[styles.section, {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}]}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Total Price</Text>
              <Text style={[{ color: theme.colors.text, fontSize: 18, fontWeight: '600' }]}>
                ${pricing.total.toFixed(2)} {pricing.currency}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setPriceModalVisible(true)} 
              style={{backgroundColor: theme.colors.backgroundSec, padding: 13, borderRadius: 10}}
            >
              <ThemedText type='defaultSemiBold'>View details</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Payment Options</Text>
          
          <TouchableOpacity
            style={[styles.radioOption, { borderColor: theme.colors.border }]}
            onPress={() => setPaymentOption('full')}
          >
            <View style={[styles.radio, { borderColor: theme.colors.border }]}>
              {paymentOption === 'full' && <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />}
            </View>
            <View style={styles.radioContent}>
              <Text style={[styles.radioTitle, { color: theme.colors.text }]}>Pay in full</Text>
              <Text style={[styles.radioSubtitle, { color: theme.colors.textSecondary }]}>
                Pay ${pricing?.total.toFixed(2) || '0.00'} now
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.radioOption, { borderColor: theme.colors.border }]}
            onPress={() => setPaymentOption('partial')}
          >
            <View style={[styles.radio, { borderColor: theme.colors.border }]}>
              {paymentOption === 'partial' && <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />}
            </View>
            <View style={styles.radioContent}>
              <Text style={[styles.radioTitle, { color: theme.colors.text }]}>Pay part now, part later</Text>
              <Text style={[styles.radioSubtitle, { color: theme.colors.textSecondary }]}>
                Pay ${((pricing?.total || 0) * 0.5).toFixed(2)} now, ${((pricing?.total || 0) * 0.5).toFixed(2)} later
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Terms Checkbox */}
        <View style={[styles.section, styles.termsSection]}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <View style={[styles.checkbox, { borderColor: theme.colors.border }]}>
              {agreedToTerms && <View style={[styles.checkboxInner, { backgroundColor: theme.colors.primary }]} />}
            </View>
            <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
              I agree to the cancellation policy, house rules, and terms of service
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* CTA Button */}
      <View style={[styles.ctaContainer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[
            styles.ctaButton,
            { backgroundColor: theme.colors.primary },
            !isValidReservation && styles.ctaButtonDisabled,
          ]}
          disabled={!isValidReservation || false}
          onPress={handleCreateBooking}
        >
          {false ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={{color: '#FFF', fontSize: 16, fontWeight: '600'}}>
              Confirm and Pay ${pricing?.total.toFixed(2) || '0.00'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <DraggableModal
        isVisible={dateModalVisible}
        onClose={() => setDateModalVisible(false)}
        height={SCREEN_HEIGHT * 0.85}
      >
        <View style={styles.modalInner}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Select Dates
          </Text>

          {calendarLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
          <View style={{backgroundColor: theme.colors.background, flex:1}}>
            <CalendarList
              dayComponent={({date, state, marking}) =>(
                <CustomDay onPress={() => handleDayPress(date)} date={date} state={state} marking={marking} />
              )}
              current={dayjs().format('YYYY-MM-DD')}
              minDate={dayjs().format('YYYY-MM-DD')}
              maxDate={dayjs().add(6, 'month').format('YYYY-MM-DD')}
              onDayPress={handleDayPress}
              markedDates={{
                ...selectedDates,
                ...disabledDates
              }}
              markingType="custom"
              calendarStyle={{
                margin: 0,
                padding: 0,
                backgroundColor: theme.colors.background,
              }}
              contentContainerStyle={{backgroundColor: theme.colors.background}}
              style={{backgroundColor: theme.colors.background}}
              calendarWidth={ScreenWidth-30}

              theme={{
                backgroundColor: theme.colors.accent,
                calendarBackground: theme.colors.background,

              }}

              scrollEnabled
            />
            </View>
          )}

          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: theme.colors.primary, marginTop: 20 }]}
            onPress={() => setDateModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </DraggableModal>

      {/* Price Details Modal */}
      <DraggableModal
        isVisible={priceModalVisible}
        onClose={() => setPriceModalVisible(false)}
        height={SCREEN_HEIGHT * 0.6}
      >
        <View style={styles.modalInner}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Price Details</Text>
          {false ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : pricing ? (
            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: theme.colors.text }]}>
                  {pricing.useNightlyRates 
                    ? `Nightly rates × ${pricing.nights} nights`
                    : `${pricing.breakdown.periodType} rate × ${pricing.nights} nights`
                  }
                </Text>
                <Text style={[styles.priceValue, { color: theme.colors.text }]}>
                  ${pricing.breakdown.subtotal.toFixed(2)}
                </Text>
              </View>
              
              {pricing.breakdown.discount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: theme.colors.text }]}>
                    Duration discount ({pricing.breakdown.discountPercent}%)
                  </Text>
                  <Text style={[styles.priceValue, { color: 'green' }]}>
                    -${pricing.breakdown.discount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: theme.colors.text }]}>Cleaning fee</Text>
                <Text style={[styles.priceValue, { color: theme.colors.text }]}>
                  ${pricing.breakdown.cleaningFee.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: theme.colors.text }]}>
                  Service fee ({pricing.breakdown.serviceFeePercent}%)
                </Text>
                <Text style={[styles.priceValue, { color: theme.colors.text }]}>
                  ${pricing.breakdown.serviceFee.toFixed(2)}
                </Text>
              </View>
              
              <View style={[styles.priceRow, styles.totalRow, { borderTopColor: theme.colors.border }]}>
                <Text style={[styles.priceLabel, styles.totalLabel, { color: theme.colors.text }]}>Total</Text>
                <Text style={[styles.priceValue, styles.totalValue, { color: theme.colors.primary }]}>
                  ${pricing.total.toFixed(2)}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={[{ color: theme.colors.text, textAlign: 'center' }]}>
              Select dates to see pricing
            </Text>
          )}
        </View>
      </DraggableModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: '400',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  segment: {
    padding: 4,
    borderRadius: 12,
    flexDirection: 'row',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentBtnActive: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateButton: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  dateSeparator: {
    fontSize: 20,
    marginHorizontal: 8,
  },
  helperText: {
    fontSize: 13,
    marginTop: 8,
  },
  durationContainer: {
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  durationValue: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  guestContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioContent: {
    flex: 1,
  },
  radioTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  radioSubtitle: {
    fontSize: 13,
  },
  termsSection: {
    borderBottomWidth: 0,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  ctaContainer: {
    padding: 16,
    borderTopWidth: 1,
    paddingBottom: 30,
  },
  ctaButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  modalInner: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  priceBreakdown: {
    marginTop: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ReservationScreen;
