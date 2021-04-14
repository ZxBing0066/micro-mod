# 快速上手

## 介绍

一个简单、轻量、无侵入的模块加载、管理库。

## 适用场景

### 引入外部包

```js
import mod from '@rapiop/mod';
// 导入 amd 支持
import '@rapiop/mod/resolver/amd';
mod.config({
    modules: {
        react: 'https://cdn.jsdelivr.net/npm/react@16.13.1/umd/react.production.min.js',
        'react-dom': 'https://cdn.jsdelivr.net/npm/react-dom@16.13.1/umd/react-dom.production.min.js'
    }
});

```

## 安装

```sh
yarn add @rapiop/mod
```

## 使用

### 同域

-   在项目启动时将 mod 注入至全局，方便全局调用

starter.js

```js
import mod from '@rapiop/mod';

window.mod = mod;
```

-   在需要使用的模块中声明抛出内容

module.js

```js
mod.export('module', { foo: () => console.log('bar') });
```

-   在项目中使用模块

project.js

```js
(async () => {
    mod.config({ modules: { module: './module.js' } });
    const module = await mod.import('module');
    module.foo();
})();
```

### 分域

-   在项目 a 中抛出模块

module.js

```js
import mod from '@rapiop/mod';
mod.export('module', { foo: () => console.log('bar') });
```

-   在项目 b 中引用模块

```js
import mod from '@rapiop/mod';
(async () => {
    mod.config({ modules: { module: './module.js' } });
    const module = await mod.import('module');
    module.foo();
})();
```
