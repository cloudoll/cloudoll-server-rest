# cloudeer 微服务管理注册系统

版本 0.X.X 仅仅管理了服务器的地址，端口和基础 URI。

需要结合微服务的API文档进行完整的调用。


## 服务器端

启动 项目目录下的 index.js 文件

    node index.js

启动后，等待微服务的客户端接入。


微服务启动后，请访问这个URL, 需要发起心跳访问，建议心跳间隔不要超过 9 秒。

GET /register
host: 主机地址
name: 服务名称
port: 端口
baseUri: 基础 URL



## 客户端类库

使用方法：

首先需要获取 服务器端的 配置文件，每隔一段时间需要重新下载配置文件。

示例代码如下：

    var cloudeerHost = "http://10.163.57.110:8801";

    cloudeer.loadConfigRemote(cloudeerHost);

    setInterval(function () {
        cloudeer.loadConfigRemote(cloudeerHost);
    }, 10000);


访问"代理"，其实这个不是代理访问，是直连访问，类库中提供了 API 轮询方式（平均分配），错误处理等机制。

访问原型：

    invoke: function (httpMethod, serviceName, methodUri, parameters, callback)

    // yield 方式访问
    invokeCo: function (httpMethod, serviceName, methodUri, parameters)

示例代码：

    cloudeer.invoke('POST', 'serviceName', '/test', {id: "100"}, function (err, body) {
        if (err) console.log('from client', err);
        else console.log(body);
    });