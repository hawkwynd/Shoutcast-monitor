
const config              = require('./config/config.json');
const db                  = config.mysql;
const mysql               = require('mysql');
const moment              = require('moment');
const con                 = mysql.createConnection(db);
const http                = require("http");
const host                = 'localhost';
const port                = 8080;

// const requestListener = function (req, res) {};

con.connect();

const requestListener = function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
    res.end(`{"message": "This is a JSON response"}`);
};
