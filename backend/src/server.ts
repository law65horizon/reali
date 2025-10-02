import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express5';
import express from 'express';
import { connectDB } from './config/database.js';
import http from 'http';
import { typeDefs } from './graphql/schema/index.js';
import resolvers from './graphql/resolvers/index.js';
import { gql } from 'graphql-tag';
import { Pool } from 'pg';
import pool from './config/database.js';
import { Context } from './graphql/context.js';
import { pubsub } from './services/pubsub.js';
import cors from "cors"

// interface MyContext {
//   token?: string;
// }

// interface User {
//   id: number;
//   name: string;
//   email: string;
//   password: string;
//   phone?: string;
//   description?: string;
//   created_at: Date;
// }

// const typeDefs = gql`
//   type User {
//     id: ID!
//     name: String!
//     email: String!
//     phone: String
//     description: String
//     createdAt: String!
//   }

//   input UserInput {
//     name: String!
//     email: String!
//     password: String!
//     phone: String
//     description: String
//   }

//   type Query {
//     getUser(id: ID!): User
//     getUsers: [User!]!
//   }

//   type Mutation {
//     createUser(input: UserInput!): User!
//     updateUser(id: ID!, input: UserInput!): User!
//     deleteUser(id: ID!): Boolean!
//   }
// `;

// const resolvers = {
//   Query: {
//     getUser: async (_: any, { id }: { id: string }, { pool }: { pool: Pool }) => {
//       const result = await pool.query('SELECT * FROM users WHERE id = $1', [parseInt(id)]);
//       const user = result.rows[0];
//       if (!user) return null;
//       return {
//         ...user,
//         createdAt: user.created_at.toISOString(),
//       };
//     },
//     getUsers: async (_: any, __: any, { pool }: { pool: Pool }) => {
//       const result = await pool.query('SELECT * FROM users');
//       return result.rows.map((user) => ({
//         ...user,
//         createdAt: user.created_at.toISOString(),
//       }));
//     },
//   },
//   Mutation: {
//     createUser: async (_: any, { input }: { input: User }, { pool }: { pool: any }) => {
//       const { name, email, password, phone, description } = input;
//       const result = await pool.query(
//         'INSERT INTO users (name, email, password, phone, description, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
//         [name, email, password, phone, description]
//       );
//       const user = result.rows[0];
//       return {
//         ...user,
//         createdAt: user.created_at.toISOString(),
//       };
//     },
//   },
// };

const app = express();
const httpServer = http.createServer(app);

app.use(cors({
  origin: '*', // Allow all origins for development; restrict in production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-apollo-operation-name'],
}));

const startServer = async () => {
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    csrfPrevention: false,
    // context: ({req}) => ({ pool, req, pubsub }),
  });

  try {
    await connectDB();
    await server.start();
    console.log('Apollo Server started successfully');

    app.use(
      '/',
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => ({ req, pubsub }),
      })
    );

    await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000/`);
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

startServer();