const serverless = require('serverless-http');
const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql');

app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "tasks"
});

app.get("/tasks", function (request, response) {
  // const username = request.query.username;
  let queryToExecute = "SELECT * FROM Tasks";

  // if (username) {
  //   queryToExecute =
  //     "SELECT * FROM Task JOIN User on Task.UserId = User.UserId WHERE User.Username = " +
  //     connection.escape(username);
  // }
  connection.query(queryToExecute, (err, queryResults) => {
    if (err) {
      console.log("Error fetching tasks", error);
      response.status(500).json({
        error: error
      });
    } 
    else {
      response.json({
        tasks: queryResults
      });
    }
  });
});

app.delete("/tasks/:id", function(request, response) {
  const query =
    "DELETE FROM Task WHERE TaskId = " + connection.escape(request.params.id);
  connection.query(query, (err, deleteResults) => {
    if (err) {
      console.log("Error deleting Task", err);
      response.status(500).json({
        error: err
      });
    } else {
      response.status(200).send("Task deleted");
    }
  });
});


app.post("/tasks", function (request, response) {

  const taskToBeSaved = request.body;

  connection.query('INSERT INTO Tasks SET ?', taskToBeSaved, function (error, results, fields) {
    if (error) {
      console.log("Error saving new task", error);
      response.status(500).json({
        error: error
      });
    }
    else {
      response.json({
        taskId: results.insertId
      });
    }
  });
});

app.put("/tasks/:id", function(request, response) {
  const task = request.body.task;
  const id = request.params.id;
  const query =
    "UPDATE Task SET Description = ?, Completed = ?, UserId = ? WHERE TaskId = ?";
  connection.query(
    query,
    [task.Description, task.Completed, task.UserId, id],
    function(err, queryResponse) {
      if (err) {
        console.log("Error updating task", err);
        response.status(500).send({ error: err });
      } else {
        response.status(201).send("Updated");
      }
    }
  );
});


module.exports.handler = serverless(app);
