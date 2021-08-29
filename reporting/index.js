
const config              = require('./config/config.json');
<<<<<<< HEAD
const mysql               = require('mysql');
const moment              = require('moment');
const con = mysql.createConnection({
    host: "localhost",
    user: "shoutcast",
    password: "hawkwynd2020",
    database: "hawkwyndradio"
  });

  con.connect();


const http = require("http");
const host = 'localhost';
const port = 8080;
// const requestListener = function (req, res) {};

=======
const db                  = config.mysql;
const mysql               = require('mysql');
const moment              = require('moment');
const con                 = mysql.createConnection(db);
const http                = require("http");
const host                = 'localhost';
const port                = 8080;

// const requestListener = function (req, res) {};

con.connect();

>>>>>>> 3aa6e789465165b2bb11288f4d055bb860f02921
const requestListener = function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
    res.end(`{"message": "This is a JSON response"}`);
};
