## UMD 模块兼容

如模块需要同时兼容 `mod` 和 `umd` 方式，但又不确定使用方是否使用 `amd resolver`。

```js
(function (global, factory) {
    if (global.mod) {
        global.mod.import('dep').then(dep => {
            var module = factory(dep);
            global.mod.export('module-name', module);
        });
        return;
    }
    typeof exports === 'object' && typeof module !== 'undefined'
        ? factory(exports, require('react'))
        : typeof define === 'function' && define.amd
        ? define(['exports', 'dep'], factory)
        : ((global = global || self), factory((global.module = {}), global.dep));
})(this, function (exports, dep) {
    // code
});
```

## mod 和 webpack

### mod 加载模块后，作为 webpack 全局包使用

> 常见于跨项目模块共享，抽离公共模块，配合 webpack，让各项目均可方便调用公共模块。

app.js

```js
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(<div>Hello React</div>, document.querySelector('#app'));
```

1. 添加项目依赖文件

    dep.js

    ```js
    module.exports = ['react', 'react-dom'];
    ```

2. 修改入口文件如下，引入 mod

    entry.js

    ```js
    import mod from '@rapiop/mod';
    import { moduleMap as modules } from '@rapiop/mod/lib/module';

    import dep from './dep';

    window.mod = mod;
    window.__GLOBAL_MOD_MODULES__ = modules;

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
        await mod.import(dep);
        // 原入口文件在 import 完成后加载
        require('app.js');
    })();
    ```

3. webpack 中配置

    webpack.config.js

    ```js
    const deps = require('./dep.js');
    const modDepExternals = {};
    deps.forEach(dep => {
        modDepExternals[dep] = ['__GLOBAL_MOD_MODULES__', dep];
    });
    webpackConfig.externals = {
        ...webpackConfig.externals,
        ...modDepExternals
    };
    ```

demo

<iframe src="https://codesandbox.io/embed/practical-bose-js3lg?fontsize=14&hidenavigation=1&theme=dark"
    style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
    title="practical-bose-js3lg"
    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

### 使用 webpack 将多个包打包进一个文件

> 方便自行管理文件拆包、分包，无需关注模块管理。

react.js

```js
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

mod.export('react', React);
mod.export('react-dom', ReactDOM);
mod.export('prop-types', PropTypes);
```

depMap.js

```js
module.exports = {
    'react-dom': 'react',
    'prop-types': 'react'
};
```
