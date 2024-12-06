FROM node:20.10.0

WORKDIR /app

COPY package*.json ./

RUN npm install --production \
    npm i -y

COPY . .

EXPOSE 5000

ENV ENVIRONNEMENT=PROD
ENV PORT=5000
ENV SFTP_HOST=10.10.1.21
ENV SFTP_PORT=2222


CMD ["node", "server.js"]