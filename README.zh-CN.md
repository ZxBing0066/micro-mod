# @rapiop/mod

一个简单、轻量的模块加载、管理库。

## import

-   mod.import(url)

从地址拉取文件并执行文件，由于无模块名，适用于入口文件，或执行文件，加载完成后即返回

-   mod.import(moduleName)

从 config 中查找对应的 module，并进行加载，会等待模块注册完成，如果模块文件及其依赖文件都加载完成后一定时间（默认 5s）内未返回，则抛出 timeout 错误。

-   mod.import((url|moduleName)[])

批量加载模块/脚本

## export

mod.export(moduleName, module)

注册模块，自带的模块语法需要手动导出模块，可以支持单文件多模块、同步加载延迟导出模块等。

## throw

mod.throw(moduleName, error)

模块抛出错误，适用于模块代码运行失败、初始化失败等情况，方便使用方抓取错误。

-   单文件中同时导出多个模块

react-module

```js
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

mod.export('react', React);
mod.export('prop-types', PropTypes);
mod.export('react-dom', ReactDOM);
```

usage

```js
mod.config({
    react: './react-module.js',
    'prop-types': {
        dep: ['react']
    },
    'react-dom': {
        dep: ['react']
    }
});

const React = await mod.import('react');
const [PropTypes, ReactDOM] = mod.import(['prop-types', 'react-dom']);
```

-   延迟导出

react

```js
import React from 'react';

mod.export('react', React);
```

react-dom

```js
(async () => {
    // 由于 react-dom 依赖 react，所以这里需要等待 react 加载完成
    await mod.import('react');
    const ReactDOM = require('react-dom');
    mod.export('react-dom', ReactDOM);
})();
```

usage

```js
mod.config({
    react: './react.js',
    'react-dom': {
        js: './react-dom.js',
        // 声明依赖可以让 react-dom 加载时提前一并加载 react，加快加载速度
        dep: ['react']
    }
});

const ReactDOM = await mod.import('react-dom');
```

## throw

mod.throw(Error, module)

模块代码异常时显式抛出，方便模块错误上报、排查、处理

usage

module.js

```js
(async () => {
    let config;
    const init = async () => {
        config = await axios.get('config.json');
    };
    try {
        await init();
        mod.export({ config }, 'module');
    } catch (e) {
        mod.throw(e, 'module');
    }
})();
```

entry.js

```js
try {
    await mod.import('module');
} catch (e) {
    console.error('module import fail: ', e);
}
```

## config

### timeout 超时时间

模块文件、依赖加载完成后还没有注册的等待时间，超过后会报模块加载错误

### baseUrl 模块地址的基准 url

模块路径为相对地址时会与 baseUrl 进行拼接

### modules 模块配置

#### string 模块地址

```js
mod.config({
    modules: {
        react: 'https://https://unpkg.com/react@17/umd/react.production.min.js'
    }
});
```

#### 多模块地址

一个模块可能打成了多个文件包

```js
mod.config({
    modules: {
        module: ['module_file1.js', 'module_file2.js']
    }
});
```

#### 复杂模块定义

模块可能是 css、或者存在依赖或是特别的类型

css 模块

```js
mod.config({
    modules: {
        module: {
            css: ['css1.css', 'css2.css']
        }
    }
});
```

依赖

```js
mod.config({
    modules: {
        module: {
            js: ['module1.js'],
            dep
        }
    }
});
```
