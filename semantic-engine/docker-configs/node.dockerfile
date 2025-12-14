FROM node:22.21

RUN mkdir -p /app

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
