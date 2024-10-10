# Use Node.js version 20.18.0 (LTS)
FROM node:20.18.0-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Use environment variable for the port (default to 3000 if not provided)
ENV PORT=3000

# Run the application
CMD ["npm", "start"]
