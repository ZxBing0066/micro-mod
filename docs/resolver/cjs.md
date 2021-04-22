# cjs resolver

`cjs resolver` 能让 `mod` 支持 `cjs` 模块，适用于使用常见的 `cjs` 包，需要注意模块的依赖。

## 注册解析器

### npm 包

```js
import mod from '@rapiop/mod';
// 导入 cjs 支持
import cjsResolver from '@rapiop/mod/lib/resolver/cjs';
// 注册模块类型解析器
mod.registerModuleResolver(cjsResolver);
```

### CDN

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>mod</title>
        <script src="https://cdn.jsdelivr.net/npm/@rapiop/mod@0.1.13/dist/mod.min.js"></script>
        <!-- 添加 cjs 支持 -->
        <script src="https://cdn.jsdelivr.net/npm/@rapiop/mod@0.1.13/dist/resolver-cjs.min.js"></script>
        <script src="app.js"></script>
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
```

## 使用

```js
// 注册 cjs 模块
mod.config({
    modules: {
        'object-assign': {
            js: '//cdn.jsdelivr.net/npm/object-assign@4.1.1/index.js'
        },
        'scheduler': {
            js: '//cdn.jsdelivr.net/npm/scheduler@0.20.2/cjs/scheduler.development.js',
            type: 'csj'
        },
        'scheduler/tracing': {
            js: '//cdn.jsdelivr.net/npm/scheduler@0.20.2/cjs/scheduler-tracing.development.js',
            type: 'csj'
        },
        react: {
            js: '//cdn.jsdelivr.net/npm/react@17.0.2/cjs/react.development.js',
            type: 'cjs',
            dep: ['object-assign']
        },
        'react-dom' {
            js: '//cdn.jsdelivr.net/npm/react-dom@17.0.2/cjs/react-dom.development.js',
            type: 'cjs',
            dep: ['object-assign', 'react', 'scheduler', 'scheduler/tracing']
        }
    }
});

// 引用模块
mod.import(['react', 'react-dom']).then(([React, ReactDOM]) => {
    console.log(React, ReactDOM);
});
```
