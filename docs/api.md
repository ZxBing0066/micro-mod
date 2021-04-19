# API 定义

## import

### mod.import(url)

从地址拉取文件并执行文件，由于无模块名，适用于入口文件，或立执行文件，加载完成后即返回

```js
await mod.import('https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js');
console.log(window.$);
```

### mod.import(moduleName)

从 config 中查找对应的 module，并进行加载，会等待模块注册完成，如果模块文件及其依赖文件都加载完成后一定时间（默认 5s，可通过 config 进行配置）内未返回，则抛出 timeout 错误。

```js
mod.config({
    modules: {
        moduleA: 'a/moduleA'
    }
});
const moduleA = await mod.import('moduleA');
console.log(moduleA);
```

### mod.import((url|moduleName)[])

批量加载模块/脚本

```js
mod.config({
    modules: {
        moduleA: 'a/moduleA',
        moduleB: 'b/moduleB'
    }
});
const [moduleA, moduleB] = await mod.import(['moduleA', 'moduleB']);
console.log(moduleA, moduleB);
```

## export

### mod.export(moduleName, module)

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

service-module

```js
(async () => {
    // service 模块需要初始化，等待初始化完成后抛出，避免每个模块都需要等待调用初始化
    await service.init();
    mod.export('service', service);
})();
```

usage

```js
mod.config({
    service: 'service.js'
});

const service = await mod.import('service');
```

## throw

### mod.throw(moduleName, error)

模块代码异常时显式抛出，适用于模块代码运行失败、初始化失败等情况，方便模块错误上报、排查、处理

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
        mod.export('module', { config });
    } catch (e) {
        mod.throw('module', e);
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

### timeout

模块文件、依赖加载完成后还没有注册的等待超时时间，超过后会报模块加载错误

```js
mod.config({ timeout: 10000 });
// 模块加载完成后 10s 内未注册，将会抛出超时错误

try {
    await mod.import('module');
} catch (e) {
    console.error(e);
    sentry.report(e);
}
```

### baseUrl

模块地址的基准 url，模块路径为相对地址时会与 baseUrl 进行拼接

```js
mod.config({
    baseUrl: 'https://cdn.site.com/',
    modules: {
        module: 'module.js'
    }
});

// 会加载文件: 'https://cdn.site.com/module.js'
const module = await mod.import(module);
```

### modules

-   string 模块地址

    ```js
    mod.config({
        modules: {
            react: 'https://https://unpkg.com/react@17/umd/react.production.min.js'
        }
    });
    ```

-   多模块地址

    一个模块可能打成了多个文件包

    ```js
    mod.config({
        modules: {
            module: ['module_file1.js', 'module_file2.js']
        }
    });
    ```

-   复杂模块定义

    模块可能是 css、或者存在依赖或是特别的类型

    -   存在 css 文件

    ```js
    mod.config({
        modules: {
            module: {
                js: 'module.js',
                css: ['css1.css', 'css2.css']
            }
        }
    });
    ```

    -   依赖

    预先声明依赖，会在模块记载时并行加载依赖模块，提高加载并发、速度，需要注意在模块代码中等待依赖加载完成再去执行代码。

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
