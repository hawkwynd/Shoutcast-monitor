const getJSON             = require('get-json');
const prettyMilliseconds  = require('pretty-ms');
const geoip               = require('geo-from-ip')
const config              = require('./config.json');
const mysql               = require('mysql');
const moment              = require('moment');
var _                     = require('lodash'); // used in diff of arrays
const db                  = config.mysql;
const con                 = mysql.createConnection( db );
const sc                  = config.shoutcast; 
const dt                  = new Date();
const rightNow            = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

// new ip lookup
// var IPGeolocationAPI      = require('ip-geolocation-api-javascript-sdk');
// var ipgeolocationApi = new IPGeolocationAPI("a6ace50db3b64d0687a9403fffbfc99f", false); 
// var GeolocationParams = require('ip-geolocation-api-javascript-sdk/GeolocationParams.js');


con.connect();

function runner(){

    const hostnames           = [];
    const inserts             = [];

  getJSON(sc.url + "/" + sc.path + "?sid=" + sc.sid + '&mode=' + sc.mode + '&pass=' + sc.pass)
  .then( function( resp ) {
    
    let server      = Object.assign({}, resp); // clone resp so we don't kill the object when deleting listener and songs
    var serverStat  = getserverStats(server);
    var splitted    = resp.songtitle.split('-')
    var np_artist   = splitted[0].trim()
    var np_title    = splitted[1].trim()

// query for last song since cycle
getCurrentSong( function( s ) {              
    
    // fix /'s slashes in title
    s = s.replace(/\\/gi, "");

    
    if( resp.songtitle !== s ){
        
        console.log('*** SONG CHANGE DETECTED !!! ***')
        console.log( s + " vs " + resp.songtitle )

        updateCurSong( resp.songtitle );

        // Dont bother doing any of the following if its a jingle.
        if( np_artist.toLowerCase() != 'hawkwynd radio'){

            lookupArtist( np_artist,( a )=>{
                    
                if( a ){
                    getRecording( a.discogs_id, np_title, ( plays ) => {                                
                        if( plays ){
                            updatePlays( plays.plays, plays.title, plays.artist_id, plays.release_id, ( playcount ) => {
                                console.log( plays.title + ' play count updated successfully from '+plays.plays+' to ' + playcount )
                            })
                        } else { 

                            console.log('No plays found in recording table, so we didnt update play counter.')
                        }
                    } )
                } else { 
                    console.log('Did not find anything in Artist lookup.')
                }
            })
        }
    }
});

function updatePlays( plays, title, aid, rid, callback ){

    var playcount   = plays + 1;
    let updateQuery = `UPDATE recording SET plays=? WHERE title=? AND artist_id=? AND release_id=?`;
    let data        = [ playcount, title, aid, rid ];

    q = con.query( updateQuery, data, (error, result, fields) => {           
    // console.log( 'updatePlays : ' + q.sql )

    if (error){   
        callback(console.error( error.message ) );
    }       
        callback( playcount )
    })
}

    
    function getCurrentSong( callback ){
        
        var getSongDB = "select * from nowplaying limit 1";

        q = con.query(getSongDB, (error, objRow )=> {           

            if (error){   
                callback( console.error( error.message ) );
              }  

            for( let row of objRow){                      
                 dbSong = row.cursong;
            }
            callback ( dbSong )
        })
    }

    // get artistID from artist table by name
    function lookupArtist( artist ,callback ){
        var aID = 0;
        var lookupQuery = "Select * from artist where name= ? LIMIT 1";             
        var data        = [artist]

       q = con.query(lookupQuery, data, (error, result ) => {
        //    console.log( 'lookupArtist: ' + q.sql )

            if (error){   
                callback(console.error( error.message ) );
              }  

            for(let row of result){            
                artist = row
            }           
            
            callback( artist )           
        })
    }



    // increment plays matching artistID and title in recording table
    function getRecording( artistID, title, callback){
        
        var sqlQuery = 'SELECT * FROM recording where title=? AND artist_id=? LIMIT 1'
        var data = [ title, artistID ]
        
        var q = con.query(sqlQuery, data, (error, recordingResult ) => {
            
            // console.log('getRecording executed : ' + q.sql )

            if (error){   
                
                callback(console.error( error.message ) );
              }  

            for(let row of recordingResult ){
               var plays = row

            }
            // console.log( title + ' is showing ' + plays.plays + ' play count.')

            callback( plays )
            
        });
       
    }

    console.log('\033[2J'); // clear console    
    console.log('* * FLOYD by Scott Fleming 2020 v1.4 * *')
    console.log(`Server Uptime: ${secondsToHms(resp.streamuptime)}` );
    console.log(`Currently playing: ${resp.songtitle}`);
    
    // Got milk? Then spill it!
    if( resp.uniquelisteners > 0 ) {
      
      console.log(`Average Listening Time: ${secondsToHms(serverStat.averagetime)}`);
      console.log( `Unique Listeners: ${resp.uniquelisteners}` );
      console.log( `-------------------------------\n`);     
      
      var listeners = getListeners( resp );
     

      for(  listener of listeners ){
          
        // console.log( checkExisting(listener.hostname ));


          hostnames.push( listener.hostname) ; // build array of hostnames
        
          listener.geo          = geoip.allData( listener.hostname );                      

          listener.connecttime  = secondsToHms( listener.connecttime );           
          listener.referer      = listener.referer == '' ? 'DNAS' : 'HTML'
          listener.timestamp    = new Date(Date.now()).toISOString();
                  
          console.log( listener.hostname + ' | ' 
          + listener.geo.city +  ', ' + listener.geo.code.state + ' ' + listener.geo.code.country + ' | '
          + listener.connecttime + ' | ' + listener.referer 
          );
          

        //   console.log( listener )

          // now update mysql with the listener data
          insertMysql( listener );   
          // Display listener info line

        }
        
        
        // compare and update hostnames with DB of status=1
        // console.log( hostnames )
        fetchActive( hostnames, compareAndUpdate );
       
    }else{

      console.log( `${resp.uniquelisteners} listeners :(`  );
      resetStatus();           
      
    }
    
    
  }).catch(function(error){
    console.log(error);
  });


} // runner()

