# SC-Analytics - Shoutcast-Server-Monitor
A Node application which monitors visitor activity, logging connections to MongoDB.
You'll need a shoutcast server running with access to the admin.cgi pages. I run sc_serv on an AWS micro instance running Ubuntu. 

## Overview/Psuedocode
- Call to shoucast server admin returns json payload of the following:
- Display server uptime in console log and current song playing (artist - title)
- Geo location for city,state,country and lat/lng of IP address of visitor. 
- Capture connecttion time of visitor, as well as referer and useragent. 
- If listeners, display console log of total listerner count, then list the visitors data in a list.
- Update/Insert data into listeners table of MongoDB (for v2 reporting functions and analytics)
- Repeat every 30 seconds.


## Installation
Edit `config.sample.json` and save it as `config.json`

```json
{
    "shoutcast" : {
        "url": "http://yourserver.org:8000", <-- your shoutcast ip address and port
        "pass" : "yourpassword_admin",       <-- your sc admin pasword
        "mode" : "viewjson", 
        "sid" : 1,
        "path" : "admin.cgi"
    },
    "mongodb" : {
        "host" : "localhost",                <-- host of your mongo server
        "port" : "27017",                    <-- port
        "db" :  "yourdatabase",              <-- your database name
        "collection" : "listeners"           <-- name this collection anything you want
    }
}
```

### Install the packages and dependencies
`npm run install`

### Run it
`npm run start` 

# Console log report
```
Server Uptime: 20:03:28
Currently playing: Steely Dan - Deacon Blues
Average Listening Time: 03:31:39
Listeners: 1
10/27/2019, 10:38:12 AM|108.49.69.200|Wellesley Hills, Massachusetts US|03:31:39| DNAS|42.3104,-71.2741
```

# Output Explanation    
Datetime | IP Address | City, State Country | Connect time | Referer | Geo location (Maps lookup)

# Mongo fields
```json
{
    "timestamp" : data.timestamp,
    "referer"   : data.referer,
    "useragent" : data.useragent,
    "hostname"  : data.hostname,
    "lat"       : data.geo.location.latitude,
    "lng"       : data.geo.location.longitude,
    "country"   : data.geo.country,
    "city"      : data.geo.city,
    "state"     : data.geo.state,
    "connecttime" : data.connecttime
}
```

# Dependencies
```json
"dependencies": {
    "cli": "^1.0.1",
    "geo-from-ip": "^1.2.2",
    "get-json": "^1.0.1",
    "lodash": "^4.17.15",
    "lodash.merge": "^4.6.2",
    "minimatch": "^3.0.4",
    "moment": "^2.24.0",
    "mongodb": "^3.3.3",
    "nodemon": "^1.19.4",
    "pretty-ms": "^5.0.0"
  }
  ```


Inspiration for this project from [codeforgeek.com](https://codeforgeek.com/node-mongodb-tutorial/).

## TO-DO
- [ ] Web console dashboard
- [ ] Reporting / Analytics functions for queries
- [ ] Shoutcast Administration functions (kick/ban/reserve)
- [ ] Multiple stream monitoring
- [ ] Pretty stuff.

Scott Fleming

[hawkwynd@gmail.com](mailto:hawkwynd@gmail.com)

Hawkwynd Radio - Live broadcasts Friday nights 9pm CST 24/7 Classic Rock & Excellent Music

[http://stream.hawkwynd.com](http://stream.hawkwynd.com)