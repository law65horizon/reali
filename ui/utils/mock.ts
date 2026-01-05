import { useBookingsStore } from "@/stores/bookingStore";

// Helper function to generate random dates
const randomDate = (startDate: Date, endDate: Date) => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const date = new Date(start + Math.random() * (end - start));
  return date.toISOString();
};

// Generate a random booking
const generateMockBooking = (): any => {
  const id = `booking_${Math.random().toString(36).substring(2, 15)}`;
  const propertyId = `property_${Math.random().toString(36).substring(2, 15)}`;
  const status: any = ['upcoming', 'active', 'completed', 'cancelled', 'pending'][Math.floor(Math.random() * 5)];
  const checkIn = randomDate(new Date(), new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)); // within the next 30 days
  const checkOut = randomDate(new Date(new Date(checkIn).getTime() + 1000 * 60 * 60 * 24 * 2), new Date(new Date(checkIn).getTime() + 1000 * 60 * 60 * 24 * 15)); // 2 to 15 days after check-in
  const guests = Math.floor(Math.random() * 4) + 1; // between 1 and 4 guests
  const totalPrice = guests * 100 + Math.floor(Math.random() * 500); // random price between $100 to $600
  const bookingReference = `ref_${Math.random().toString(36).substring(2, 15)}`;
  const createdAt = new Date().toISOString();
  
  // Mock Property
  const property: any = {
    id: propertyId,
    title: `Property ${Math.random().toString(36).substring(2, 5)}`,
    address: `123 Main St, Somewhere`,
    city: 'New York',
    country: 'USA',
    imageUrl: `https://via.placeholder.com/300?text=Property+Image`,
    rating: Math.random() * 5, // Random rating between 0 and 5
    reviewCount: Math.floor(Math.random() * 500), // Random number of reviews
  };
  
  // Mock Host
  const host: any = {
    id: `host_${Math.random().toString(36).substring(2, 15)}`,
    name: `Host ${Math.random().toString(36).substring(2, 5)}`,
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    phone: `+1 555-1234-${Math.floor(Math.random() * 9000) + 1000}`,
    email: `host${Math.random().toString(36).substring(2, 5)}@example.com`,
    responseTime: `${Math.floor(Math.random() * 10)} hours`,
  };
  
  // Mock Payments
  const payments: any[] = [
    {
      id: `payment_${Math.random().toString(36).substring(2, 15)}`,
      amount: totalPrice,
      currency: 'USD',
      date: new Date().toISOString(),
      status: Math.random() > 0.5 ? 'paid' : 'pending',
      method: 'credit card',
      type: 'full',
    },
  ];

  // Mock booking
  return {
    id,
    type: 'hotel', // Mock type for this example
    status,
    property,
    host,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    currency: 'USD',
    bookingReference,
    createdAt,
    payments,
    canModify: status !== 'completed' && status !== 'cancelled',
    canCancel: status !== 'completed',
  };
};

// Create mock data and populate the store
export const populateStoreWithMockData = () => {
  const { addBooking, saveProperty } = useBookingsStore.getState();
console.log({wo: 'working'})
  // Generate 10 mock bookings
  for (let i = 0; i < 10; i++) {
    const mockBooking = generateMockBooking();
    addBooking(mockBooking);
    saveProperty(mockBooking.property);
  }
};

// Call this function to populate store with mock data
//  populateStoreWithMockData();
