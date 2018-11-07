FROM node:11-alpine

RUN mkdir /app
COPY . /app
WORKDIR /app
RUN npm install


EXPOSE 8801

# CMD node index.js
ENTRYPOINT [ "nohup", "node", "index.js", ">", "./logs/console.out.log", "2>&1", "&" ]

# ENTRYPOINT [ "startup.sh" ]


# docker build -t cloudoll/cloudoll-server-rest:0.1.7 .
# docker run -i -t --rm cloudoll/cloudoll-server-rest:0.0.1 /bin/bash
# docker run -p 8801:8801 -d --name cloudoll-server-rest cloudoll/cloudoll-server-rest:0.1.8