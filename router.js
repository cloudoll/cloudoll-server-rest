var url = require('url');
var querystring = require('querystring');

module.exports = router = {
    postActions: {},
    getActions: {},
    execute: function (req, res) {
        //var req = router.req;
        //var res = router.res;
        var myUrl = url.parse(req.url);
        var myPathName = myUrl.pathname;
        myPathName = myPathName.toLowerCase();
        var method = req.method;
        var cb;
        if (method == 'POST') {
            req.query = querystring.parse(myUrl.query);
            cb = router.postActions[myPathName];
        } else if (method == 'GET') {
            req.query = querystring.parse(myUrl.query);
            cb = router.getActions[myPathName];
        }
        if (cb) {
            var body = '';
            req.on('data', function (data) {
                body += data;
            });
            req.on('end', function () {
                if (/^[-\w]+(=[^&]*)?(&[-\w]+(=[^&]*)?)*$/.test(body)) {
                    req.body = querystring.parse(body);
                } else if (/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(body)) {
                    console.log("come here", body);
                    req.body = JSON.parse(body);
                } else {
                    req.body = body;
                }
                if (!res.body) res.body = {};

                //console.log('body', req.body);
                //console.log('query', req.query);
                res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                try {
                    cb(req, res);
                } catch (err) {
                    console.log(err);
                    res.end(JSON.stringify({
                        errno: -1,
                        message: err.message
                    }));
                }
            });
        } else {
            res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
            res.end(JSON.stringify({
                errno: -404,
                message: "this api is not found."
            }));
        }
    },
    get: function (path, callback) {
        router.getActions[path] = callback;
    },
    post: function (path, callback) {
        router.postActions[path] = callback;
    }
};