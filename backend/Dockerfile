FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g nodemon 

COPY src /app/src/

EXPOSE 3000

CMD ["nodemon", "npm", "run", "dev"]