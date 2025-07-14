# 项目根目录下运行
# docker build -t gitstars -f docker/Dockerfile .
FROM node:18-alpine
WORKDIR /app

# 复制包管理文件并安装依赖（项目使用pnpm）
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# 复制项目源码并构建
COPY . .
COPY ./docker/start.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start.sh && touch /var/log/gitstars.log /var/log/express.log

ENTRYPOINT [ "start.sh" ]


