Github 作为开发者的第一社交平台，拥有数不胜数的优秀开源项目，给工作和学习带来巨大方便，遇到自己需要或是喜爱的项目只需轻轻点击 Star 便可收入囊中。

Star is easy，可随着 Stars Repositories 增长和时间流逝，在需要使用到某个项目时难免记不清叫什么，而 Github 又只提供简单的搜索，找到目标 Star Repositorie 竟也成了件小小的麻烦事。

所以拥有自己的 Github Stars Repositories Manager 也算是开发者的必备需求。

之前有使用过市面上的一些 Github Stars Repositories Manager，比如 [Astral](https://app.astralapp.com)，虽说能用，但总觉得不顺手、不好用。

Gitstars 由此诞生 🎉

# Gitstars

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![GitHub license](https://img.shields.io/github/license/Monine/gitstars.svg)](https://github.com/Monine/gitstars/blob/master/LICENSE)

> 每个开发者都该拥有的 Github Stars Repositories Manager

欢迎进入 [https://monine.github.io/gitstars/](https://monine.github.io/gitstars/) 体验畅玩，更欢迎体验之后在 [Issues](https://github.com/Monine/gitstars/issues) 提供建议。

![github-stars-manager](http://oh8wftuto.bkt.clouddn.com/github-stars-manager.jpg)

*感谢 [imsun](https://github.com/imsun) 提供获取 access token 服务*

Gitstars 使用 Vue v2.5.2 开发，因为简单，所以也就没有 vue-router 和 vuex 的立足之地，UI 层按需使用 Element-UI v2.0.1，HTTP 使用 axios v0.17.0，所有数据通过 Github API v3 获取，界面风格模仿 [Astral](https://app.astralapp.com)。

你可能会好奇，管理数据保存在哪？请看下图：

![gitstars-gists-gitstars-json](http://oh8wftuto.bkt.clouddn.com/gitstars-gists-gitstars-json.jpg)

管理数据就是一份 JSON 文件，增删改查都是对这份 JSON 文件的操作，除此之外，没有任何其它需要关心的。

但是，每次使用从 Github API 获取管理数据相对较慢，而且从 Github API 获取的数据都会有 60 秒的缓存（可查看 Response Header Cache-Control 字段），也就是说你修改了管理数据后刷新页面会发现依然是修改之前的数据，为此我有邮件询问 Github 如何取消缓存，回复是无法取消...

![github-api-replay-cache-control](http://oh8wftuto.bkt.clouddn.com/github-api-replay-cache-control.jpg)

因此为了解决此处体验问题，使我想到一个就算没有上述问题也应该做的一项优化：**把管理数据同步保存在 localStorage 内**

这很有必要，Gitstars 做到了，不仅是你的管理数据，其它的一些不变的数据也同样会保存在 localStorage 内，避免每次打开使用都从 Github API 获取这些内容，这也提升了页面内容的加载速度。

## LICENSE

MIT
