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
      console.log("Error fetching tasks", err);
      response.status(500).json({
        error: err
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
    "DELETE FROM Tasks WHERE TaskId = " + connection.escape(request.params.id);
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
        taskId: results.insertId,
        description: taskToBeSaved.description,
        completed: taskToBeSaved.completed,
        userId: taskToBeSaved.userId
      });
    }
  });
});

app.put("/tasks/:id", function(request, response) { 
  // request.body = {
  //   "description" : "Fly to the moon",
  //   "completed" : false,
  //   "userId" : 1
  // }
  const task = request.body;
  const id = request.params.id;
  const query =
    "UPDATE Tasks SET Description = ?, Completed = ? WHERE TaskId = ?";
  connection.query(
    query,
    [task.description, task.completed, id],
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

app.get("/", function(request,response) {
  response.status(200).send("Okay it works");
})

module.exports.handler = serverless(app);
