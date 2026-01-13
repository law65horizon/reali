import dotenv from 'dotenv'

dotenv.config()

export const env = {
    PORT: process.env.PORT || '4000',
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_DATABASE: process.env.DB_DATABASE,
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
}