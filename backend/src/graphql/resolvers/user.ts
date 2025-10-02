// import UserModel, { User } from "../../models/User.js"; 
// import { hashPassword } from "../../services/auth.js";
// import DataLoader from "dataloader";
// import { getRequestedFields } from "../../utils/getyRequestedFields.js";

// interface Address {
//   id: number;
//   street: string;
//   city: string;
//   postal_code?: string;
//   country: string;
//   latitude?: number;
//   longitude?: number;
//   created_at: string;
// }

// // DataLoader for users
// const userLoader = new DataLoader(async (ids: number[]) => {
//   const query = `
//     SELECT id, name, email, uid, phone, description, created_at, address_id
//     FROM users
//     WHERE id = ANY($1)
//   `;
//   const result = await UserModel.pool.query(query, [ids]);
//   return ids.map(id => result.rows.find(row => row.id === id) || null);
// });

// // DataLoader for addresses
// const addressLoader = new DataLoader(async (addressIds: (number | null)[]) => {
//   const validIds = addressIds.filter(id => id !== null) as number[];
//   if (validIds.length === 0) return addressIds.map(() => null);
//   const query = `
//     SELECT 
//       a.id, a.street, c.name AS city, a.postal_code, co.name AS country, 
//       a.latitude, a.longitude, a.created_at
//     FROM addresses a
//     LEFT JOIN cities c ON a.city_id = c.id
//     LEFT JOIN countries co ON c.country_id = co.id
//     WHERE a.id = ANY($1)
//   `;
//   const result = await UserModel.pool.query(query, [validIds]);
//   return addressIds.map(id => id ? result.rows.find(row => row.id === id) || null : null);
// });

// export default {
//   Query: {
//     getUser: async (_: any, { id }: { id: string }, __: any, info: any) => {
//       const requestedFields = getRequestedFields(info);
//       const user = await userLoader.load(parseInt(id));
//       if (!user) return null;
//       if (requestedFields.includes('address')) {
//         const address = await addressLoader.load(user.address_id);
//         return { ...user, address };
//       }
//       return user;
//     },
//     getUsers: async (_: any, __: any, ___: any, info: any) => {
//       const requestedFields = getRequestedFields(info);
//       const users = await UserModel.findAll(requestedFields);
//       if (requestedFields.includes('address')) {
//         return Promise.all(users.map(async (user) => {
//           const address = user.address_id ? await addressLoader.load(user.address_id) : null;
//           return { ...user, address };
//         }));
//       }
//       return users;
//     },
//   },
//   Mutation: {
//     createUser: async (_: any, { input }: { input: User & { address?: Address } }, __: any, info: any) => {
//       const requestedFields = getRequestedFields(info);
//       const hashedPassword = await hashPassword(input.password);
//       const user = await UserModel.create({ ...input, password: hashedPassword });
//       if (requestedFields.includes('address')) {
//         const address = user.address_id ? await addressLoader.load(user.address_id) : null;
//         return { ...user, address };
//       }
//       return user;
//     },
//     updateUser: async (_: any, { id, input }: { id: string, input: User }, { user }: { user: User }, info: any) => {
//       if (!user || user.id !== parseInt(id)) throw new Error('unauthorized');
//       const requestedFields = getRequestedFields(info);
//       const updatedUser = await UserModel.update(parseInt(id), input);
//       if (!updatedUser) return null;
//       if (requestedFields.includes('address')) {
//         const address = updatedUser.address_id ? await addressLoader.load(updatedUser.address_id) : null;
//         return { ...updatedUser, address };
//       }
//       return updatedUser;
//     },
//     deleteUser: async (_: any, { id }: { id: string }, { user }: { user: User }) => {
//       if (!user || user.id !== parseInt(id)) throw new Error('unauthorized');
//       return await UserModel.delete(parseInt(id));
//     },
//   },
// };

import AddressModel, { Address } from "../../models/Address.js";
import UserModel, { User } from "../../models/User.js";
import { hashPassword } from "../../services/auth.js";
import DataLoader from "dataloader";
import { getRequestedFields } from "../../utils/getyRequestedFields.js";   // Helper to parse requested fields

// DataLoader for users
export const userLoader = new DataLoader(async (ids: number[]) => {
  const query = `
    SELECT id, name, email, uid, phone, description, created_at, address_id
    FROM users
    WHERE id = ANY($1)
  `;
  console.log(ids)
  const result = await UserModel.pool.query(query, [ids]);
  return ids.map(id => result.rows.find(row => row.id === id) || null);
});

export const addressLoader = new DataLoader(async (addressIds: (number | null)[]) => {
  const validIds = addressIds.filter(id => id !== null) as number[];
  if (validIds.length === 0) return addressIds.map(() => null);
  const query = `
    SELECT 
      a.id, 
      a.street, 
      c.name AS city, 
      co.name AS country, 
      a.postal_code, 
      a.latitude, 
      a.longitude
    FROM addresses a
    LEFT JOIN cities c ON a.city_id = c.id
    LEFT JOIN countries co ON c.country_id = co.id
    WHERE a.id = ANY($1)
  `;
  const result = await AddressModel.pool.query(query, [validIds]);
  console.log(result.rows)
  return addressIds.map(id => id ? result.rows.find(row => row.id === id) || null : null);
});

export default {
  Query: {
    getUser: async (_: any, { id }: { id: string }, __: any, info: any) => {
      const requestedFields = getRequestedFields(info);
      const user = await userLoader.load(parseInt(id));
      if (!user) return null;
      if (requestedFields.includes('address')) {
        const address = await addressLoader.load(user.address_id);
        return { ...user, address };
      }
      return user;
    },
    getUsers: async (_: any, __: any, ___: any, info: any) => {
      const requestedFields = getRequestedFields(info);
      const users = await UserModel.findAll(requestedFields);
      if (requestedFields.includes('address')) {
        return Promise.all(users.map(async (user) => {
          const address = user.address_id ? await addressLoader.load(user.address_id) : null;
          return { ...user, address };
        }));
      }
      return users;
    },
  },
  Mutation: {
    createUser: async (_: any, { input }: { input: User & { address: Address } }, __: any, info: any) => {
      const requestedFields = getRequestedFields(info);
      const hashedPassword = await hashPassword(input.password);
      const user = await UserModel.create({ ...input, password: hashedPassword });
      // console.log(requestedFields.includes('address'))
      if (requestedFields.includes('address')) {
        const address = user.address_id ? await AddressModel.findById(user.address_id) : null;
        console.log(address)
        return { ...user, address };
      }
      return user;
    },
    updateUser: async (_: any, { id, input }: { id: string, input: User }, { user }: { user: User }, info: any) => {
      if (!user || user.id !== parseInt(id)) throw new Error('unauthorized');
      const requestedFields = getRequestedFields(info);
      const updatedUser = await UserModel.update(parseInt(id), input);
      if (!updatedUser) return null;
      if (requestedFields.includes('address')) {
        const address = updatedUser.address_id ? await addressLoader.load(updatedUser.address_id) : null;
        return { ...updatedUser, address };
      }
      return updatedUser;
    },
    deleteUser: async (_: any, { id }: { id: string }, { user }: { user: User }) => {
      if (!user || user.id !== parseInt(id)) throw new Error('unauthorized');
      return await UserModel.delete(parseInt(id));
    },
  },
};
