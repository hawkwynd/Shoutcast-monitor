const getJSON = require('get-json');
const prettyMilliseconds = require('pretty-ms');
const geoip = require('geo-from-ip');
const mongo = require('mongodb');
const config = require('./config.json');
const sc = config.shoutcast; 
var mc = config.mongodb;
const MongoUrl = `mongodb://${mc.host}:${mc.port}/${mc.db}`;


function runner(){

getJSON(sc.url + "/" + sc.path + "?sid=" + sc.sid + '&mode=' + sc.mode + '&pass=' + sc.pass)
  .then(function(resp) {
    console.log('\033[2J');
    console.log(`Server Uptime: ${secondsToHms(resp.streamuptime)}`)
          
    if( resp.uniquelisteners > 0 ) {
      
      console.log( `You have ${resp.uniquelisteners} unique listeners:` );
      
      var listeners = getListeners(resp);
      for( let listener of listeners){
        listener.geo = geoip.allData(listener.hostname);
        listener.connecttime = secondsToHms(listener.connecttime);
        listener.referer = listener.referer == '' ? 'DNAS' : 'HTML'

  
        console.log(listener.hostname + ' ' 
        + listener.geo.city +  ', ' + listener.geo.state + ' ' + listener.geo.code.country + ' '
        + listener.connecttime + ' ' + listener.referer + ' ' + listener.useragent
        );

        // now update the mongo table
        mongoUpdate(listener);

      }
      
    }else{
      console.log(`There are ${resp.uniquelisteners} listeners :(`  )
    }
    
    console.log(`Currently: ${resp.songtitle}`);
    
  }).catch(function(error){
    console.log(error);
  });
}

runner();

// loop it every X milliseconds 60000 = 1 minute
setInterval(runner, 60000);
  

function getListeners(d){
  return d.listeners;
}

function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);

  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  // return hDisplay + mDisplay + sDisplay; 
  return h + ":" + m + ":" + s;

}

function mongoUpdate(data){
  mongo.connect(MongoUrl, {useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
    if(err) {
       console.log(err);
       process.exit(0);
    }
    // console.log('Mongo connected!');
    var dbo = db.db('hawkwyndRadio');
    var collection = dbo.collection('listeners');

    // console.log(data);

    // do update
    try{
      collection.findOneAndUpdate(
         {"hostname" : data.hostname},
         {$set: {
             "referer" : data.referer,
             "useragent" : data.useragent,
             "hostname" : data.hostname,
             "country" : data.geo.country,
             "city" : data.geo.city,
             "state" : data.geo.state,
             "connecttime" : data.connecttime
         },
     },
     { upsert:true, returnNewDocument : true }
         
      );
  }
  catch(e){
      console.log(e);
  }
    
  db.close();

  });

}