# @rapiop/mod

A custom module loader support javascript modules and css modules.

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
