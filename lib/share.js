var http = require('http');

var share = {
    error: function (errno, message, data) {
        return JSON.stringify({
            errno: errno,
            message: message,
            data: data
        });
    },

    webok: function (data, message) {
        var res = {errno: 0};
        if (data) {
            res.data = data;
        }
        if (message) {
            res.message = message;
        }
        return JSON.stringify(res);
    },
    randomInt: function (max) {
        var rdm = Math.random();
        var base = 1 / max;
        for (var i = 0; i < max; i++) {
            if (rdm >= i * base && rdm < (i + 1) * base) {
                return i;
            }
        }
        return -1;
    },
    randomInt2: function (max) {
        var rdm = Math.random();
        return parseInt(rdm * max);
    },
    postJson: function (url, data, callback) {
        var jUrl = require('url').parse(url);
        var postData = JSON.stringify(data);
        console.log(postData);
        var options = {
            hostname: jUrl.hostname,
            port: jUrl.port,
            path: jUrl.path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
                //console.log(statusCode, body);
                if (statusCode >= 200 && statusCode < 300)
                    callback(null, body);
                else
                    callback(share.error(-500, `远程服务器返回错误`, body));
            })
        });
        req.on('error', function (e) {
            console.trace();
            callback(share.error(-500, e.message));
        });
        req.write(postData);
        req.end();
        req.setTimeout(5000, function () {
            callback(share.error(-408, "Service is timeout."));
        });

    },
    postUrl: function (url, data, callback) {
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
                //console.log(statusCode, body);
                if (statusCode >= 200 && statusCode < 300)
                    callback(null, body);
                else
                    callback(share.error(-500, `远程服务器返回错误`, body));
            })
        });

        req.on('error', function (e) {
            console.trace();
            callback(share.error(-500, e.message));
        });
        req.write(postData);
        req.end();
        req.setTimeout(5000, function () {
            callback(share.error(-408, "Service is timeout."));
        });
    },

    getUrl: function (url, callback) {
        var req = http.get(url, function (res) {
            var statusCode = res.statusCode;

            res.setEncoding('utf8');
            var body = "";
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                if (statusCode >= 200 && statusCode < 300)
                    callback(null, body);
                else
                    callback(share.error(-500, `远程服务器返回错误`, JSON.parse(body)));
            });
        });
        req.on('error', function (e) {
            callback(share.error(-500, e.message));
        });

        req.setTimeout(5000, function () {
            callback(share.error(-408, "Service timeout."));
        });
    },

    log: function (msg) {
        console.log(`${share.formatDate(new Date())}`);
        console.log(msg);
    },
    formatDate: function (date) {
        return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }

};

module.exports = share;
