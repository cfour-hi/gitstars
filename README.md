# gitstars

> 每个程序员都该拥有的 Github Stars Repositories Manager (仓库管理器)

## 诞生记 💥

Github 作为开发者的第一社交平台，拥有数不胜数的优秀开源项目，给工作和学习带来巨大方便，遇到自己需要或是喜爱的项目只需轻轻点击 Star 便可收入囊中。

Star is easy，可随着 Stars Repositories 增长和时间流逝，在需要使用到某个项目时难免记不清叫什么，而 Github 又只提供简单的搜索，找到目标 Star Repositorie 竟也成了件小小的麻烦事。

所以拥有自己的 Github Stars Repositories Manager 也算是开发者的必备需求。

之前有使用过市面上的一些 Github Stars Repositories Manager，虽说能用，但总觉得不顺手、不好用。

gitstars 由此诞生 🍏

欢迎进入 [https://monine.github.io/gitstars/](https://monine.github.io/gitstars/) 体验畅玩，更欢迎体验之后在 [Issues](https://github.com/Monine/gitstars/issues) 提供建议。

## 如何使用

1. Fork 此项目并 clone 到本地并运行 `npm install`

2. 在 [Personal access tokens](https://github.com/settings/tokens) 创建一个拥有 Gist 访问权限的 access token

3. 把刚刚创建的 access token 一分为二写入 `static/config.json` 文件内（比如 123456 拆分为 123 和 456 分别写入 access 和 token 字段）**非常重要！**

5. 运行 `npm run build`

5. 提交你所有的修改（包括上一步打包后的文件）到远程仓库

6. 打开 `[yourname].github.io/gitstars` 成为 Github Stars Repositories Manager

## 原理



## 特性

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