runner();

// loop it every X milliseconds 5000 = 5 secs
setInterval(runner, 20000 );
  


// --------- FUNCTION FUNCTION, WHAT'S YOUR FUNCTION?? ------------

 /**
   * 
   * @param {*} listener 
   * @description lookup hostname in listener table for match
   * @return array of values
   * {
  hostname: '92.209.21.241',
  useragent: 'WinampMPEG/5.50',
  connecttime: '00:06:52',
  uid: 10157,
  type: 17,
  referer: 'DNAS',
  xff: '',
  grid: 10157,
  triggers: 0,
  geo: {
    code: { state: 'NW', country: 'DE', continent: 'EU' },
    city: 'Hagen',
    state: 'North Rhine-Westphalia',
    country: 'Germany',
    continent: 'Europe',
    postal: '58089',
    location: {
      accuracy_radius: 100,
      latitude: 51.3801,
      longitude: 7.4394,
      time_zone: 'Europe/Berlin'
    }
  },
  timestamp: '2020-09-07T15:29:23.973Z'
}
   * 
   * 
   */
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


function compareAndUpdate( hostnames, data ){
      
    // console.log( data )
    uniqueHostnames = hostnames.filter(function(elem, pos) {
        return hostnames.indexOf(elem) == pos;
    })
    
    var activehostsdatabse  = [];
    var disconnectTime      = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        
    for (let active of data){       
        activehostsdatabse.push(active.hostname);
    }
 
    var inactive_hosts = arr_diff( activehostsdatabse, uniqueHostnames );

    

    if( inactive_hosts.length > 0 ){

        console.log( 'Disconnect detected! ')
           
        // iterate inactive_hosts and update
        for( let inactive of inactive_hosts ){
            
            // console.log( inactive + ' disconnected at '+ disconnectTime )

            var rem = "update listeners set status = 0, disconnect = '" + disconnectTime + "' where hostname = '" + inactive + "'";
            
            con.query(rem, function(err, result){
                if(err) throw err;
            })
        }

    }
}

