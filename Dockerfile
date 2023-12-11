FROM node:18-alpine as development

WORKDIR  /usr/src/app

COPY package*.json ./

RUN npm install --global npm@latest
RUN npm ci

COPY --chown=node:node . .

FROM development as builder

RUN npm run dev