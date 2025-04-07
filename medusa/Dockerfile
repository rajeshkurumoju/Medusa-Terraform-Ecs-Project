FROM node:16-alpine

WORKDIR /usr/src/app

# Copy only package.json first for caching
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the code
COPY . .

EXPOSE 9000

CMD ["npm", "start"]

