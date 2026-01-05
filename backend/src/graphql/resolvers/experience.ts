// Updated experience resolver
import DataLoader from "dataloader";
import cloudinary from "../../config/cloudinary.js";
import ExperienceModel, { Experience } from "../../models/Experience.js";
import { User } from "../../models/User.js";
import { getRequestedFields } from "../../utils/getyRequestedFields.js";
import { addressLoader, userLoader } from "./user.js";
import pool from "../../config/database.js";

const experienceImageLoader = new DataLoader(async (experienceIds: readonly number[]) => {
  console.log('experienceImageLoader called with IDs:', experienceIds);
  const query = `
    SELECT 
      id, 
      experience_id, 
      url, 
      meta_data, 
      caption
    FROM experience_images
    WHERE experience_id = ANY($1)
  `;
  const result = await pool.query(query, [experienceIds]);
  console.log('experienceImageLoader query result:', result.rows, experienceIds, process.memoryUsage());
  const mapped = experienceIds.map(id => result.rows.filter(row => parseInt(row.experience_id) == id));
  console.log('experienceImageLoader mapped results:', mapped);
  return mapped;
});

const experienceBookingLoader = new DataLoader(async (experienceIds: readonly number[]) => {
  console.log('experienceBookingLoader called with IDs:', experienceIds);
  const query = `
    SELECT 
      id, 
      experience_id, 
      user_id, 
      start_date, 
      end_date, 
      status, 
      created_at
    FROM experience_bookings
    WHERE experience_id = ANY($1)
  `;
  const result = await pool.query(query, [experienceIds]);
  console.log('experienceBookingLoader query result:', result.rows);
  const mapped = experienceIds.map(id => result.rows.filter(row => parseInt(row.experience_id) == id));
  console.log('experienceBookingLoader mapped results:', mapped);
  return mapped;
});

const experienceReviewLoader = new DataLoader(async (experienceIds: readonly number[]) => {
  console.log('experienceReviewLoader called with IDs:', experienceIds);
  const query = `
    SELECT 
      id, 
      experience_id, 
      user_id, 
      rating, 
      comment, 
      created_at
    FROM experience_reviews
    WHERE experience_id = ANY($1)
  `;
  const result = await pool.query(query, [experienceIds]);
  console.log('experienceReviewLoader query result:', result.rows);
  const mapped = experienceIds.map(id => result.rows.filter(row => parseInt(row.experience_id) == id));
  console.log('experienceReviewLoader mapped results:', mapped);
  return mapped;
});

const itineraryLoader = new DataLoader(async (experienceIds: readonly number[]) => {
  console.log('itineraryLoader called with IDs:', experienceIds);
  const query = `
    SELECT 
      id, 
      experience_id, 
      day, 
      description, 
      start_time, 
      end_time
    FROM experience_itineraries
    WHERE experience_id = ANY($1)
  `;
  const result = await pool.query(query, [experienceIds]);
  console.log('itineraryLoader query result:', result.rows);
  const mapped = experienceIds.map(id => result.rows.filter(row => parseInt(row.experience_id) == id));
  console.log('itineraryLoader mapped results:', mapped);
  return mapped;
});

const itineraryDayLoader = new DataLoader(async (experienceIds: readonly number[]) => {
  console.log('itineraryDayLoader called with IDs:', experienceIds);
  const query = `
    SELECT 
      iday.id, 
      iday.experience_id, 
      iday.date, 
      iday.start_time,
      iday.end_time,
      COALESCE(
        (SELECT json_agg(json_build_object(
          'id', act.id,
          'itinerary_day_id', act.itinerary_day_id,
          'title', act.title,
          'description', act.description,
          'thumbnail_url', act.thumbnail_url,
          'duration_minutes', act.duration_minutes,
          'location', act.location
        )) FROM activities act WHERE act.itinerary_day_id = iday.id),
        '[]'::json
      ) AS activities
    FROM itinerary_days iday
    WHERE iday.experience_id = ANY($1)
  `;
  const result = await pool.query(query, [experienceIds]);
  console.log('itineraryDayLoader query result:', result.rows);
  const mapped = experienceIds.map(id => result.rows.filter(row => parseInt(row.experience_id) == id));
  console.log('itineraryDayLoader mapped results:', mapped);
  return mapped;
});

