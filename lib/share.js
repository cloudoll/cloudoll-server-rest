var http = require('http');

var share = {
  error: function (errno, message, data) {
    var xerror = new Error(message);
    xerror.errno = errno;
    xerror.errText = message;
    return xerror;
  },

  webok: function (data, message) {
    var res = { errno: 0 };
    if (data) {
      res.data = data;
    }
    if (message) {
      res.message = message;
    }
    return JSON.stringify(res);
  },
  wrapBody: function (callback, body) {
    if (typeof body == 'string') {
      body = JSON.parse(body);
    }
    if (body.errno != 0) {
      var err = new Error(body.errText);
      err.errno = body.errno;
      err.errText = body.errText;
      err.service = body.service || "unknown-service";
      callback(err);
    } else {
      callback(null, body);
    }
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
    // console.log(postData);
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
          callback(share.error(-500, `远程服务器返回错误`));
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
          callback(share.error(-500, `远程服务器返回错误`));
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
    console.log(`${share.formatDate(new Date())} ${msg}`);
    // console.log(msg);
  },
  toTwo: function (n) {
    return ("0" + n).slice(-2);
  },
  formatDate: function (date) {
    return "" + date.getFullYear() + "-" +
      this.toTwo(date.getMonth() + 1) + "-" +
      this.toTwo(date.getDate()) + " " +
      this.toTwo(date.getHours()) + ":" +
      this.toTwo(date.getMinutes()) + ":" +
      this.toTwo(date.getSeconds()) + "." + date.getMilliseconds();

    //return `${ + 1}-${(date.getMonth() + 1).toFixed(2)}-${.toFixed(2)} ${date.getHours().toFixed(2)}:${date.getMinutes().toFixed(2)}:${date.getSeconds().toFixed(2)}`;
  }

};

module.exports = share;
