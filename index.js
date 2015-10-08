var http = require('http');
var url = require('url');
var router = require('./router');
var port = 8801;


var config = require('./controllers/Config');
var cloudeer = require('./lib');

var app = http.createServer(function (req, res) {
    var myUrl = url.parse(req.url);
    var myPathName = myUrl.pathname;
    myPathName = myPathName.toLowerCase();
    if (myPathName == "/favicon.ico") {
        res.end();
        return;
    }


    //router.res = res;
    //router.req = req;

    //router.get("/load", config.load);
    router.get("/load-config", config.view);
    router.get("/view", config.view);
    router.post("/edit-cluster", config.editCluster);
    router.get('/register', config.register);

    var xr = require('./routers');
    router.post('/h2', xr.h2);


    router.execute(req, res);

}).listen(port, "0.0.0.0");


cloudeer.loadConfig();
cloudeer.serviceDumpConfig();
cloudeer.serviceUpgradeNode();

console.log(`Service started @ ${port}`);