const faqLoader = new DataLoader(async (experienceIds: readonly number[]) => {
  console.log('faqLoader called with IDs:', experienceIds);
  const query = `
    SELECT 
      id, 
      experience_id, 
      question, 
      answer, 
      created_at
    FROM experience_faqs
    WHERE experience_id = ANY($1)
  `;
  const result = await pool.query(query, [experienceIds]);
  console.log('faqLoader query result:', result.rows);
  const mapped = experienceIds.map(id => result.rows.filter(row => parseInt(row.experience_id) == id));
  console.log('faqLoader mapped results:', mapped);
  return mapped;
});

const getNodeFields = (info: any): string[] => {
  const fieldNodes = info.fieldNodes || info.fieldASTs;
  const connectionField = fieldNodes
    ?.find(node => node.name?.value?.includes('Experiences'))
    ?.selectionSet?.selections
    ?.find((sel: any) => sel.name?.value === 'edges');

  const nodeFields = connectionField?.selectionSet?.selections
    ?.find((sel: any) => sel.name?.value === 'node')
    ?.selectionSet?.selections;

  if (!nodeFields) {
    console.warn('No node fields found in query, defaulting to basic fields');
    return ['id', 'title', 'price', 'category', 'address', 'images', 'reviews'];
  }

  return nodeFields
    .filter((sel: any) => sel.kind === 'Field')
    .map((sel: any) => sel.name.value);
};

