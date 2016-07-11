var http = require('http');

var postUrl = function (url, data, callback) {

  var jUrl = require('url').parse(url);

  var querystring = require("querystring");

  var postData = querystring.stringify(data);

  var options = {
    hostname: jUrl.hostname,
    port    : jUrl.port,
    path    : jUrl.path,
    method  : 'POST',
    headers : {
      'Content-Type'  : 'application/x-www-form-urlencoded',
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


var cloudeer = require('./lib/index');


// //----- Service Test ------
// var service = 'beatles.pdm';
// var cloudeer = require('./lib');
//
var cloudeerHost = "http://127.0.0.1:8801";


cloudeer.loadConfigRemote(cloudeerHost);

// setInterval(function () {
//     cloudeer.loadConfigRemote(cloudeerHost);
// }, 10000);
//
//

// setTimeout(function () {
//   console.log(cloudeer.config);
//   cloudeer.invoke("GET", "cloudarling", "/admin/services", {}, function (err, data) {
//     console.log(err, data);
//   });
// }, 100);

// var testData = {
//   service: "goods",
//   methods: [
//     {url: "/admin/1", name: '管理A', method: "POST", open: true},
//     {url: "/admin/2", name: '管理A', method: "GET"},
//     {url: "/admin/c", name: '管理A', method: "GET"},
//     {url: "/admin/d", name: '管理A', method: "GET"},
//     {url: "/admin/e", name: '管理A', method: "POST", open: true}
//   ]
// };
//
// var testData2 = {
//   service: "goods2",
//   methods: [
//     {url: "/admin/accc", name: '管理A', method: "POST", open: true},
//     {url: "/admin/bdddd", name: '管理A', method: "GET"},
//   ]
// };
//
// var request = require('request');
// request.post({url: 'http://127.0.0.1:8801/register/methods', json:testData}, function (error, response, body) {
//   console.log(body);
// });

// var x = [1, 2, 3, 4];
//
// var i = -1;
//
// x.filter(function (ele, index) {
//   if (ele == 3) {
//     i = index;
//     return true;
//   }
// });
// console.log(i);

// postUrl("http://localhost:3000/order/save", {
//   "consignee_email" : "ysjjovo@163.com",
//   "consignee_mobile": "1"
// }, function (err, data) {
//   console.log(data);
// });

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


//
// setTimeout(function () {
//     setInterval(function () {
//         try {
//             //cloudeer.invoke('GET', service, '/pinyinKey', {query: "mem dsaf eme"}, function (err, body) {
//             //    if (err) console.log('from client', err);
//             //    //else console.log(body);
//             //});
//             cloudeer.invoke('GET', service, '/product', {id: "100"}, function (err, body) {
//                 if (err) console.log('from client', err);
//                 else console.log("from body: ", body);
//             });
//         } catch (e) {
//             console.log(e);
//             //console.trace();
//         }
//     }, 4000);
//
// }, 1000);


process.env.YYY = "i have a big";

console.log(process.env.ZSH);

setTimeout(function () {
  console.log(100);
}, 5000);