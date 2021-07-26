# raw resolver

`raw resolver` 能让 `mod` 支持加载 `raw` 模块。

## 注册解析器

### npm 包

```js
import mod from '@rapiop/mod';
// 导入 raw 支持
import rawResolver from '@rapiop/mod/lib/resolver/raw';
// 注册模块类型解析器
mod.registerModuleResolver(rawResolver);
```

### CDN

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>mod</title>
        <script src="https://cdn.jsdelivr.net/npm/@rapiop/mod/dist/mod.min.js"></script>
        <!-- 添加 raw 支持 -->
        <script src="https://cdn.jsdelivr.net/npm/@rapiop/mod/dist/resolver-raw.min.js"></script>
        <script src="app.js"></script>
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
```

## 使用

```js
// 注册 raw 模块
mod.config({
    modules: {
        rawData: {
            file: 'raw.txt',
            type: 'raw'
        }
    }
});

// 引用模块
mod.import('rawData').then(rawData => {
    console.log(rawData);
});
```

<iframe src="https://codesandbox.io/embed/mod-resolver-raw-8qh7w?fontsize=14&hidenavigation=1&theme=dark"
    style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
    title="mod resolver raw"
    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>
