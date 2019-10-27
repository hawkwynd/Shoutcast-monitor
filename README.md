# SC-Analytics - Shoutcast-Server-Monitor
A Node application which monitors visitor activity, logging connections to MongoDB.
You'll need a shoutcast server running with access to the admin.cgi pages. I run sc_serv on an AWS micro instance running Ubuntu. 

## Installation
Edit `config.sample.json` and save it as `config.json`

```
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
10/27/2019, 10:38:12 AM | 108.49.69.200 | Wellesley Hills, Massachusetts US | 03:31:39 | DNAS | 42.3104,-71.2741
```

# Output Explanation
Datetime | IP Address | City, State Country | Connect time | Referer | Geo location (Maps lookup)

# MongoDb captures the fields, and updates on the IP address as key.
The next version coming will include a web based dashboard, with exporting to a csv file.

# Mongo fields
```
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
