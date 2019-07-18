
'use strict';

const config = require('./config.json');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MUUID = require('uuid-mongodb');
const mongo = require('mongodb');

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

database()
.then(db => {
  const app = express();

  app.use(bodyParser.json());
  
  app.use((req, res, next) => {
    res.respond = (status, data, err) => {
      return res.status(status).json({'data': data, 'error': String(err)});
    };
    next();
  });

  // remove this in prod!! this is for testing on localhost:PORTS
  app.use(cors());
  
  app.post('/update', (req, res) => {
    
    let uuid;
    if (req.body.uuid && typeof req.body.uuid === 'string') {
      uuid = MUUID.from(req.body.uuid);
    } else {
      uuid = MUUID.v4();
    }

    let data = req.body.data;

    console.info('updating: ' + uuid.toString());
  
    db.db("app").collection("test").updateOne({uuid: uuid}, {$set: {data: data}}, {upsert: true}, (err, result) => {
      if (err) throw err;
      res.respond(200, result, '');
    });
  });
  
  app.all('*',(req, res) => {
    res.respond(404, {}, 'Not Found');
  });
  
  app.server = http.createServer(app);
  app.server.listen(config.http.port, () => {
    console.info('http server listening at port ' + config.http.port);
  });
});