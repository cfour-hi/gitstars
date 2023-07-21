# 使用 Node.js 的官方基础镜像
FROM node:14-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json 到工作目录
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制其余的源代码文件到工作目录
COPY . .

# 暴露端口 3000，这应该是你的应用程序监听的端口
EXPOSE 3000

# 启动命令
CMD ["node", "index.js"]