export default {
  Query: {
    getExperience: async (_: any, { id }: { id: string }, { user }: { user: User }, info: any) => {
      const requestedFields = getRequestedFields(info);
      const experience = await ExperienceModel.findById(parseInt(id), requestedFields);
      if (!experience) return null;
      // console.log('user', user);
      return experience;
    },
    getExperiences: async (_: any, __: any, ___: any, info: any) => {
      const requestedFields = getRequestedFields(info);
      console.log('getExperiences requestedFields:', requestedFields);
      return await ExperienceModel.findAll(requestedFields);
    },
    getHostExperiences: async (_: any, { host_id }: { host_id: string }, { user }: { user: User }, info: any) => {
      if (!user || user.id !== parseInt(host_id)) throw new Error("Unauthorized");
      const requestedFields = getRequestedFields(info);
      // console.log('getHostExperiences requestedFields:', requestedFields);
      return await ExperienceModel.findByHost(parseInt(host_id), requestedFields);
    },
    getExperiencesPaginated: async (_: any, { first, after }: { first: number; after?: string }, __: any, info: any) => {
      const requestedFields = getNodeFields(info);
      console.log('getExperiencesPaginated requestedFields:', requestedFields);
      return await ExperienceModel.findAllPaginated(first, after, requestedFields);
    },
    searchExperiences: async (_: any, { input, first, after }: { input: any; first: number; after?: string }, __: any, info: any) => {
      const requestedFields = getNodeFields(info);
      // console.log('searchExperiences requestedFields:', requestedFields);
      return await ExperienceModel.searchPaginated(input, first, after, requestedFields);
    },
  },
  Mutation: {
    createExperience: async (_: any, { input }: { input: any }, { user }: { user: User }) => {
      const experience = await ExperienceModel.create(input);
      console.log('createExperience result:', experience);
      experienceImageLoader.clear(experience.id);
      itineraryLoader.clear(experience.id);
      itineraryDayLoader.clear(experience.id);
      faqLoader.clear(experience.id);
      experienceBookingLoader.clear(experience.id);
      experienceReviewLoader.clear(experience.id);
      return experience;
    },
    updateExperience: async (_: any, { id, input }: { id: string; input: any }, { user }: { user: User }) => {
      if (!user) throw new Error('Unauthorized');
      const experience = await ExperienceModel.findById(parseInt(id));
      if (!experience || experience.host_id !== user.id) throw new Error('Unauthorized');
      const updatedExperience = await ExperienceModel.update(parseInt(id), input);
      console.log('updateExperience result:', updatedExperience);
      experienceImageLoader.clear(parseInt(id));
      itineraryLoader.clear(parseInt(id));
      itineraryDayLoader.clear(parseInt(id));
      faqLoader.clear(parseInt(id));
      experienceBookingLoader.clear(parseInt(id));
      experienceReviewLoader.clear(parseInt(id));
      return updatedExperience;
    },
    deleteExperience: async (_: any, { id }: { id: string }, { user }: { user: User }) => {
      // if (!user) throw new Error('Unauthorized');
      const experience = await ExperienceModel.findById(parseInt(id));
      // if (!experience || experience.host_id !== user.id) throw new Error('Unauthorized');
      const result = await ExperienceModel.delete(parseInt(id));
      console.log('deleteExperience result:', result);
      experienceImageLoader.clear(parseInt(id));
      itineraryLoader.clear(parseInt(id));
      itineraryDayLoader.clear(parseInt(id));
      faqLoader.clear(parseInt(id));
      experienceBookingLoader.clear(parseInt(id));
      experienceReviewLoader.clear(parseInt(id));
      return result;
    },
    generateCloudinarySignature: async (_: any, __: any, { user }: { user: User }) => {
      const timestamp = Math.round(new Date().getTime() / 1000).toString();
      const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder: "properties" },
        process.env.CLOUDINARY_API_SECRET
      );
      return {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
      };
    },
  },
  Experience: {
    host: async (parent: Experience) => {
      console.log('Resolving host for experience:', parent.id);
      return await userLoader.load(parent.host_id);
    },
    address: async (parent: Experience) => {
      console.log('Resolving address for experience:', parent.id);
      return await addressLoader.load(parent.address_id);
    },
    images: async (parent: Experience) => {
      console.log('Resolving images for experience:', parent.id);
      const images = await experienceImageLoader.load(parent.id);
      console.log('Resolved images:', images);
      return images;
    },
    itineraries: async (parent: Experience) => {
      console.log('Resolving itineraries for experience:', parent.id);
      const itineraries = await itineraryLoader.load(parent.id);
      console.log('Resolved itineraries:', itineraries);
      return itineraries;
    },
    itinerary_days: async (parent: Experience) => {
      console.log('Resolving itinerary_days for experience:', parent.id);
      const itineraryDays = await itineraryDayLoader.load(parent.id);
      console.log('Resolved itinerary_days:', itineraryDays);
      return itineraryDays;
    },
    faqs: async (parent: Experience) => {
      console.log('Resolving faqs for experience:', parent.id);
      const faqs = await faqLoader.load(parent.id);
      console.log('Resolved faqs:', faqs);
      return faqs;
    },
    bookings: async (parent: Experience) => {
      console.log('Resolving bookings for experience:', parent.id);
      const bookings = await experienceBookingLoader.load(parent.id);
      console.log('Resolved bookings:', bookings);
      return bookings;
    },
    reviews: async (parent: Experience) => {
      console.log('Resolving reviews for experience:', parent.id);
      const reviews = await experienceReviewLoader.load(parent.id);
      console.log('Resolved reviews:', reviews);
      return reviews;
    },
  },
  ExperienceBooking: {
    user: async (parent: { user_id: number }) => {
      console.log('Resolving user for experience booking:', parent.user_id);
      return await userLoader.load(parent.user_id);
    },
  },
  ExperienceReview: {
    user: async (parent: { user_id: number }) => {
      console.log('Resolving user for experience review:', parent.user_id);
      return await userLoader.load(parent.user_id);
    },
  },
};

// import DataLoader from "dataloader";
// import cloudinary from "../../config/cloudinary.js";
// import PropertyModel, { Property } from "../../models/Property.js";
// import ExperienceModel, { Experience } from "../../models/Experience.js";
// import { User } from "../../models/User.js";
// import { getRequestedFields } from "../../utils/getyRequestedFields.js";
// import { addressLoader, userLoader } from "./user.js";
// import pool from "../../config/database.js";
// import { Address } from "../../models/Address.js";

