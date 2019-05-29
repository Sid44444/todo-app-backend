const serverless = require('serverless-http');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

app.get('/tasks', function (request, response) {

  const username = request.query.username;

  const someJson = {
    tasks: ["Completed Javascript challenges",  "Buy gift for friend", "Take the dog for a walk"]

  };
  response.json(someJson);
})

module.exports.handler = serverless(app);
