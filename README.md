# MOD

[![npm version](https://badge.fury.io/js/micro-mod.svg)](https://badge.fury.io/js/micro-mod)
[![GitHub license](https://img.shields.io/github/license/ZxBing0066/micro-mod.svg)](https://github.com/ZxBing0066/micro-mod/blob/master/LICENSE)
[![GitHub tag](https://img.shields.io/github/tag/ZxBing0066/micro-mod.svg)](https://GitHub.com/ZxBing0066/micro-mod/tags/)
[![Publish workflow](https://github.com/ZxBing0066/micro-mod/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/ZxBing0066/micro-mod/actions/workflows/npm-publish.yml) [![Join the chat at https://gitter.im/rapiop-mod/community](https://badges.gitter.im/rapiop-mod/community.svg)](https://gitter.im/rapiop-mod/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

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

-   [官网地址](https://www.heyfe.org/micro-mod/)
-   [快速上手](https://www.heyfe.org/micro-mod/#/quickStart)
-   [背景](https://www.heyfe.org/micro-mod/#/background)
-   [API 定义](https://www.heyfe.org/micro-mod/#/api)
-   [Resolver](https://www.heyfe.org/micro-mod/#/resolver)
    -   [amd](https://www.heyfe.org/micro-mod/#/resolver/amd)
    -   [cjs](https://www.heyfe.org/micro-mod/#/resolver/cjs)
    -   [global](https://www.heyfe.org/micro-mod/#/resolver/global)
    -   [css-lazy](https://www.heyfe.org/micro-mod/#/resolver/css-lazy)
    -   [style-lazy](https://www.heyfe.org/micro-mod/#/resolver/style-lazy)
    -   [wasm](https://www.heyfe.org/micro-mod/#/resolver/wasm)
-   [开发](https://www.heyfe.org/micro-mod/#/develop)
-   [使用案例](https://www.heyfe.org/micro-mod/#/usage)
    -   [主题切换](https://www.heyfe.org/micro-mod/#/usage/theme)
    -   [按需加载 polyfill](https://www.heyfe.org/micro-mod/#/usage/polyfill)
