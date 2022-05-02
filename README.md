#  TvWebhookReceiver

This software is used to provide Webhook Endpoints for Tradingview Webhook Alerts.
It also comes with a browser plugin which is used to autofill the Tradingview formular for alerts.

This software has been developed together with my bachelor paper.


## Backend

The Backend is the actual provider of the HTTP-API which is used webhook. It also stores the events and alerts.
Currently for storage a json file is used. In the future there will be a mongo db used.


## Browser plugin

The Browser plugin is used to manage current alerts. You can add new alerts, delete and edit old ones.
You can also view events to check why a alert triggered or why it was not able to execute a order.

## Setup


### Setting authenthication parameters

Authenthication parameters should be  set inside ```.env``` file

The AUTH_KEY should be set with a random string with at least 32 characters.
***Use a strong auth key since it allows to trigger and add alerts!***

Use this script to generate your credentials

#### Generate random keys

To generate random keys you can use the node js script ```./Server/bin/envKeyGenerator.js```

To run it from docker you will have to run the following command (after building with ```docker-compose build```):
```
docker run tvwebhookserver:latest node ./Server/bin/envKeyGenerator.js
```


### Setting up the server


To start the Server you will need [docker](https://docs.docker.com/get-docker/) and [docker-compose](https://docs.docker.com/compose/install/) installed.
To start run the following command

```
docker-compose build && docker-compose up -d && docker-compose logs
```

## Code coverage
Code coverage is only available on private gitlab server

### end to end test
[e2e-frontend](https://darcade.pages.darcade.de/webhooktradereciever/e2e/frontend/)

~~[e2e backend](https://darcade.pages.darcade.de/webhooktradereciever/e2e/backend/)~~
### unit test
[unit backend](https://darcade.pages.darcade.de/webhooktradereciever/unit/backend/)




## Used Dependencies
Check the package.json files to see which dependencies are used.

### Dependencies not in package.json files
Materialize - used for index page https://materializecss.com/

### Icon
Icons taken from fontawesome:
https://fontawesome.com/v6.0/icons/square-poll-vertical?s=solid


## License

This project is licensed under  GNU GENERAL PUBLIC LICENSE Version 3