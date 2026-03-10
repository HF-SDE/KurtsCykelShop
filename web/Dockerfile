FROM node:20-bookworm-slim

# Set working directory
WORKDIR /usr/src/app

COPY package.json ./
RUN npm i

COPY . .

CMD ["npm", "run", "dev"]
