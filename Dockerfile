FROM node:18.12.1-alpine

ADD package.json /tmp/package.json

ADD package-lock.json /tmp/package-lock.json

RUN rm -rf dist

RUN cd /tmp && npm install

ADD ./ /app

RUN rm -rf /app/node_modules && cp -a /tmp/node_modules /app/

WORKDIR /app

RUN npm run build

RUN pwd

CMD ["npm", "run", "prod"]