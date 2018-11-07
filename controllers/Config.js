var fs       = require('fs');
var tools    = require('../tools');
var cloudeer = require("../lib");
var share    = require('../lib/share');

module.exports = Config = {
  load           : function () {
    fs.readFile('./data/config.json', function (err, data) {
      if (err) throw err;
      cloudeer.config = JSON.parse(data);
    });
  },
  view           : function (req, res) {
    res.end(tools.webok(cloudeer.config));
  },
  viewMethods    : function (req, res) {
    res.end(tools.webok(cloudeer.methods));
  },
  editCluster    : function (req, res) {
    var form     = req.body;
    var env      = form.env || "dev";
    var name     = form.name;
    var services = form.services;

    if (!name) {
      res.end(tools.error(-400, "需要参数 name。"));
      return;
    }
    if (!services) {
      res.end(tools.error(-400, "需要参数 services。"));
      return;
    }

    var arServices = services.split(",");

    if (!cloudeer.config.hasOwnProperty(env)) {
      cloudeer.config[env] = {};
    }
    cloudeer.config[env][name] = arServices;

    res.end(tools.webok(cloudeer.config, 'done'));

  },
  //注册服务
  register       : function (req, res) {
    var qs      = req.query;
    var host    = qs.host;
    var port    = qs.port;
    var name    = qs.name;
    var baseUri = qs.baseUri || "";

    port = parseInt(port);

    if (!name) {
      res.end(tools.error(-400, "需要参数 name。"));
      return;
    }
    if (!host) {
      res.end(tools.error(-400, "需要参数 host。"));
      return;
    }
    if (!port) {
      res.end(tools.error(-400, "需要参数 port。"));
      return;
    }


    if (!cloudeer.config.hasOwnProperty(name)) {
      cloudeer.config[name] = {};
    }
    if (!cloudeer.config[name].hasOwnProperty("hosts")) {
      cloudeer.config[name]["hosts"] = [];
    }

    var hosts = cloudeer.config[name]["hosts"];

    var hasThisHost = false;
    for (var h of hosts) {
      if (h.host === host && h.port === port && h.baseUri === baseUri) {
        hasThisHost = true;
        h.update    = new Date() * 1;
        break;
      }
    }
    if (!hasThisHost) {
      var xhost = {host: host, port: port, baseUri: baseUri, update: new Date() * 1};
      share.log(`New node is coming: ${name} - ${xhost.host}:${xhost.port}`);
      hosts.push(xhost);
      cloudeer.configChanged = true;
      res.end(tools.webok("Ok, client added to the config node."));
    } else {
      res.end(tools.webok("Ok, client updated."));
    }

    //req.on("close", function () {
    //    console.log("A client closed, removing this node...");
    //    cloudeer.config[name]["hosts"] = hosts.filter(function (ele) {
    //        return ele.host != host || ele.port != port || ele.baseUri != baseUri;
    //    });
    //    res.write("Done, client removed.");
    //});

  },
  //上传方法
  registerMethods: function (req, res) {
    var form = req.body;
    // console.log(form);
    if (!form.hasOwnProperty('service')) {
      res.end(tools.error(-400, "JSON 数据中需要参数 service。"));
      return;
    }
    if (!form.hasOwnProperty('methods')) {
      res.end(tools.error(-400, "JSON 数据中需要参数 methods。"));
      return;
    }

    var whichOne = -1;
    cloudeer.methods.filter(function (ele, index) {
      if (ele.service.toLocaleLowerCase() == form.service.toLowerCase()) {
        whichOne = index;
        return true;
      }
    });
    // var thisGroup;
    // if (thisGroup && thisGroup.length > 0) {
    //   thisGroup = thisGroups[0];
    // }
    // console.log(whichOne);
    if (whichOne >= 0) {
      cloudeer.methods.splice(whichOne, 1);
    }

    cloudeer.methods.push(form);
    cloudeer.methodsChanged = true;

    res.end(tools.webok(""));
  }


};