// src/graphql/resolvers/review.ts
import ReviewModel, { Review, ReviewInput } from '../../models/Review.js';
import PropertyModel from '../../models/Property.js';
import UserModel, {User} from '../../models/User.js';
import DataLoader from 'dataloader';
import pool from '../../config/database.js';
// import { Error } from '@apollo/server';

export const reveiwLoader = new DataLoader(async (ids: number[]) => {
  const query = `
    SELECT * FROM reviews
    WHERE room_type_id = ANY($1)
  `;
  const result = await pool.query(query, [ids]);
  return ids.map(id => result.rows.filter(row => row.room_type_id === id));
});

export default {
  Query: {
    getReview: async (_: any, { id }: { id: string }) => {
      return await ReviewModel.findById(id);
    },
    getReviews: async (_: any, { propertyId }: { propertyId: string }) => {
      return await ReviewModel.findByPropertyId(parseInt(propertyId));
    },
  },
  Mutation: {
    createReview: async (_: any, { input }: { input: ReviewInput }, { user }: { user: User }) => {
      if (!user) throw new Error('Unauthorized');
      reveiwLoader.clear(user.id)
      return await ReviewModel.create({ ...input, user_id: user.id });
    },
    updateReview: async (_: any, { id, input }: { id: string; input: Review }, { user }: { user: User }) => {
      if (!user) throw new Error('Unauthorized');
      const review = await ReviewModel.findById(id);
      if (!review || review.guest_id !== user.id) throw new Error('Unauthorized');
      return await ReviewModel.update(id, input);
    },
    deleteReview: async (_: any, { id }: { id: string }, { user }: { user: User }) => {
      if (!user) throw new Error('Unauthorized');
      const review = await ReviewModel.findById(id);
      if (!review || review.guest_id !== user.id) throw new Error('Unauthorized');
      return await ReviewModel.delete(id);
    },
  },
  Review: {
    property: async (parent: Review) => {
      return await PropertyModel.findById(parent.property_id);
    },
    user: async (parent: Review) => {
      return await UserModel.findById(parent.guest_id);
    },
  },
};