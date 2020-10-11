const getJSON             = require('get-json');
const prettyMilliseconds  = require('pretty-ms');
const geoip               = require('geo-from-ip');
const mongo               = require('mongodb');
const config              = require('./config.json');
const mysql               = require('mysql');
const moment              = require('moment');
const sc                  = config.shoutcast; 
const mc                  = config.mongodb;
const MongoUrl            = `mongodb://${mc.host}:${mc.port}/${mc.db}`;
const myCollection        = mc.collection;
const database            = mc.db;
const dt                  = new Date();
var _                     = require('lodash'); // used in diff of arrays
const hostnames           = [];

// mysql connection

const con = mysql.createConnection({
    host: "localhost",
    user: "shoutcast",
    password: "hawkwynd2020",
    database: "hawkwyndradio"
  });

  con.connect();


  getJSON(sc.url + "/" + sc.path + "?sid=" + sc.sid + '&mode=' + sc.mode + '&pass=' + sc.pass)
  .then( function( resp ) {
    for ( let l of resp.listeners ){
        
      hostnames.push( l )
    }
    console.log( hostnames )
  });

console.log('Now you have some data from listeners. Compare that to the database table.')

