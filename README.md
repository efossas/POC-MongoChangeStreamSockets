# POC-MongoChangeStreamSockets

A POC for setting up a SocketIO microservice that emits changes in Mongo databases

## Explanation

For a full explanation, see my blog: [Abaganon Mongo Change Stream Sockets](https://abaganon.com/tutorials/web-sockets.html)

A SocketIO microservice is created that listens to change streams from databases (specified in sockets/config.json) in a Mongo replica set.

A simple front-end exists that allows you to connect to a socket room based on UUID. 
Then you can update/insert documents attached to that UUID by using the other front-end form (which sends a post request to a simple back-end that tells Mongo to update/insert the document).
If you're listening to the same UUID socket room of the document you've updated/created, you'll see those updates printed below.

Finally, Mongo-Express is installed so you can see the data you've been playing with and Redis is installed to store socket connections states (allowing you to scale the socket service as needed).

## Set Up

You need Docker installed (not in Swarm mode).

```
docker compose up -d
```

Everything should build and deploy automatically.

## Usage

- front end: http://localhost:8080
- mongo-express: http://localhost:8081
- back end: http://localhost:8082
- sockets: http://localhost:8083
