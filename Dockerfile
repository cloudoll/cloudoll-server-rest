FROM node:11.1.0


#RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
#RUN npm install -g pm2

RUN mkdir /logs
RUN mkdir /app
COPY . /app
WORKDIR /app
RUN npm install

ENTRYPOINT [ "nohup", "node", "index.js", "&>/logs/start.log&" ]


# docker build -t cloudoll-server-rest:0.0.1 .
# docker run -i -t --rm cloudoll-server-rest:0.0.1 /bin/bash
# docker run -p 8801:8801 -d --name cloudoll-server-rest cloudoll-server-rest:0.0.1