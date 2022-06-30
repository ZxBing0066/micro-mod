# amd resolver

`amd resolver` 能让 `mod` 支持 `amd` 模块，适用于使用常见的 `amd`、`umd` 包。

## 注册解析器

### npm 包

```js
import mod from 'micro-mod';
// 导入 amd 支持
import amdResolver from 'micro-mod/lib/resolver/amd';
// 注册模块类型解析器
mod.registerModuleResolver(amdResolver);
```

### CDN

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

## 使用

```js
// 注册 amd 模块
mod.config({
    modules: {
        react: {
            js: 'https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js',
            type: 'amd'
        },
        'react-dom' {
            js: 'https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.production.min.js',
            type: 'amd'
        }
    }
});

// 引用模块
mod.import(['react', 'react-dom']).then(([React, ReactDOM]) => {
    console.log(React, ReactDOM);
});
```
