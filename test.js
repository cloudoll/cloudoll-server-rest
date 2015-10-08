var http = require('http');

var postUrl = function (url, data, callback) {

    var jUrl = require('url').parse(url);

    var querystring = require("querystring");

    var postData = querystring.stringify(data);

    var options = {
        hostname: jUrl.hostname,
        port: jUrl.port,
        path: jUrl.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    var req = http.request(options, function (res) {

        var statusCode = res.statusCode;

        res.setEncoding('utf8');
        var body = "";
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            if (statusCode == 200)
                callback(null, body);
            else
                callback(new Error("服务器未返回200，消息：" + body));
        })
    });

    req.on('error', function (e) {
        callback(e);
    });

    req.write(postData);
    req.end();

};

var getUrl = function (url, callback) {
    http.get(url, function (res) {
        var statusCode = res.statusCode;

        res.setEncoding('utf8');
        var body = "";
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            if (statusCode == 200)
                callback(null, body);
            else
                callback(new Error("服务器未返回200，消息：" + body));
        })
    });
};

//postUrl("http://localhost:8801/h2?aa=11&b-b=321", {"a-c":1, b:2}, function (err, data) {
//    console.log(data);
//});

//postUrl("http://localhost:8801/edit-cluster", {name: 'passport',env:'prod',
//    services:'http://localhost:7201,http://localhost:7202,http://localhost:7203,'}, function (err, data) {
//    console.log(data);
//});

//var cloudeer = require('./lib');
//cloudeer.loadConfig();
//setTimeout(function(){
//    cloudeer.invoke('order');
//    cloudeer.invoke('cibn');
//}, 100);


//----- Service Test ------
var service = 'cibn';
var cloudeer = require('./lib');

var cloudeerHost = "http://10.163.57.110:8801";


cloudeer.loadConfigRemote(cloudeerHost);

setInterval(function () {
    cloudeer.loadConfigRemote(cloudeerHost);
}, 10000);

setTimeout(function () {
    setInterval(function () {
        try {
            //cloudeer.invoke('GET', service, '/pinyinKey', {query: "mem dsaf eme"}, function (err, body) {
            //    if (err) console.log('from client', err);
            //    //else console.log(body);
            //});
            cloudeer.invoke('POST', service, '/test', {id: "100"}, function (err, body) {
                if (err) console.log('from client', err);
                else console.log(body);
            });
        } catch (e) {
            console.trace();
        }
    }, 800);

}, 100);


