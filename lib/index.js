var share       = require("./share");
var fs          = require('fs');
var querystring = require("querystring");
var path        = require('path');
var request     = require('request');

var nodeEnv = process.env.NODE_ENV || "development";

var cloudeer = {
  config            : {},
  methods           : [],
  configChanged     : false,
  methodsChanged    : false,
  loadConfig        : function () {
    fs.exists('./data/config.json', function (exists) {
      if (!exists) {
        console.log("Creating config file './data/config.json' ...");

        fs.writeFile('./data/config.json', "{}", function (err) {
          console.log('Init done!');
        });
      } else {
        console.log("Loading config file './data/config.json' ...");
        fs.readFile('./data/config.json', function (err, data) {
          cloudeer.config = JSON.parse(data);
        });
      }
    });
  },
  loadMethods       : function () {
    fs.exists('./data/methods.json', function (exists) {
      if (!exists) {
        console.log("Creating config file './data/methods.json' ...");

        fs.writeFile('./data/methods.json', "[]", function (err) {
          console.log('Init done!');
        });
      } else {
        console.log("Loading config file './data/methods.json' ...");
        fs.readFile('./data/methods.json', function (err, data) {
          cloudeer.methods = JSON.parse(data);
        });
      }
    });
  },
  loadConfigRemote  : function (cloudeerHost) {
    //console.log('Loading config from remote...');
    //var rUrl = path.join(cloudeerHost, "/load-config");
    var rUrl = cloudeerHost + "/load-config";

    //return;
    request(rUrl, function (err, res, body) {
      if (err) {
        share.log(err.message);
        return;
      }
      if (res.statusCode == 200) {
        cloudeer.config = JSON.parse(body).data;
      }
      //console.log(JSON.parse(res).data);
    });
  },
  saveConfig        : function () {
    fs.writeFile('./data/config.json', JSON.stringify(cloudeer.config, null, "\t"), function (err) {
      if (err) throw err;
    });
  },
  serviceDumpConfig : function () {
    console.log('Auto dump config service started..');
    setInterval(function () {
      if (cloudeer.configChanged) {
        share.log('Config is changed, save config...');
        cloudeer.saveConfig();
        cloudeer.configChanged = false;
      }
    }, 10000);
  },
  serviceDumpMethods: function () {
    console.log('Auto dump methods service started..');
    setInterval(function () {
      if (cloudeer.methodsChanged) {
        share.log('Methods is changed, save methods...');
        fs.writeFile('./data/methods.json', JSON.stringify(cloudeer.methods, null, "\t"), function (err) {
          if (err) throw err;
        });
        cloudeer.methodsChanged = false;
      }
    }, 10000);
  },
  serviceUpgradeNode: function () {
    console.log('Auto upgrade node service started..');

    setTimeout(function () {
      setInterval(function () {
        for (var k in cloudeer.config) {
          var hosts = cloudeer.config[k].hosts;
          var len   = hosts.length;
          if (len >= 0) {
            var forRemovedIndex = [];
            for (var i = 0; i < len; i++) {
              var xhost = hosts[i];
              var tDiff = new Date() * 1 - xhost.update;
              if (tDiff > 10000) {
                share.log(`10 秒内未见心跳。即将移除 ${k} - ${xhost.host}:${xhost.port}`);
                forRemovedIndex.push(i);
                cloudeer.configChanged = true;
              }
            }
            var forRemovedIndex2 = forRemovedIndex.reverse();
            for (var j of forRemovedIndex2) {
              hosts.splice(j, 1);
              if (hosts.length == 0) {
                delete cloudeer.config[k];
              }
            }
          }
        }

      }, 10000);


    }, 1000);

  },
  invokeCo          : function (httpMethod, serviceName, methodUri, parameters) {
    return function (callback) {
      cloudeer.invoke(httpMethod, serviceName, methodUri, parameters, callback);
    };
  },
  invoke            : function (httpMethod, serviceName, methodUri, parameters, callback) {
    httpMethod = httpMethod || "GET";
    httpMethod = httpMethod.toUpperCase();

    if (!serviceName) {
      callback(share.error(-404, "需要参数 serviceName。"));
      return;
    }
    if (!cloudeer.config.hasOwnProperty(serviceName)) {
      callback(share.error(-500, "这个服务的名称没有注册: " + serviceName));
      return;
    }
    var myHosts = cloudeer.config[serviceName].hosts;
    if (!myHosts || myHosts.length == 0) {
      callback(share.error(-500, "当前服务中没有可用服务器: " + serviceName));
      return;
    }
    var hostsLen  = myHosts.length;
    var pickIndex = share.randomInt(hostsLen);
    var host      = myHosts[pickIndex];

    var accessUrl = `http://${host.host}:${host.port}` + (host.baseUri || "") + methodUri;
    //console.log(`${httpMethod} ${accessUrl} ...`);
    if (httpMethod == "GET") {
      if (parameters) {
        var query = parameters;
        if (typeof parameters === "object") {
          query = querystring.stringify(parameters);
        }
        if (accessUrl.indexOf("?") > 0) {
          accessUrl = accessUrl + "&" + query;
        } else {
          accessUrl = accessUrl + "?" + query;
        }
      }
      if (nodeEnv != "product") {
        console.log(accessUrl);
      }

      request(accessUrl, function (error, response, body) {
        if (error) {
          callback(error);
          return;
        }
        var sCode = response.statusCode;

        if (sCode >= 200 && sCode < 300) {
          share.wrapBody(callback, body);
          // callback(null, body);
        } else if (sCode == 408) {
          share.log('Timeout, Remove current node and retry..');
          myHosts.splice(pickIndex, 1); //移除节点后重试
          cloudeer.invoke(httpMethod, serviceName, methodUri, parameters, callback);
        } else if (sCode == 404) {
          callback(share.error(-404, "The api method not found."));
        } else {
          callback(share.error(-sCode, body));
        }
        // callback(error, body);

      });
    } else if (httpMethod == "POST") {
      if (nodeEnv != "product") {
        console.log("-------- Cloudeer -------");
        console.log("Cloudeer POST: ", accessUrl);
        console.log("Parameter: ", parameters);
      }
      request.post({
        url : accessUrl,
        json: parameters
      }, function (error, response, body) {
        console.log("response error:", error);
        console.log("response body: ", body);
        if (error) {
          callback(error);
          return;
        }
        var sCode = response.statusCode;
        if (sCode >= 200 && sCode < 300) {
          share.wrapBody(callback, body);
          // callback(null, body);
        } else if (sCode == 408) {
          share.log('Timeout, Remove current node and retry..');
          myHosts.splice(pickIndex, 1); //移除节点后重试
          cloudeer.invoke(httpMethod, serviceName, methodUri, parameters, callback);
        } else if (sCode == 404) {
          callback(share.error(-404, "The api method not found."));
        } else {
          callback(share.error(-sCode, body));
        }
        // callback(error, body);
      });
    }
  }
};

module.exports = cloudeer;
