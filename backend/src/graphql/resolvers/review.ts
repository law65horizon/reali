// src/graphql/resolvers/review.ts
import ReviewModel, { Review } from '../../models/Review.js';
import PropertyModel from '../../models/Property.js';
import UserModel, {User} from '../../models/User.js';
// import { Error } from '@apollo/server';

export default {
  Query: {
    getReview: async (_: any, { id }: { id: string }) => {
      return await ReviewModel.findById(parseInt(id));
    },
    getReviews: async (_: any, { propertyId }: { propertyId: string }) => {
      return await ReviewModel.findByPropertyId(parseInt(propertyId));
    },
  },
  Mutation: {
    createReview: async (_: any, { input }: { input: Review }, { user }: { user: User }) => {
      if (!user) throw new Error('Unauthorized');
      return await ReviewModel.create({ ...input, user_id: user.id });
    },
    updateReview: async (_: any, { id, input }: { id: string; input: Review }, { user }: { user: User }) => {
      if (!user) throw new Error('Unauthorized');
      const review = await ReviewModel.findById(parseInt(id));
      if (!review || review.user_id !== user.id) throw new Error('Unauthorized');
      return await ReviewModel.update(parseInt(id), input);
    },
    deleteReview: async (_: any, { id }: { id: string }, { user }: { user: User }) => {
      if (!user) throw new Error('Unauthorized');
      const review = await ReviewModel.findById(parseInt(id));
      if (!review || review.user_id !== user.id) throw new Error('Unauthorized');
      return await ReviewModel.delete(parseInt(id));
    },
  },
  Review: {
    property: async (parent: Review) => {
      return await PropertyModel.findByID(parent.property_id);
    },
    user: async (parent: Review) => {
      return await UserModel.findById(parent.user_id);
    },
  },
};