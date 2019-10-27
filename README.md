# SC-Analytics 
A Node application which monitors visitor activity, logging connections to MongoDB.

## Installation
Edit `config.sample.json` and save it as `config.json`

```{
    "shoutcast" : {
        "url": "http://yourserver.org:8000", <-- your shoutcast url
        "pass" : "yourpassword_admin",       <-- your sc admin pasword
        "mode" : "viewjson", 
        "sid" : 1,
        "path" : "admin.cgi"
    },
    "mongodb" : {
        "host" : "localhost",                <-- host of your mongo server
        "port" : "27017",                    <-- port
        "db" :  "yourdatabase",              <-- your database name
        "collection" : "listeners"           <--- you can name this collection anything you want
    }

}```

### Install dependencies
`npm run install`

# Run it
`npm run start` 

```
Server Uptime: 20:03:28
Currently playing: Steely Dan - Deacon Blues
Average Listening Time: 03:31:39
Listeners: 1
--------------

10/27/2019, 10:38:12 AM | 108.49.69.200 | Wellesley Hills, Massachusetts US | 03:31:39 | DNAS | 42.3104,-71.2741
```
