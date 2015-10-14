var share = require("./share");
var fs = require('fs');
var querystring = require("querystring");
var path = require('path');
var request = require('request');

var cloudeer = {
    config: {},
    configChanged: false,
    loadConfig: function () {
        fs.exists('./data/config.json', function (exists) {
            if (!exists) {
                console.log("Creating config file './data/config.json' ...");

                fs.writeFile('./data/config.json', JSON.stringify({}), function (err) {
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
    loadConfigRemote: function (cloudeerHost) {
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
    saveConfig: function () {
        fs.writeFile('./data/config.json', JSON.stringify(cloudeer.config, null, "\t"), function (err) {
            if (err) throw err;
        });
    },
    serviceDumpConfig: function () {
        console.log('Auto dump config service started..');
        setInterval(function () {
            if (cloudeer.configChanged) {
                share.log('Config is changed, save config...');
                cloudeer.saveConfig();
                cloudeer.configChanged = false;
            }
        }, 10000);
    },
    serviceUpgradeNode: function () {
        console.log('Auto upgrade node service started..');

        setTimeout(function () {
            setInterval(function () {
                for (var k in cloudeer.config) {
                    var hosts = cloudeer.config[k].hosts;
                    var len = hosts.length;
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
    invokeCo: function (httpMethod, serviceName, methodUri, parameters) {
        return function (callback) {
            cloudeer.invoke(httpMethod, serviceName, methodUri, parameters, callback);
        };
    },
    invoke: function (httpMethod, serviceName, methodUri, parameters, callback) {
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
        var hostsLen = myHosts.length;
        var pickIndex = share.randomInt(hostsLen);
        var host = myHosts[pickIndex];

        var accessUrl = `http://${host.host}:${host.port}` + (host.baseUri || "") + methodUri;
        //console.log(`${httpMethod} ${accessUrl} ...`);
        if (httpMethod == "GET") {
            if (parameters) {
                var query = querystring.stringify(parameters);
                if (accessUrl.indexOf("?") > 0) {
                    accessUrl = accessUrl + "&" + query;
                } else {
                    accessUrl = accessUrl + "?" + query;
                }
            }

            request(accessUrl, function (error, response, body) {
                if (error) {
                    callback(error);
                    return;
                }
                var sCode = response.statusCode;

                if (sCode >= 200 && sCode < 300) {
                    callback(null, body);
                }
                else if (sCode == 408) {
                    share.log('Timeout, Remove current node and retry..');
                    myHosts.splice(pickIndex, 1); //移除节点后重试
                    cloudeer.invoke(httpMethod, serviceName, methodUri, parameters, callback);
                } else {
                    callback(share.error(-sCode, body));
                }
                callback(error, body);

            });
        } else if (httpMethod == "POST") {
            request(accessUrl, parameters, function (error, response, body) {
                if (error) {
                    callback(error);
                    return;
                }
                var sCode = response.statusCode;
                if (sCode >= 200 && sCode < 300) {
                    callback(null, body);
                }
                else if (sCode == 408) {
                    share.log('Timeout, Remove current node and retry..');
                    myHosts.splice(pickIndex, 1); //移除节点后重试
                    cloudeer.invoke(httpMethod, serviceName, methodUri, parameters, callback);
                } else {
                    callback(share.error(-sCode, body));
                }
                callback(error, body);
            });
        }
    }
};

module.exports = cloudeer;
