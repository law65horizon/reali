import { createClient } from 'redis';

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT)
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

