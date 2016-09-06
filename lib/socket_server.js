let net  = require("net");


var port = 2345;

var regServer = net.createServer((socket)=> {
  console.log('有客户端请求连接进入，等待身份认证...');

  socket.on('end', ()=> {
    console.log(socket.serviceName || "未命名", '微服务已经退出');
  });

  socket.on('data', (data)=> {
    var lala           = JSON.parse(data.toString());
    socket.serviceName = lala.name;
    console.log(data.toString());
  });
});

regServer.on('error', (err)=> {
  err.trace();
});

regServer.listen(port, ()=> {
  console.log('注册服务已经启动，监听端口：', port);
});
// var server = net.createServer(function(connection) {
//   console.log('有TCP客户端连接进入');
//   connection.secret = '123456';
//   connection.on('end', function() {
//     console.log('客户端连接断开');
//   });
//
//   connection.on("data", function () {
//
//   });
//   //向客户端写入数据
//   //connection.write('hello\r\n');
//   //将客户端发来的数据原样pipe返回
//   //connection.pipe(connection);
// });
//
// //TCP服务器开始端口监听
// server.listen(2345, function() {
//   console.log('TCP服务启动');
// });