// const experienceImageLoader = new DataLoader(async (experienceIds: readonly number[]) => {
//   console.log('experienceImageLoader called with IDs:', experienceIds);
//   const query = `
//     SELECT 
//       id, 
//       experience_id, 
//       url, 
//       meta_data, 
//       caption
//     FROM experience_images
//     WHERE experience_id = ANY($1)
//   `;
//   const result = await pool.query(query, [experienceIds]);
//   console.log('experienceImageLoader query result:', result.rows, experienceIds, process.memoryUsage());
//   const mapped = experienceIds.map(id => result.rows.filter(row => parseInt(row.experience_id) == id));
//   console.log('experienceImageLoader mapped results:', mapped);
//   return mapped;
// });

// const experienceBookingLoader = new DataLoader(async (experienceIds: readonly number[]) => {
//   console.log('experienceBookingLoader called with IDs:', experienceIds);
//   const query = `
//     SELECT 
//       id, 
//       experience_id, 
//       user_id, 
//       start_date, 
//       end_date, 
//       status, 
//       created_at
//     FROM experience_bookings
//     WHERE experience_id = ANY($1)
//   `;
//   const result = await pool.query(query, [experienceIds]);
//   console.log('experienceBookingLoader query result:', result.rows);
//   const mapped = experienceIds.map(id => result.rows.filter(row => parseInt(row.experience_id) == id));
//   console.log('experienceBookingLoader mapped results:', mapped);
//   return mapped;
// });

// const experienceReviewLoader = new DataLoader(async (experienceIds: readonly number[]) => {
//   console.log('experienceReviewLoader called with IDs:', experienceIds);
//   const query = `
//     SELECT 
//       id, 
//       experience_id, 
//       user_id, 
//       rating, 
//       comment, 
//       created_at
//     FROM experience_reviews
//     WHERE experience_id = ANY($1)
//   `;
//   const result = await pool.query(query, [experienceIds]);
//   console.log('experienceReviewLoader query result:', result.rows);
//   const mapped = experienceIds.map(id => result.rows.filter(row => parseInt(row.experience_id) == id));
//   console.log('experienceReviewLoader mapped results:', mapped);
//   return mapped;
// });

// const itineraryLoader = new DataLoader(async (experienceIds: readonly number[]) => {
//   console.log('itineraryLoader called with IDs:', experienceIds);
//   const query = `
//     SELECT 
//       id, 
//       experience_id, 
//       day, 
//       description, 
//       start_time, 
//       end_time
//     FROM experience_itineraries
//     WHERE experience_id = ANY($1)
//   `;
//   const result = await pool.query(query, [experienceIds]);
//   console.log('itineraryLoader query result:', result.rows);
//   const mapped = experienceIds.map(id => result.rows.filter(row => parseInt(row.experience_id) == id));
//   console.log('itineraryLoader mapped results:', mapped);
//   return mapped;
// });

// const itineraryDayLoader = new DataLoader(async (experienceIds: readonly number[]) => {
//   console.log('itineraryDayLoader called with IDs:', experienceIds);
//   const query = `
//     SELECT 
//       iday.id, 
//       iday.experience_id, 
//       iday.date, 
//       iday.start_time,
//       iday.end_time,
//       COALESCE(
//         (SELECT json_agg(json_build_object(
//           'id', act.id,
//           'itinerary_day_id', act.itinerary_day_id,
//           'title', act.title,
//           'description', act.description,
//           'thumbnail_url', act.thumbnail_url,
//           'duration_minutes', act.duration_minutes,
//           'location', act.location
//         )) FROM activities act WHERE act.itinerary_day_id = iday.id),
//         '[]'::json
//       ) AS activities
//     FROM itinerary_days iday
//     WHERE iday.experience_id = ANY($1)
//   `;
//   const result = await pool.query(query, [experienceIds]);
//   console.log('itineraryDayLoader query result:', result.rows);
//   const mapped = experienceIds.map(id => result.rows.filter(row => parseInt(row.experience_id) == id));
//   console.log('itineraryDayLoader mapped results:', mapped);
//   return mapped;
// });

