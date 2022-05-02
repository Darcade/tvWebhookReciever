FROM cypress/browsers:node16.13.2-chrome97-ff96
#node:16

# Create app directory
WORKDIR /usr/src/ChromePlugin

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./ChromePlugin/package*.json ./

RUN yarn install


# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY ./ChromePlugin .


RUN NODE_OPTIONS=--openssl-legacy-provider && yarn build

WORKDIR /usr/src/Server

COPY ./Server/package*.json ./
RUN yarn global add dotenv-cli
RUN yarn install

RUN mkdir -p /usr/src/Server/public/artifacts
RUN cp -r /usr/src/ChromePlugin/artifacts/* /usr/src/Server/public/artifacts
RUN cp -r /usr/src/ChromePlugin/dist/ /usr/src/Server/public/webapp

COPY ./Server .


WORKDIR /usr/src

#COPY ./start.sh .
#COPY ./.env .

CMD ["node", "/usr/src/Server/bin/www"]
EXPOSE 41555
#CMD [ "bash", "start.sh" ]