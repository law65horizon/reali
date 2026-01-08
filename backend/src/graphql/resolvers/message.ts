// src/graphql/resolvers/message.ts
import { PubSub } from 'graphql-subscriptions';
import MessageModel, { Message } from '../../models/Message.js';
import UserModel, {User} from '../../models/User.js';
// import { Error } from '@apollo/server';
import { pubsub } from '../../services/pubsub.js';

export default {
  Query: {
    getMessages: async (_: any, { chatId }: { chatId: string }) => {
      return await MessageModel.findByChatId(chatId);
    },
  },
  Mutation: {
    sendMessage: async (_: any, { input }: { input: Message }, { user }: { user: User }) => {
      if (!user) throw new Error('Unauthorized');
      const message = await MessageModel.create({ ...input, sender_id: user.id });
      pubsub.publish(`MESSAGE_ADDED_${input.chat_id}`, { messageAdded: message });
      return message;
    },
  },
  Subscription: {
    messageAdded: {
    //   subscribe: (_: any, { chatId }: { chatId: string }) => pubsub.asyncIterator(`MESSAGE_ADDED_${chatId}`),
    },
  },
  Message: {
    sender: async (parent: Message) => {
      return await UserModel.findById(parent.sender_id);
    },
  },
};