// compare differnce of two arrays, return differnece.
function arr_diff (a1, a2) {

    var a = [], diff = [];

    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }

    return diff;
}

// Update the current song playing in the nowplaying table
function updateCurSong( song  ){
        
    var sql="INSERT INTO `nowplaying` (id, cursong) VALUES ( 1,? ) ON DUPLICATE KEY UPDATE cursong=VALUES(cursong)";
    var data = [ mysql_real_escape_string(song)]

    con.query(sql, data, (error, result) => {
        if (error){   
            console.error( error.message );
        }          
        console.log( 'NowPlaying UPDATE : ' + song )
    })       
}


// get the hostnames of the tables status=1
function fetchActive( connected, callback ){

    var myQ = "SELECT hostname FROM listeners where status = 1 "

    con.query( myQ,(err, result) => {
        
        if( err ) {
            console.error(err.message )
        }
        
        callback( connected, result);
    });
}

// We have no listeners, so update listeners table
// so all connections are status 0 where status = 1

function resetStatus( ){

    var disconnectTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

    // set status to 0 and disconnect time for all listeners who have a status of 1, but are now gone.
    // because we have no listeners connected. 

    var resetSQL = "UPDATE listeners SET status='0', disconnect=? WHERE status=? ";    
    var data = [ disconnectTime, 1 ]

    q = con.query( resetSQL, data, ( error, result ) => {      
        
        // console.log('disconnectTime executed : ' + q.sql )

        if (error){   
            console.error( error.message );
        }


    });

}
/**
 * 
 * @param {*} listener 
 * @version 1.0 
 * @description insert listener data into listener table
 */

function insertMysql( listener  ){
   
      var city      = listener.geo.city !==  null ? mysql_real_escape_string( listener.geo.city ) : 'unknown';
      var state     = listener.geo.state !== null ? mysql_real_escape_string( listener.geo.state ) : 'unknown';
      var rightNow  = moment( Date.now()).format('YYYY-MM-DD HH:mm:ss' );
      var useragent = mysql_real_escape_string( listener.useragent );
      var status    = 1;
      var connections = 1;

      var values = [listener.hostname, rightNow, city, rightNow, listener.connecttime, listener.geo.code.country, listener.geo.location.latitude, listener.geo.location.longitude,listener.referer, state, useragent, status, connections, rightNow, listener.connecttime, '0000-00-00 00:00:00', 1 ]
     
      var newSql = "INSERT INTO listeners ( hostname, timestamp, city, first_connect, connecttime, country, lat, lng, referer, state, useragent, status, connections ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE timestamp=?, connecttime=?, disconnect=?, status=?";

      q = con.query( newSql, values, (error, result )=>{

             if(error){
                 console.log( q.sql )
                 console.error( 'line 397 ' + error.message )
                 
             }
             
         })   
  }


function mysql_real_escape_string (str) {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
      switch (char) {
          case "\0":
              return "\\0";
          case "\x08":
              return "\\b";
          case "\x09":
              return "\\t";
          case "\x1a":
              return "\\z";
          case "\n":
              return "\\n";
          case "\r":
              return "\\r";
          case "\"":
          case "'":
          case "\\":
          case "%":
              return "\\"+char; // prepends a backslash to backslash, percent,
                                // and double/single quotes
          default:
              return char;
      }
  });
}

function getListeners(d){ 

    return d.listeners;
    
 }

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

