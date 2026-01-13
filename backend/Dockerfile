# Use Node 20 (or specify the version you need)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for development)
RUN npm install

# Copy the rest of the code (in dev, we'll override this with a volume mount)
COPY . .

# Expose the port your server runs on (adjust if needed)
EXPOSE 4000

# Run the dev script
CMD ["npm", "run", "dev"]