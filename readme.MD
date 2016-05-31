# 云鹿 cloudeer 微服务管理注册系统

本系统是微服务的注册器和调度工具。

当前可以管理服务器的地址，端口和基础 URI。并提供了一个消费端的方法进行远程服务调用。

需要结合微服务开发者提供的 API 文档进行具体的调用。


## 服务器端（cloudeer注册中心）

启动 项目目录下的 index.js 文件

```
    node index.js
```

启动后，等待微服务的注册接入。


cloudeer服务端启动后，可以使用 /view 查看微服务列表。默认是：http://localhost:8801/view


### 注册服务

微服务启动时，需要调用注册接口, 发起心跳访问，建议心跳间隔不要超过 9 秒。

GET /register

host: 主机地址

name: 服务名称

port: 端口

baseUri: 基础 URL

sign: 签名，由于安全问题，实际生产环境下，需校验此签名

超过10秒未监测到心跳的微服务，会被调度器从列队中剔除。

### 注册方法

POST /register/methods

需要 POST 一个 json 数据到此 url，结构如d   fda

```
{
  service: "goods",
  methods: [
    {url: "/admin/1", name: '管理A', method: "POST", open: true},
    {url: "/admin/2", name: '管理A', method: "GET"},
    {url: "/admin/c", name: '管理A', method: "GET"},
    {url: "/admin/d", name: '管理A', method: "GET"},
    {url: "/admin/e", name: '管理A', method: "POST", open: true}
  ]
};
```


## 消费端工具

使用方法：

首先从 npm 下安装：

```
    npm install cloudeer --save
```


首先需要获取服务器端的配置文件，每隔一段时间需要重新下载配置文件。

示例代码如下：

```
    var cloudeerHost = "http://10.163.57.110:8801";

    cloudeer.loadConfigRemote(cloudeerHost);

    setInterval(function () {
        cloudeer.loadConfigRemote(cloudeerHost);
    }, 10000);
```

调用远程接口，这个不是代理访问，是直连访问（从消费端直接调用微服务），
此工具提供了 API 轮询方式（平均分配），错误处理等机制。

访问原型：

```
    invoke: function (httpMethod, serviceName, methodUri, parameters, callback)

    // yield 方式访问
    invokeCo: function (httpMethod, serviceName, methodUri, parameters)
```

示例代码：

```
    cloudeer.invoke('POST', 'serviceName', '/test', {id: "100"}, function (err, body) {
        if (err) console.log('from client', err);
        else console.log(body);
    });
```

