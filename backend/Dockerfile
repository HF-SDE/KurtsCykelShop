# syntax=docker/dockerfile:1.4
FROM node:24-alpine AS base

# Setting the timezone
RUN apk add -U tzdata
RUN cp /usr/share/zoneinfo/Europe/Copenhagen /etc/localtime

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy other application files
COPY . .

# Generate Prisma types
RUN npx prisma generate

# Ensure entrypoint.sh is executable
RUN chmod +x ./entrypoint.sh

# Expose port 5000 for HTTPS
EXPOSE 5000

# Command to start the application (using HTTPS on port 5000)
ENTRYPOINT ["./entrypoint.sh"]
