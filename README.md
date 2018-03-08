# Vue 版本 Gitstars

> 正式环境应用源码

## 技术栈

- vue
- vue-router
- vuex
- element-ui
- axios
- vuedraggable (sortablejs)
- vue-i18n

## 数据结构

### Tag

目前有三种类别的标签：默认、自定义和语言

- 默认标签成员有两个：全部（all）和未标签（untagged）
- 自定义标签为用户添加
- 语言标签是 repository language

``` js
{ id: Number, name: String, repos: Array }

// repos 成员是 repository id
```

### repository

repository 的数据都来自 Github API 返回结果，包含一系列自身属性，Gitstars 会添加一个新属性 _customTags 保存 reposigory 所拥有的自定义标签集合。

``` js
{ id: Number, _customTags: Array, ... }

// _customTags 成员是 自定义标签（引用集合）
```
