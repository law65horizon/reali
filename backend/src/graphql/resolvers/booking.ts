// src/graphql/resolvers/booking.ts
import DataLoader from 'dataloader';
import BookingModel, { Booking, BookingInput } from '../../models/Booking.js';
import PropertyModel from '../../models/Property.js';
import UserModel, {User} from '../../models/User.js';
import { roomUnitLoader, roomUnitLoader0 } from './property.js';
import { userLoader } from './user.js';
import {GraphQLError} from 'graphql'
// import { A } from '@apollo/server';

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

    calculateBookingPrice: async (_: any, {roomTypeId, checkIn, checkOut}) => {
      return await BookingModel.calculateBookingPrice({roomTypeId, checkIn, checkOut});
    }
  },
  Mutation: {
    createBooking: async (_: any, { input }: { input: BookingInput }, { user }: { user: User }) => {
      if (!user) throw new Error('Unauthorized');
      return await BookingModel.create(input);
    },
    updateBooking: async (_: any, { id, status }: { id: string; status: string }, { user }: { user: User }) => {
      // if (!user) throw new Error('Unauthorized');
      // const booking = await BookingModel.findById(parseInt(id));
      // if (!booking || booking.user_id !== user.id) throw new Error('Unauthorized');
      // return await BookingModel.update(parseInt(id), { status });
    },
    cancelBooking: async (_: any, { id }: { id: string }, { user }: { user: User }) => {
      // if (!user) throw new Error('Unauthorizedd');
      console.log({user, id})
      const booking = await BookingModel.findById(parseInt(id));
      if (!booking || booking.guest_id !== user.id) throw new Error('Unauthorized');
      return await BookingModel.cancelBooking({bookingId: parseInt(id), userId: user.id});
    },
    refreshRateCalendar: async (_:any, {id}) => {}
  },
  Booking: {
    unit: async (parent: any) => {
      console.log({ow: parent})
      return await roomUnitLoader0.load(parent.unit_id)
    },
    guest: async (parent: any) => {
      return await userLoader.load(parent.guest_id);
    },
  },
};