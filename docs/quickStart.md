# 快速上手

## 介绍

一个简单、轻量、无侵入的模块加载、管理库。

-   多项目打包工具、体系不通，想要共享模块怎么办？
-   不想把模块都单独文件打包，想要自己管理分包怎么办？
-   模块必须要等待初始化才可用，不能在加载完成后立刻使用怎么办？

## 安装 & 引入

### 使用 npm 包

```bash
npm install micro-mod
```

```js
import mod from 'micro-mod';
// 导入 amd 支持
import amdResolver from 'micro-mod/lib/resolver/amd';
// 注册模块类型解析器
mod.registerModuleResolver(amdResolver);
```

### 使用 CDN 外链

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>mod</title>
        <script src="https://cdn.jsdelivr.net/npm/micro-mod@0.1.13/dist/mod.min.js"></script>
        <!-- 添加 amd 支持 -->
        <script src="https://cdn.jsdelivr.net/npm/micro-mod@0.1.13/dist/resolver-amd.min.js"></script>
        <script src="app.js"></script>
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
```

```js
// 使用全局变量
console.log(window.mod);
```

## 使用场景

### 引入外部包

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

<iframe src="https://codesandbox.io/embed/practical-meadow-jkzhb?fontsize=14&hidenavigation=1&theme=dark"
    style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
    title="practical-meadow-jkzhb"
    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

### 多项目模块共享

#### 单 SPA

-   在项目启动时将 mod 注入至全局，方便全局调用

    starter.js

    ```js
    import mod from 'micro-mod';
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

#### 多 SPA

-   在项目 a 中抛出模块

    a/module.js

    ```js
    import mod from 'micro-mod';
    mod.export('module', { foo: () => console.log('bar') });
    ```

-   在项目 b 中引用模块

    ```js
    import mod from 'micro-mod';
    (async () => {
        mod.config({ modules: { module: 'a/module.js' } });
        const module = await mod.import('module');
        module.foo();
    })();
    ```
