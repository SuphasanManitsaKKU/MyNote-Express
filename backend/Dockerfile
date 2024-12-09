# Backend Dockerfile
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the application files
COPY . .

RUN npx prisma generate

# Expose the application port
EXPOSE 8000

# Start the application
CMD ["npm", "run", "start"]
