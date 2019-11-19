// Shoutcast analytics report

const mongo = require('mongodb');
const config = require('./config.json');
const mc = config.mongodb;
const MongoUrl = `mongodb://${mc.host}:${mc.port}/${mc.db}`;
const myCollection = mc.collection;
const database = mc.db;

let output = queryMongo();

function queryMongo(){

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
      var country=[];

        collection.find().each(function(err, doc) {
            if(err) console.log(err);
            //called once for each doc returned
    
            console.log(doc)
            console.log(`-------------`)

              
            });
            
           


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