// const faqLoader = new DataLoader(async (experienceIds: readonly number[]) => {
//   console.log('faqLoader called with IDs:', experienceIds);
//   const query = `
//     SELECT 
//       id, 
//       experience_id, 
//       question, 
//       answer, 
//       created_at
//     FROM experience_faqs
//     WHERE experience_id = ANY($1)
//   `;
//   const result = await pool.query(query, [experienceIds]);
//   console.log('faqLoader query result:', result.rows);
//   const mapped = experienceIds.map(id => result.rows.filter(row => parseInt(row.experience_id) == id));
//   console.log('faqLoader mapped results:', mapped);
//   return mapped;
// });

// export default {
//   Query: {
//     getExperience: async (_: any, { id }: { id: string }, { user }: { user: User }, info: any) => {
//       const requestedFields = getRequestedFields(info);
//       const experience = await ExperienceModel.findById(parseInt(id), requestedFields);
//       if (!experience) return null;
//       console.log('user', user);
//       return experience;
//     },
//     getExperiences: async (_: any, __: any, ___: any, info: any) => {
//       const requestedFields = getRequestedFields(info);
//       console.log('getExperiences requestedFields:', requestedFields);
//       return await ExperienceModel.findAll(requestedFields);
//     },
//     getHostExperiences: async (_: any, { host_id }: { host_id: string }, { user }: { user: User }, info: any) => {
//       if (!user || user.id !== parseInt(host_id)) throw new Error("Unauthorized");
//       const requestedFields = getRequestedFields(info);
//       console.log('getHostExperiences requestedFields:', requestedFields);
//       return await ExperienceModel.findByHost(parseInt(host_id), requestedFields);
//     },
//     getExperiencesPaginated: async (_: any, { first, after }: { first: number; after?: string }, __: any, info: any) => {
//       const getNodeFields = (fieldNodes: any[]): string[] => {
//         const edgesField = fieldNodes
//           ?.find(node => node.name?.value === 'getExperiencesPaginated')
//           ?.selectionSet?.selections
//           ?.find((sel: any) => sel.name?.value === 'edges');
        
//         const nodeFields = edgesField?.selectionSet?.selections
//           ?.find((sel: any) => sel.name?.value === 'node')
//           ?.selectionSet?.selections;

//         if (!nodeFields) {
//           console.warn('No node fields found in query, defaulting to basic fields');
//           return ['id', 'title', 'price', 'category', 'address', 'images', 'reviews'];
//         }

//         return nodeFields
//           .filter((sel: any) => sel.kind === 'Field')
//           .map((sel: any) => sel.name.value);
//       };

