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
const ip_array            = [];



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
      ip_array.push( l )

      // geolocationParams.setIPAddress(l.hostname);
      // ipgeolocationApi.getGeolocation(handleResponse, geolocationParams);

    }

    var uniques = uniqueHostnames( ip_array );
    
    for( let obj of uniques){
      
      // geolocationParams.setIPAddress(obj.hostname);
      // ipgeolocationApi.getGeolocation( handleResponse, geolocationParams);

      handleResponse( obj )
      // browseListener( obj.hostname )

    }
    // console.log( hostnames )
    
  });
  

function handleResponse(json) {
  console.log(json);
}




function uniqueHostnames( ip_array ){
  let data = new Map();

  for (let obj of ip_array) {
    data.set(obj.hostname, obj);
  }

    let out = [...data.values()];

    // console.log( out )
    return out;
}

function browseListener( hostname ){
  var out = [];

  var myQ = "SELECT *  FROM `listeners` WHERE hostname IN('" + hostname + "')";

  con.query( myQ,(err, res ) => {
      
      if( err ) {
          console.error(err.message )
      }
      // iterate results set up the array for return
      for( let result of res ){
          out             = result
      }
          
       console.log(out)

      //callback(out);
  });
}