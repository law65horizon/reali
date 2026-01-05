// store/bookingsStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type BookingType = 'hotel' | 'rental' | 'purchase';
export type BookingStatus = 'upcoming' | 'active' | 'completed' | 'cancelled' | 'pending';

export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  country: string;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
}

export interface Host {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  responseTime?: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  date: string;
  status: 'paid' | 'pending' | 'refunded';
  method: string;
  type: 'deposit' | 'full' | 'installment' | 'refund';
}

export interface Booking {
  id: string;
  type: BookingType;
  status: BookingStatus;
  property: Property;
  host?: Host;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  currency: string;
  bookingReference: string;
  createdAt: string;
  payments: Payment[];
  specialRequests?: string;
  cancellationPolicy?: string;
  checkInInstructions?: string;
  accessCode?: string;
  canModify: boolean;
  canCancel: boolean;
  reviewSubmitted?: boolean;
  securityDeposit?: {
    amount: number;
    status: 'held' | 'returned' | 'pending';
    returnDate?: string;
  };
}

export interface PurchaseProgress {
  bookingId: string;
  stages: {
    name: string;
    status: 'completed' | 'current' | 'pending';
    date?: string;
  }[];
  documents: {
    name: string;
    uploaded: boolean;
    required: boolean;
  }[];
  nextMilestone?: string;
  closingDate?: string;
}

interface BookingsState {
  bookings: Booking[];
  savedProperties: Property[];
  filters: {
    type: BookingType | 'all';
    status: BookingStatus | 'all';
  };
  
  // Actions
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  cancelBooking: (id: string) => void;
  getBookingsByStatus: (status: BookingStatus) => Booking[];
  getBookingsByType: (type: BookingType) => Booking[];
  getUpcomingBookings: () => Booking[];
  getActiveBookings: () => Booking[];
  getPastBookings: () => Booking[];
  setFilters: (filters: Partial<BookingsState['filters']>) => void;
  saveProperty: (property: Property) => void;
  removeSavedProperty: (id: string) => void;
  submitReview: (bookingId: string) => void;
}

export const useBookingsStore = create<BookingsState>()(
  persist(
    (set, get) => ({
      bookings: [],
      savedProperties: [],
      filters: {
        type: 'all',
        status: 'all',
      },

      addBooking: (booking) =>
        set((state) => ({
          bookings: [booking, ...state.bookings],
        })),

      updateBooking: (id, updates) =>
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === id ? { ...booking, ...updates } : booking
          ),
        })),

      cancelBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === id
              ? { ...booking, status: 'cancelled' as BookingStatus }
              : booking
          ),
        })),

      getBookingsByStatus: (status) => {
        return get().bookings.filter((booking) => booking.status === status);
      },

      getBookingsByType: (type) => {
        return get().bookings.filter((booking) => booking.type === type);
      },

      getUpcomingBookings: () => {
        const now = new Date();
        return get().bookings.filter(
          (booking) =>
            booking.status === 'upcoming' && new Date(booking.checkIn) > now
        );
      },

      getActiveBookings: () => {
        const now = new Date();
        return get().bookings.filter(
          (booking) =>
            booking.status === 'active' &&
            new Date(booking.checkIn) <= now &&
            new Date(booking.checkOut) >= now
        );
      },

      getPastBookings: () => {
        return get().bookings.filter(
          (booking) =>
            booking.status === 'completed' || booking.status === 'cancelled'
        );
      },

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      saveProperty: (property) =>
        set((state) => ({
          savedProperties: [property, ...state.savedProperties],
        })),

      removeSavedProperty: (id) =>
        set((state) => ({
          savedProperties: state.savedProperties.filter((p) => p.id !== id),
        })),

      submitReview: (bookingId) =>
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, reviewSubmitted: true }
              : booking
          ),
        })),
    }),
    {
      name: 'bookings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);