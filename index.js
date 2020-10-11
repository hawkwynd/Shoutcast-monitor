// @author Scott Fleming
// @email hawkwynd@gmail.com 

const getJSON = require('get-json');
const prettyMilliseconds = require('pretty-ms');
const geoip = require('geo-from-ip');
const mongo = require('mongodb');
const config = require('./config.json');
const sc = config.shoutcast; 
const mc = config.mongodb;
const MongoUrl = `mongodb://${mc.host}:${mc.port}/${mc.db}`;
const myCollection = mc.collection;
const database = mc.db;


function runner(){

const dt = new Date();
	
   getJSON(sc.url + "/" + sc.path + "?sid=" + sc.sid + '&mode=' + sc.mode + '&pass=' + sc.pass)
  .then(function(resp) {
    
    let server = Object.assign({}, resp); // clone resp so we don't kill the object when deleting listener and songs
    var serverStat = getserverStats(server);

    console.log('\033[2J'); // clear console 
    console.log(`Server Uptime: ${secondsToHms(resp.streamuptime)} ${dt.toLocaleString()}` );
    console.log(`Currently playing: ${resp.songtitle}`);
    
    // Got milk? Then spill it!
    if( resp.uniquelisteners > 0 ) {
      
      console.log(`Average Listening Time: ${secondsToHms(serverStat.averagetime)}`);
      console.log( `Listeners: ${resp.uniquelisteners}` );
      console.log( `--------------\n`);
      
      var listeners = getListeners(resp);

      for( let listener of listeners){

        listener.geo = geoip.allData(listener.hostname);
        listener.connecttime = secondsToHms(listener.connecttime);
        listener.referer = listener.referer == '' ? 'DNAS' : 'HTML'
        listener.timestamp = dt.toLocaleString();
  
        // Display listener info line
        console.log( listener.timestamp + ' | ' + listener.hostname + ' | ' 
        + listener.geo.city +  ', ' + listener.geo.state + ' ' + listener.geo.code.country + ' | '
        + listener.connecttime + ' | ' + listener.referer + ' | ' + listener.geo.location.latitude + ',' + listener.geo.location.longitude
        );

        // now update the mongo table with the listener data
        mongoUpdate(listener);

      }
      
    }else{
      console.log(`Sorry, but there are ${resp.uniquelisteners} listeners at the moment :(`  );
    }
    
    
  }).catch(function(error){
    console.log(error);
  });
}

runner();

// loop it every X milliseconds 60000 = 1 minute
setInterval(runner, 15000);
  
// --------- FUNCTION FUNCTION, WHAT'S YOUR FUNCTION?? ------------

function getListeners(d){ return d.listeners; }

function getserverStats(s){
  delete(s.listeners);
  delete(s.songs);
  return s;
}

function secondsToHms(t) {
  t     = Number(t);
  var h =  pad(Math.floor(t / 3600));
  var m =  pad(Math.floor(t % 3600 / 60));
  var s = pad(Math.floor(t % 3600 % 60));
  
  return h + ":" + m + ":" + s;
}

function pad(n){ return n < 10 ? '0'+n : n }

function mongoUpdate(data){
  mongo.connect(MongoUrl, {useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
    if(err) {
       console.log(err);
       process.exit(0);
    }
    // connect to database, and set collection (config.json)
    var dbo        = db.db( database );
    var collection = dbo.collection( myCollection );

    // do update/insert of our record
    try{
      collection.findOneAndUpdate(
         {"hostname" : data.hostname},
         {$set: {
             "timestamp" : data.timestamp,
             "referer" : data.referer,
             "useragent" : data.useragent,
             "hostname" : data.hostname,
             "lat"      : data.geo.location.latitude,
             "lng"  : data.geo.location.longitude,
             "country" : data.geo.country,
             "city" : data.geo.city,
             "state" : data.geo.state,
             "connecttime" : data.connecttime
         },
     },
     { upsert:true, returnNewDocument : true } // upsert will insert if not found
         
      );
  }
  catch(e){
      // spew error if we have one
      console.log(e);
      process.exit(0);
  }
   // shut the door on your way out.
  db.close();

  });

}
