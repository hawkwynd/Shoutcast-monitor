// Karen - song counter 
const getJSON             = require('get-json');
const prettyMilliseconds  = require('pretty-ms');
const config              = require('./config.json');
const mysql               = require('mysql');
const moment              = require('moment');
const sc                  = config.shoutcast; 

const con = mysql.createConnection({
    host: "localhost",
    user: "shoutcast",
    password: "hawkwynd2020",
    database: "hawkwyndradio"
  });

//   con.connect();

getShoutcast()

function getShoutcast(){
    getJSON(sc.url + "/" + sc.path + "?sid=" + sc.sid + '&mode=' + sc.mode + '&pass=' + sc.pass)
    .then( function( resp ) {   
        callbackFuncWithData( resp )
    })
}

function callbackFuncWithData(r){
    
      
    const listeners = [...new Map(r.listeners.map(item => [item["hostname"], item])).values()];

    console.log( listeners )

}


