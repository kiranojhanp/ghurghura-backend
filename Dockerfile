FROM node:16-alpine as base

WORKDIR /src
COPY package*.json /
EXPOSE 8080

# For production
FROM base as production
ENV NODE_ENV=production
RUN npm ci
COPY . .
CMD ["npm", "start"]

# From development
FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . .
CMD ["npm", "run", "dev"]
