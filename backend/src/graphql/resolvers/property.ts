// Updated property resolver
import DataLoader from "dataloader";
import cloudinary from "../../config/cloudinary.js";
import PropertyModel, { Property } from "../../models/Property.js";
import { User } from "../../models/User.js";
import { getNestedRequestedFields, getRequestedFields } from "../../utils/getyRequestedFields.js";
import { addressLoader, userLoader } from "./user.js";
import pool from "../../config/database.js";

const propertyImageLoader = new DataLoader(async (propertyIds: readonly number[]) => {
  const query = `
    SELECT 
      id, 
      property_id, 
      url, 
      meta_data, 
      caption
    FROM property_images
    WHERE property_id = ANY($1)
  `;
  const result = await pool.query(query, [propertyIds]);
  return propertyIds.map(id => result.rows.filter(row => row.property_id == id));
});

const propertyBookingLoader = new DataLoader(async (propertyIds: readonly number[]) => {
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
  const result = await pool.query(query, [propertyIds]);
  return propertyIds.map(id => result.rows.filter(row => row.property_id == id));
}); 

const propertyReviewLoader = new DataLoader(async (propertyIds: readonly number[]) => {
  const query = `
    SELECT 
      id, 
      property_id, 
      user_id, 
      rating, 
      comment, 
      created_at
    FROM property_reviews
    WHERE property_id = ANY($1)
  `;
  const result = await pool.query(query, [propertyIds]);
  return propertyIds.map(id => result.rows.filter(row => row.property_id == id));
});

const getNodeFields = (info: any): string[] => {
  const fieldNodes = info.fieldNodes || info.fieldASTs;
  const connectionField = fieldNodes
    ?.find(node => node.name?.value?.includes('Properties'))
    ?.selectionSet?.selections
    ?.find((sel: any) => sel.name?.value === 'edges');

  const nodeFields = connectionField?.selectionSet?.selections
    ?.find((sel: any) => sel.name?.value === 'node')
    ?.selectionSet?.selections;

  if (!nodeFields) {
    console.warn('No node fields found in query, defaulting to basic fields');
    return ['id', 'title', 'price'];
  }

  return nodeFields
    .filter((sel: any) => sel.kind === 'Field')
    .map((sel: any) => sel.name.value);
};

