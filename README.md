# SC-Analytics
## Setup

Edit `config.sample.json` and save it as `config.json` which contain the credentials for your shoutcast server and mongodb configuration.

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

`npm run install`
`npm run start` 

