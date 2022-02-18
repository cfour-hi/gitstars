FROM node:16.14.0
COPY ./ /app
WORKDIR /app
RUN npm config set registry https://registry.npm.taobao.org && npm install && npm run build

FROM nginx:1.21.6-alpine
RUN mkdir /app
COPY --from=0 /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
