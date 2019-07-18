
'use strict';

const config = require('./config.json');
const mongo = require('mongodb');
const MUUID = require('uuid-mongodb');
const http = require('http').createServer();
const io = require('socket.io')(http);
const redisAdapter = require('socket.io-redis');
const events = require('./events.js');

let database = () => {
  return new Promise((resolve, reject) => {
    mongo.MongoClient.connect(
      config.mongo.url,
      { useNewUrlParser: true },
      (err, connection) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(connection);
      }
    );
  });
};

let sockets = () => {
  return new Promise((resolve, reject) => {
    io.adapter(redisAdapter({ host: 'redis', port: 6379 }));

    io.on('connect', (socket) => {
      socket.on('disconnect', () => {
        // clean up code goes here
      });

      events.Check(socket);
      events.JoinRoom(socket);
      events.LeaveRoom(socket);
    });

    http.listen(80);

    resolve(io);
  });
};

let watchChangeStreams = (connection, io) => {
  config.mongo.db.forEach(dbName => {
    connection.db(dbName).watch([], {
      fullDocument: 'updateLookup'
    }).on('change', (change) => {
      /* only emit updated values */
      let cobj;
      if (change.operationType === 'update') {
        cobj = change.updateDescription.updatedFields;
      } else {
        cobj = change.fullDocument;
      }

      /* mongo converts UUID to binary, so let's change it back to a string */
      try {
        if (!change.fullDocument.uuid) {
          return;
        } else if (change.fullDocument.uuid.constructor.name !== "Binary") {
          throw "constructor.name must be Binary";
        } else if (change.fullDocument.uuid.sub_type !== 4) { // http://bsonspec.org/spec.html
          throw "Binary object's subtype is not standard UUID";
        }

        cobj.uuid = MUUID.from(change.fullDocument.uuid).toString();
      } catch (err) {
        console.error(err);
        return;
      }

      /* emit the change to anyone who has subcribed to the UUID */
      console.info('emitting to: ' + cobj.uuid + ' ' + change.ns.coll);
      io.to(cobj.uuid).emit(change.ns.coll, cobj);
    });
  });
  console.log(JSON.stringify({ watching: config.mongo.db }));
};

Promise.all([database(), sockets()])
.then(([db, io]) => {
  watchChangeStreams(db, io);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
