# Use official Node.js LTS image
FROM node:20-alpine


# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of your app
COPY . .


# Expose the port your Express app runs on
EXPOSE 3000

# Run the app
CMD ["node", "index.js"]
