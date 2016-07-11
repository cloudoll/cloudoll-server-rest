var program = require('commander');

program
  .version('0.0.1')
  .option('-p, --port [type]', 'Server port')
  .parse(process.argv);


var port = program.port || 8801;

//--------------------------

var http   = require('http');
var url    = require('url');
var router = require('./router');
//var port = 8801;


var config   = require('./controllers/Config');
var cloudeer = require('./lib');

var app = http.createServer(function (req, res) {
  var myUrl      = url.parse(req.url);
  var myPathName = myUrl.pathname;
  myPathName     = myPathName.toLowerCase();
  if (myPathName == "/favicon.ico") {
    res.end();
    return;
  }

  router.get("/load-config", config.view);
  router.get("/view", config.view);
  router.post("/edit-cluster", config.editCluster);
  router.get('/register', config.register);
  router.post('/register/methods', config.registerMethods);
  router.get("/methods", config.viewMethods);



  router.execute(req, res);

}).listen(port, "0.0.0.0");


cloudeer.loadConfig();
cloudeer.loadMethods();
cloudeer.serviceDumpConfig();
cloudeer.serviceUpgradeNode();
cloudeer.serviceDumpMethods();

console.log(`Service started @ ${port}`);


