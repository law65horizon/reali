// src/graphql/resolvers/booking.ts
import DataLoader from 'dataloader';
import BookingModel, { Booking } from '../../models/Booking.js';
import PropertyModel from '../../models/Property.js';
import UserModel, {User} from '../../models/User.js';
// import { Error } from '@apollo/server';

export const propertyBookingLoader = new DataLoader(async (propertyIds) => {
  const query = `
    SELECT 
      id, 
      property_id, 
      user_id, 
      start_date, 
      end_date, 
      status, 
      created_at
    FROM property_bookings
    WHERE property_id = ANY($1)
  `;
  const result = await UserModel.pool.query(query, [propertyIds]);
  return propertyIds.map(id => result.rows.filter(row => row.property_id === id));
});

export default {
  Query: {
    getBooking: async (_: any, { id }: { id: string }) => {
      return await BookingModel.findById(parseInt(id));
    },
    getBookings: async () => {
      return await BookingModel.findAll();
    },
  },
  Mutation: {
    createBooking: async (_: any, { input }: { input: Booking }, { user }: { user: User }) => {
      if (!user) throw new Error('Unauthorized');
      return await BookingModel.create({ ...input, user_id: user.id });
    },
    updateBooking: async (_: any, { id, status }: { id: string; status: string }, { user }: { user: User }) => {
      if (!user) throw new Error('Unauthorized');
      const booking = await BookingModel.findById(parseInt(id));
      if (!booking || booking.user_id !== user.id) throw new Error('Unauthorized');
      return await BookingModel.update(parseInt(id), { status });
    },
    deleteBooking: async (_: any, { id }: { id: string }, { user }: { user: User }) => {
      if (!user) throw new Error('Unauthorized');
      const booking = await BookingModel.findById(parseInt(id));
      if (!booking || booking.user_id !== user.id) throw new Error('Unauthorized');
      return await BookingModel.delete(parseInt(id));
    },
  },
  Booking: {
    property: async (parent: Booking) => {
      return await PropertyModel.findById(parent.property_id);
    },
    user: async (parent: Booking) => {
      return await UserModel.findById(parent.user_id);
    },
  },
};