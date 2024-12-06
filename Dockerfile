FROM node:20.10.0

WORKDIR /app

COPY package*.json ./

RUN npm install --production \
    npm i -y

COPY . .

EXPOSE 5000

CMD ["node", "app.js"]