FROM node:6.9

WORKDIR /src
COPY ./package.json /src/package.json
RUN npm install

COPY . /src

EXPOSE 8080
CMD node app.js