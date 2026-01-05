import {Request} from 'express'
import {verifyToken} from '../services/auth.js'
import {pubsub} from '../services/pubsub.js'
import { User } from '../models/User.js'
import { PubSub } from 'graphql-subscriptions';


export interface Context{
    req: Request;
    user?: User;
    pubsub: PubSub
}

// export default async ({req}: {req: Request}): Promise<Context> => {
//     const token = req.headers.authorization?.replace('Bearer ', '');
//     const user = token ? await verifyToken(token) : undefined
//     return {req, user, pubsub }
// }