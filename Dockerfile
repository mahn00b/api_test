FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD . .

RUN npm install
RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]