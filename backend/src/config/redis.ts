import { createClient } from 'redis';

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-12462.c15.us-east-1-4.ec2.cloud.redislabs.com',
        port: 12462
    },
    
});

redisClient.on('error', err => console.log('Redis client Error', err));
redisClient.on('connect', () => {
    console.log('Redis client connected')
})

export const connectRedis = async() => {
    try {
        await redisClient.connect()
    } catch (error) {
        throw error
    }
}

export default redisClient

