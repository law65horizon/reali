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
import { createEmailTransporter } from './utils/emailTransport.js';
import { error } from 'console';
import jwt from 'jsonwebtoken';
// import { authMiddleWare } from './middleware/auth.js';
import { verifyToken } from './services/auth.js';
import { createWebhookRouter } from './routes/createWebHook.js';



const app = express();
const httpServer = http.createServer(app);

app.use(cors({
  origin: '*', // Allow all origins for development; restrict in production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-apollo-operation-name'],
}));

app.use('/webhooks', createWebhookRouter(pool))

app.use(express.json())

const startServer = async () => {
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    csrfPrevention: false,
    formatError: (error) => {
      console.error('GraphQl Error:', error)
      return error
    }
    // context: ({req}) => ({ pool, req, pubsub }),
  });

  try {
    await createEmailTransporter()
    await connectDB();
    await server.start();
    console.log('Apollo Server started successfully');

    // app.use(
    //   '/',
    //   express.json(),
    //   expressMiddleware(server, {
    //     context: async ({ req, }) => ({ req, pubsub, db: pool }),
    //   })
    // );

    app.use(
      '/',
      express.json(),
      expressMiddleware(server, {
        context: async ({ req, }) => {
          await new Promise<void>((resolve, reject) => {
            verifyToken({ req, next: (err?: any) => (err ? reject(err) : resolve()) });
          });

          return {
            req,
            db: pool,
            pubsub,
            user: (req as any).user
          }
        },
      })
    );

    await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000/`);
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

startServer();