export default {
  Query: {
    getProperty: async (_: any, { id }: { id: string }, { user }: { user: User }, info: any) => {
      const requestedFields = getRequestedFields(info);
      const property = await PropertyModel.findById(parseInt(id), requestedFields);
      if (!property) return null;
      return property;
    },
    getListings: async (_: any, { realtor_id }: { realtor_id: string }, { user }: { user: User }, info: any) => {
      if (!user || user.id !== parseInt(realtor_id)) throw new Error("Unauthorized");
      const requestedFields = getRequestedFields(info);
      return await PropertyModel.findByRealtor(parseInt(realtor_id), requestedFields);
    },
    getProperties: async (_: any, { first, after }: { first: number; after?: string }, __: any, info: any) => {
      const requestedFields = getNodeFields(info);
      console.log('getProperties requestedFields:', requestedFields);
      return await PropertyModel.findAllPaginated(first, after, requestedFields);
    },
    searchProperties: async (_: any, { input, first, after }: { input: any; first: number; after?: string }, __: any, info: any) => {
      const requestedFields = getNodeFields(info);
      console.log('searchProperties requestedFields:', requestedFields);
      return await PropertyModel.searchPaginated(input, first, after, requestedFields);
    },
  },
  Mutation: {
    createProperty: async (_: any, { input }: { input: any }, { user }: { user: User }) => {
      const property = await PropertyModel.create(input);
      propertyImageLoader.clear(property.id);
      return property;
    },
    updateProperty: async (_: any, { id, input }: { id: string; input: Property }, { user }: { user: User }) => {
      if (!user) throw new Error("Unauthorized");
      const property = await PropertyModel.findById(parseInt(id));
      if (!property || property.realtor_id !== user.id) throw new Error("Unauthorized");
      const updatedProperty = await PropertyModel.update(parseInt(id), input);
      propertyImageLoader.clear(parseInt(id));
      return updatedProperty;
    },
    deleteProperty: async (_: any, { id }: { id: string }, { user }: { user: User }) => {
      // if (!user) throw new Error("Unauthorized");
      const property = await PropertyModel.findById(parseInt(id));
      // if (!property || property.realtor_id !== user.id) throw new Error("Unauthorized");
      const result = await PropertyModel.delete(parseInt(id));
      propertyImageLoader.clear(parseInt(id));
      return result;
    },
    generateCloudinarySignature: async (_: any, __: any, { user }: { user: User }) => {
      if (!user) throw new Error("Unauthorized");
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
  Property: {
    realtor: async (parent: Property) => {
      return await userLoader.load(parent.realtor_id);
    },
    address: async (parent: Property) => {
      return await addressLoader.load(parent.address_id);
    },
    images: async (parent: Property) => {
      return await propertyImageLoader.load(parent.id);
    },
    bookings: async (parent: Property) => {
      return await propertyBookingLoader.load(parent.id);
    },
    reviews: async (parent: Property) => {
      return await propertyReviewLoader.load(parent.id);
    },
  },
};

// import DataLoader from "dataloader";
// import cloudinary from "../../config/cloudinary.js";
// import PropertyModel, { Property } from "../../models/Property.js";
// import { User } from "../../models/User.js";
// import { getNestedRequestedFields, getRequestedFields } from "../../utils/getyRequestedFields.js";
// import { addressLoader, userLoader } from "./user.js";
// import pool from "../../config/database.js";

// const propertyImageLoader = new DataLoader(async (propertyIds: readonly number[]) => {
//   const query = `
//     SELECT 
//       id, 
//       property_id, 
//       url, 
//       meta_data, 
//       caption
//     FROM property_images
//     WHERE property_id = ANY($1)
//   `;
//   const result = await pool.query(query, [propertyIds]);
//   return propertyIds.map(id => result.rows.filter(row => row.property_id == id));
// });

// const propertyBookingLoader = new DataLoader(async (propertyIds: readonly number[]) => {
//   const query = `
//     SELECT 
//       id, 
//       property_id, 
//       user_id, 
//       start_date, 
//       end_date, 
//       status, 
//       created_at
//     FROM property_bookings
//     WHERE property_id = ANY($1)
//   `;
//   const result = await pool.query(query, [propertyIds]);
//   return propertyIds.map(id => result.rows.filter(row => row.property_id == id));
// }); 

// const propertyReviewLoader = new DataLoader(async (propertyIds: readonly number[]) => {
//   const query = `
//     SELECT 
//       id, 
//       property_id, 
//       user_id, 
//       rating, 
//       comment, 
//       created_at
//     FROM property_reviews
//     WHERE property_id = ANY($1)
//   `;
//   const result = await pool.query(query, [propertyIds]);
//   return propertyIds.map(id => result.rows.filter(row => row.property_id == id));
// });

// export default {
//   Query: {
//     getProperty: async (_: any, { id }: { id: string }, { user }: { user: User }, info: any) => {
//       const requestedFields = getRequestedFields(info);
//       const property = await PropertyModel.findById(parseInt(id), requestedFields);
//       if (!property) return null;
//       return property;
//     },
//     getListings: async (_: any, { realtor_id }: { realtor_id: string }, { user }: { user: User }, info: any) => {
//       if (!user || user.id !== parseInt(realtor_id)) throw new Error("Unauthorized");
//       const requestedFields = getRequestedFields(info);
//       return await PropertyModel.findByRealtor(parseInt(realtor_id), requestedFields);
//     },
//     getProperties: async (_: any, { first, after }: { first: number; after?: string }, __: any, info: any) => {
//       // Safely extract fields under edges.node
//       const getNodeFields = (fieldNodes: any[]): string[] => {
//         const edgesField = fieldNodes
//           ?.find(node => node.name?.value === 'getProperties')
//           ?.selectionSet?.selections
//           ?.find((sel: any) => sel.name?.value === 'edges');
        
//         const nodeFields = edgesField?.selectionSet?.selections
//           ?.find((sel: any) => sel.name?.value === 'node')
//           ?.selectionSet?.selections;

//         if (!nodeFields) {
//           console.warn('No node fields found in query, defaulting to basic fields');
//           return ['id', 'title', 'price']; // Fallback fields
//         }

//         return nodeFields
//           .filter((sel: any) => sel.kind === 'Field')
//           .map((sel: any) => sel.name.value);
//       };

//       const requestedFields = getNodeFields(info.fieldNodes);
//       console.log('getProperties requestedFields:', requestedFields);

//       return await PropertyModel.findAllPaginated(first, after, requestedFields);
//     },
//     // getProperties: async (_: any, { first, after }: { first: number; after?: string }, __: any, info: any) => {
//     //   const exe = info.fieldNodes[0].selectionSet?.selections[1].selectionSet.selections[0].selectionSet.selections;
//     //   // console.log(info.fieldNodes[0].selectionSet?.selections[1].selectionSet.selections[0].selectionSet.selections.map((s: any) => s.name.value));
//     //   const requestedFields = getNestedRequestedFields(exe);
//     //   // console.log('working', requestedFields)
//     //   // console.log('getProperties requestedFields:', requestedFields);
//     //   return await PropertyModel.findAllPaginated(first, after, requestedFields);
//     // },
//   },
//   Mutation: {
//     createProperty: async (_: any, { input }: { input: any }, { user }: { user: User }) => {
//       const property = await PropertyModel.create(input);
//       propertyImageLoader.clear(property.id);
//       return property;
//     },
//     updateProperty: async (_: any, { id, input }: { id: string; input: Property }, { user }: { user: User }) => {
//       if (!user) throw new Error("Unauthorized");
//       const property = await PropertyModel.findById(parseInt(id));
//       if (!property || property.realtor_id !== user.id) throw new Error("Unauthorized");
//       const updatedProperty = await PropertyModel.update(parseInt(id), input);
//       propertyImageLoader.clear(parseInt(id));
//       return updatedProperty;
//     },
//     deleteProperty: async (_: any, { id }: { id: string }, { user }: { user: User }) => {
//       if (!user) throw new Error("Unauthorized");
//       const property = await PropertyModel.findById(parseInt(id));
//       if (!property || property.realtor_id !== user.id) throw new Error("Unauthorized");
//       const result = await PropertyModel.delete(parseInt(id));
//       propertyImageLoader.clear(parseInt(id));
//       return result;
//     },
//     generateCloudinarySignature: async (_: any, __: any, { user }: { user: User }) => {
//       if (!user) throw new Error("Unauthorized");
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
//   Property: {
//     realtor: async (parent: Property) => {
//       return await userLoader.load(parent.realtor_id);
//     },
//     address: async (parent: Property) => {
//       return await addressLoader.load(parent.address_id);
//     },
//     images: async (parent: Property) => {
//       return await propertyImageLoader.load(parent.id);
//     },
//     bookings: async (parent: Property) => {
//       return await propertyBookingLoader.load(parent.id);
//     },
//     reviews: async (parent: Property) => {
//       return await propertyReviewLoader.load(parent.id);
//     },
//   },
// };
