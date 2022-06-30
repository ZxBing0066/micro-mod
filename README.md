# MOD

[![npm version](https://badge.fury.io/js/%40rapiop%2Fmod.svg)](https://badge.fury.io/js/%40rapiop%2Fmod)
[![GitHub license](https://img.shields.io/github/license/rapiop/mod.svg)](https://github.com/rapiop/mod/blob/master/LICENSE)
[![GitHub tag](https://img.shields.io/github/tag/rapiop/mod.svg)](https://GitHub.com/rapiop/mod/tags/)
[![Publish workflow](https://github.com/rapiop/mod/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/rapiop/mod/actions/workflows/npm-publish.yml) [![Join the chat at https://gitter.im/rapiop-mod/community](https://badges.gitter.im/rapiop-mod/community.svg)](https://gitter.im/rapiop-mod/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## 安装

```bash
npm install micro-mod
```

## 引用

```js
import mod from 'micro-mod';
// 导入 amd 支持
import amdResolver from 'micro-mod/lib/resolver/amd';
// 注册模块类型解析器
mod.registerModuleResolver(amdResolver);
```

## 使用

```js
// 添加模块配置
mod.config({
    modules: {
        react: {
            type: 'amd',
            js: 'https://cdn.jsdelivr.net/npm/react@16.13.1/umd/react.production.min.js'
        },
        'react-dom': {
            type: 'amd',
            js: 'https://cdn.jsdelivr.net/npm/react-dom@16.13.1/umd/react-dom.production.min.js',
            dep: 'react'
        }
    }
});

(async () => {
    // 加载模块
    const [React, ReactDOM] = await mod.import(['react', 'react-dom']);
    // 使用模块
    ReactDOM.render(React.createElement('button', {}, 'test'), document.getElementById('app'));
})();
```

## 使用教程

-   [官网地址](https://rapiop.github.io/mod/)
-   [快速上手](https://rapiop.github.io/mod/#/quickStart)
-   [背景](https://rapiop.github.io/mod/#/background)
-   [API 定义](https://rapiop.github.io/mod/#/api)
-   [Resolver](https://rapiop.github.io/mod/#/resolver)
    -   [amd](https://rapiop.github.io/mod/#/resolver/amd)
    -   [cjs](https://rapiop.github.io/mod/#/resolver/cjs)
    -   [global](https://rapiop.github.io/mod/#/resolver/global)
    -   [css-lazy](https://rapiop.github.io/mod/#/resolver/css-lazy)
    -   [style-lazy](https://rapiop.github.io/mod/#/resolver/style-lazy)
    -   [wasm](https://rapiop.github.io/mod/#/resolver/wasm)
-   [开发](https://rapiop.github.io/mod/#/develop)
-   [使用案例](https://rapiop.github.io/mod/#/usage)
    -   [主题切换](https://rapiop.github.io/mod/#/usage/theme)
    -   [按需加载 polyfill](https://rapiop.github.io/mod/#/usage/polyfill)
