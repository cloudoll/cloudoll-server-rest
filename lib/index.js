var share = require("./share");
var url = require("url");
var fs = require('fs');
var querystring = require("querystring");

var cloudeer = {
    config: {},
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
        console.log('Loading config from remote...');
        share.getUrl(url.resolve(cloudeerHost, "/load-config"), function (err, res) {
            //console.log(JSON.parse(res).data);
            cloudeer.config = JSON.parse(res).data;
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
            console.log('Auto dump config.');
            cloudeer.saveConfig();
        }, 20000);
    },
    serviceUpgradeNode: function () {
        console.log('Auto upgrade node service started..');

        setTimeout(function () {
            setInterval(function () {
                for (var k in cloudeer.config) {
                    var hosts = cloudeer.config[k].hosts;
                    var len = hosts.length;
                    var forRemovedIndex = [];
                    for (var i = 0; i < len; i++) {
                        var xhost = hosts[i];
                        var tDiff = new Date() * 1 - xhost.update;
                        if (tDiff > 10000) {
                            console.log(`10 秒内未见心跳。即将移除 ${k},  ${JSON.stringify(xhost) }`);
                            forRemovedIndex.push(i);

                        }
                    }
                    var forRemovedIndex2 = forRemovedIndex.reverse();
                    for (var j of forRemovedIndex2) {
                        hosts.splice(j, 1);
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
            throw share.error(-404, "需要参数 serviceName。");
        }
        if (!cloudeer.config.hasOwnProperty(serviceName)) {
            throw share.error(-500, "这个服务的名称没有注册。");
        }
        var myHosts = cloudeer.config[serviceName].hosts;
        if (!myHosts || myHosts.length == 0) {
            throw share.error(-500, "当前服务中没有可用服务器。");
        }
        var hostsLen = myHosts.length;
        var pickIndex = share.randomInt(hostsLen);
        var host = myHosts[pickIndex];

        var accessUrl = url.resolve(`http://${host.host}:${host.port}`, host.baseUri);
        accessUrl = accessUrl + methodUri;
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

            share.getUrl(accessUrl, function (err, body) {
                if (err) {
                    console.log(new Date(), ' ------------------------');
                    console.log(`${httpMethod} ${accessUrl} ...`);
                    var jError = JSON.parse(err);
                    if (jError.errno == -408) {
                        //timeout
                        console.log('Remove the timeout node..');
                        myHosts.splice(pickIndex, 1);
                        cloudeer.invoke(httpMethod, serviceName, methodUri, parameters, callback);

                    } else {
                        console.log('Service error, invoke again.');
                        cloudeer.invoke(httpMethod, serviceName, methodUri, parameters, callback);
                    }
                } else {
                    callback(err, body);
                }
            });
        } else if (httpMethod == "POST") {
            share.postJson(accessUrl, parameters, function (err, body) {
                if (err) {
                    console.log(new Date(), ' ------------------------');
                    console.log(`${httpMethod} ${accessUrl} ...`);
                    console.log(parameters);
                    var jError = JSON.parse(err);
                    if (jError.errno == -408) {
                        //timeout
                        console.log('Remove the timeout node..');
                        myHosts.splice(pickIndex, 1);
                        cloudeer.invoke(httpMethod, serviceName, methodUri, parameters, callback);

                    } else {
                        console.log('Service error, invoke again.');
                        cloudeer.invoke(httpMethod, serviceName, methodUri, parameters, callback);
                    }
                } else {
                    callback(err, body);
                }
            });
        }
    }
};

module.exports = cloudeer;
