var net = require('net');

var retryTimes = 0;

function CloudollClient(options) {
  options            = options || {};
  this.port          = options.port || 2345;
  this.maxRetryTimes = options.maxRetryTimes || 20;
  this.socket        = null;

}

CloudollClient.prototype.startService = function () {
  this.socket = net.connect({port: this.port}, ()=> {
    console.log('已连接到注册服务器');

    this.sendJson({
      name   : "fuuuuuuk",
      host   : "127.0.0.1",
      port   : 7500,
      baseUri: '',
      secret : 'lalaldfafafad'
    });
  });

  this.socket.on("error", (err)=> {
    console.log('第', retryTimes, "次连接失败，重新连接...");
    if (retryTimes >= this.maxRetryTimes) {
      console.log('第', retryTimes, "次连接失败，不再重新连接，请自行重启。");
    } else {
      setTimeout(function () {
        retryTimes++;
        var client = new CloudollClient();
        client.startService();
      }, retryTimes * 1000);
    }
  });

  this.socket.on('end', ()=> {
    console.log("注册服务器关闭，断开。");
    retryTimes = 0;
    this.startService();

  });
};

CloudollClient.prototype.sendMessage = function (msg) {
  this.socket.writable && this.socket.write(msg);
};

CloudollClient.prototype.sendJson = function (json) {
  this.socket.writable && this.socket.write(JSON.stringify(json));
};
CloudollClient.prototype.sendServer = function (json) {
  this.socket.writable && this.socket.write(JSON.stringify(json));
};


var client = new CloudollClient();
client.startService();


//
// function connect() {
//   return
// }
//
// //通过端口创建客户端
// var client = connect();
//
// //data事件监听。收到数据后，断开连接
// client.on('data', function (data) {
//   console.log("recieved: ", data.toString());
//   //client.end();
// });
//
// client.on("error", (err)=> {
//   console.log("服务器连接失败，重试...");
//   setTimeout(function () {
//     client = connect();
//   }, 6000);
//   // console.trace();
// });
//
// //end事件监听，断开连接时会被触发
// client.on('end', function () {
//   console.log('已与服务器断开连接');
// });


// setTimeout(function () {
//   client && client.write(JSON.stringify(
//     {
//       name   : "fuuuuuuk",
//       host   : "127.0.0.1",
//       port   : 7500,
//       baseUri: '',
//       secret : 'lalaldfafafad'
//     }
//   ));
//
// }, 1000);