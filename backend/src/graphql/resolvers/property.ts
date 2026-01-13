// Updated property resolver
import DataLoader from "dataloader";  
import cloudinary from "../../config/cloudinary.js";
import PropertyModel, { Property, SearchRoomsInput } from "../../models/Property.js";
import { User } from "../../models/User.js";
import { getNestedRequestedFields, getRequestedFields, getRequestedFieldss } from "../../utils/getyRequestedFields.js";
import { addressLoader, userLoader } from "./user.js";
import pool from "../../config/database.js";
import { GraphQLScalarType, Kind } from "graphql";

// Date scalar
const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value: any) {
    return value instanceof Date ? value.toISOString().split('T')[0] : value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// DateTime scalar
const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

export default {
  Date: dateScalar,
  DateTime: dateTimeScalar,
  Query: {
    getProperty: async (_: any, { id }: { id: string }, { user }: { user: User }, info: any) => {
      console.log('wowiowiwo')
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
    searchRoomTypes: async (_: any, {input}: {input: SearchRoomsInput}, __: any, info: any) => {
      console.log({sos: 'wiwoiw'})
      const requestedFields = getNestedRequestedFields(info)
      // console.log({requestedFields})
      return await PropertyModel.searchRoomTypes(input, requestedFields)
    },

    getAvailability: async (_, { id, startDate, endDate }) => {
      return await PropertyModel.getAvailability({id, startDate, endDate})
    },
    getAvailableUnits: async (_, { id, checkIn, checkOut }) => {
      return await PropertyModel.getAvailableUnits({id, checkIn, checkOut})
    },
    getRoomType: async (_, {id}: {id: number}, __: any, info: any) => {
      const requestedFields = getRequestedFields(info)          
      return await PropertyModel.getRoomType(id, requestedFields)
    }
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
    addRoomUnit: async (_:any, {input}: {input: any}) => {
      const unit = await PropertyModel.addRoomUnit(input)
      return unit
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
      return await userLoader.load(parent.realtor_id,);
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
    roomTypes: async (parent: Property) => {
      return await roomTypesLoader.load(parent.id)
    },
    // units: async (parent: Property) => {
    //   return await roomUnitLoader.load(parent.id)
    // },
    // pricing: async (parent: Property) => {
    //   return await rateCalendarLoader.load(parent.id)
    // },

  },
  RoomType: {
    units: async (parent) => {
      return await roomUnitLoader.load(parent.id)
    },
    pricing: async (parent) => {
      console.log({check: "iosiosi"})
      return await rateCalendarLoader.load(parent.id)
    },
    images: async (parent) => {
      return await roomImageLoader.load(parent.id)
    }, 
    // property: async(parent, _, __, info) => {
    //   const requestedFields = getRequestedFields(info)
    //   console.log({requestedFields})
    //   return await PropertyModel.findById(parent.property_id, requestedFields)
    // },
    // availableUnits: async (parent) => {
    //   // console.log({parent: parent.id})
    //   // return 10
    //   return await PropertyModel.countUnits({id: parent.id})
    // },
  },
};

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

const roomImageLoader = new DataLoader(async (propertyIds: readonly number[]) => {
  const query = `
    SELECT 
      id, 
      imageable_id, 
      imageable_type,
      url, 
      meta_data, 
      caption
    FROM images
    WHERE imageable_id = ANY($1) AND imageable_type = 'room'
  `;
  const result = await pool.query(query, [propertyIds]);
  return propertyIds.map(id => result.rows.filter(row => row.imageable_id == id));
});

const propertyBookingLoader = new DataLoader(async (propertyIds: readonly number[]) => {
  const query = `
    SELECT * FROM bookings
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

const roomTypesLoader = new DataLoader(async (propertyIds: readonly number[]) => {
  const query = `
    SELECT * FROM room_types
    WHERE property_id = ANY($1)
  `;
  const result = await pool.query(query, [propertyIds]);
  return propertyIds.map(id => result.rows.filter(row => row.property_id == id));
});

export const roomUnitLoader = new DataLoader(async (roomTypesIds: readonly number[]) => {

  const query = `
    SELECT * FROM room_units
    WHERE room_type_id = ANY($1)
  `;
  const result = await pool.query(query, [roomTypesIds]);
  return roomTypesIds.map(id => result.rows.filter(row => row.room_type_id == id));
});

export const roomUnitLoader0 = new DataLoader(async (roomTypesIds: readonly number[]) => {
  const query = `
    SELECT * FROM room_units
    WHERE id = ANY($1)
  `;

  const result = await pool.query(query, [roomTypesIds]);
  const rows = result.rows;

  // Create a map: id → row
  const rowMap = new Map<number, any>();
  rows.forEach(row => rowMap.set(row.id, row));

  // Return array in the same order as input keys
  return roomTypesIds.map(id => rowMap.get(id) ?? null);
});

// const pricingRulesLoader = new DataLoader(async (roomTypesIds: readonly number[]) => {
//   const query = `
//     SELECT * FROM room_pricing_rules
//     WHERE room_type_id = ANY($1)
//   `;
//   const result = await pool.query(query, [roomTypesIds]);
//   return roomTypesIds.map(id => result.rows.filter(row => row.room_type_id == id));
// });

// const durationDiscountsLoader = new DataLoader(async (roomTypesIds: readonly number[]) => {
//   const query = `
//     SELECT * FROM room_duration_discounts
//     WHERE room_type_id = ANY($1)
//   `;
//   const result = await pool.query(query, [roomTypesIds]);
//   return roomTypesIds.map(id => result.rows.filter(row => row.room_type_id == id));
// });

const rateCalendarLoader = new DataLoader(async (roomTypesIds: readonly number[]) => {
  console.log({roomTypesIds})
  const query = `
    SELECT * FROM rate_calendar
    WHERE room_type_id = ANY($1)
  `;
  const result = await pool.query(query, [roomTypesIds]);
  // console.log(roomTypesIds.map(id => result.rows.filter(row => row.room_type_id == id)))
  return roomTypesIds.map(id => result.rows.filter(row => row.room_type_id == id));
});

// const roomBlocksLoader = new DataLoader(async (roomTypesIds: readonly number[]) => {
//   const query = `
//     SELECT * FROM room_blocks
//     WHERE room_type_id = ANY($1)
//   `;
//   const result = await pool.query(query, [roomTypesIds]);
//   return roomTypesIds.map(id => result.rows.filter(row => row.room_type_id == id));
// });


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