//       const requestedFields = getNodeFields(info.fieldNodes);
//       console.log('getExperiencesPaginated requestedFields:', requestedFields);
//       return await ExperienceModel.findAllPaginated(first, after, requestedFields);
//     },
//   },
//   Mutation: {
//     createExperience: async (_: any, { input }: { input: any }, { user }: { user: User }) => {
//       const experience = await ExperienceModel.create(input);
//       console.log('createExperience result:', experience);
//       experienceImageLoader.clear(experience.id);
//       itineraryLoader.clear(experience.id);
//       itineraryDayLoader.clear(experience.id);
//       faqLoader.clear(experience.id);
//       experienceBookingLoader.clear(experience.id);
//       experienceReviewLoader.clear(experience.id);
//       return experience;
//     },
//     updateExperience: async (_: any, { id, input }: { id: string; input: any }, { user }: { user: User }) => {
//       if (!user) throw new Error('Unauthorized');
//       const experience = await ExperienceModel.findById(parseInt(id));
//       if (!experience || experience.host_id !== user.id) throw new Error('Unauthorized');
//       const updatedExperience = await ExperienceModel.update(parseInt(id), input);
//       console.log('updateExperience result:', updatedExperience);
//       experienceImageLoader.clear(parseInt(id));
//       itineraryLoader.clear(parseInt(id));
//       itineraryDayLoader.clear(parseInt(id));
//       faqLoader.clear(parseInt(id));
//       experienceBookingLoader.clear(parseInt(id));
//       experienceReviewLoader.clear(parseInt(id));
//       return updatedExperience;
//     },
//     deleteExperience: async (_: any, { id }: { id: string }, { user }: { user: User }) => {
//       // if (!user) throw new Error('Unauthorized');
//       const experience = await ExperienceModel.findById(parseInt(id));
//       // if (!experience || experience.host_id !== user.id) throw new Error('Unauthorized');
//       const result = await ExperienceModel.delete(parseInt(id));
//       console.log('deleteExperience result:', result);
//       experienceImageLoader.clear(parseInt(id));
//       itineraryLoader.clear(parseInt(id));
//       itineraryDayLoader.clear(parseInt(id));
//       faqLoader.clear(parseInt(id));
//       experienceBookingLoader.clear(parseInt(id));
//       experienceReviewLoader.clear(parseInt(id));
//       return result;
//     },
//     generateCloudinarySignature: async (_: any, __: any, { user }: { user: User }) => {
//       const timestamp = Math.round(new Date().getTime() / 1000).toString();
//       const signature = cloudinary.utils.api_sign_request(
//         { timestamp, folder: "properties" },
//         process.env.CLOUDINARY_API_SECRET
//       );
//       return {
//         signature,
//         timestamp,
//         cloudName: process.env.CLOUDINARY_CLOUD_NAME,
//         apiKey: process.env.CLOUDINARY_API_KEY,
//       };
//     },
//   },
//   Experience: {
//     host: async (parent: Experience) => {
//       console.log('Resolving host for experience:', parent.id);
//       return await userLoader.load(parent.host_id);
//     },
//     address: async (parent: Experience) => {
//       console.log('Resolving address for experience:', parent.id);
//       return await addressLoader.load(parent.address_id);
//     },
//     images: async (parent: Experience) => {
//       console.log('Resolving images for experience:', parent.id);
//       const images = await experienceImageLoader.load(parent.id);
//       console.log('Resolved images:', images);
//       return images;
//     },
//     itineraries: async (parent: Experience) => {
//       console.log('Resolving itineraries for experience:', parent.id);
//       const itineraries = await itineraryLoader.load(parent.id);
//       console.log('Resolved itineraries:', itineraries);
//       return itineraries;
//     },
//     itinerary_days: async (parent: Experience) => {
//       console.log('Resolving itinerary_days for experience:', parent.id);
//       const itineraryDays = await itineraryDayLoader.load(parent.id);
//       console.log('Resolved itinerary_days:', itineraryDays);
//       return itineraryDays;
//     },
//     faqs: async (parent: Experience) => {
//       console.log('Resolving faqs for experience:', parent.id);
//       const faqs = await faqLoader.load(parent.id);
//       console.log('Resolved faqs:', faqs);
//       return faqs;
//     },
//     bookings: async (parent: Experience) => {
//       console.log('Resolving bookings for experience:', parent.id);
//       const bookings = await experienceBookingLoader.load(parent.id);
//       console.log('Resolved bookings:', bookings);
//       return bookings;
//     },
//     reviews: async (parent: Experience) => {
//       console.log('Resolving reviews for experience:', parent.id);
//       const reviews = await experienceReviewLoader.load(parent.id);
//       console.log('Resolved reviews:', reviews);
//       return reviews;
//     },
//   },
//   ExperienceBooking: {
//     user: async (parent: { user_id: number }) => {
//       console.log('Resolving user for experience booking:', parent.user_id);
//       return await userLoader.load(parent.user_id);
//     },
//   },
//   ExperienceReview: {
//     user: async (parent: { user_id: number }) => {
//       console.log('Resolving user for experience review:', parent.user_id);
//       return await userLoader.load(parent.user_id);
//     },
//   },
// };

