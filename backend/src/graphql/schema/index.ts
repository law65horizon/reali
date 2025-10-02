import { gql } from 'graphql-tag';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Derive __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userSchema = fs.readFileSync(path.join(__dirname, 'user.graphql'), 'utf8');
const propertySchema = fs.readFileSync(path.join(__dirname, 'property.graphql'), 'utf8');
const bookingSchema = fs.readFileSync(path.join(__dirname, 'booking.graphql'), 'utf8');
const messageSchema = fs.readFileSync(path.join(__dirname, 'message.graphql'), 'utf8');
const reviewSchema = fs.readFileSync(path.join(__dirname, 'review.graphql'), 'utf8');
const experienceSchema = fs.readFileSync(path.join(__dirname, 'experience.graphql'), 'utf8');

export const typeDefs = gql`
  ${userSchema}
  ${propertySchema}
  ${bookingSchema}
  ${messageSchema}
  ${reviewSchema}
  ${experienceSchema}
`;