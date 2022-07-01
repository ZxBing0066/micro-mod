# json resolver

`json resolver` 能让 `mod` 支持加载 `JSON` 模块。

## 注册解析器

### npm 包

```js
import mod from 'micro-mod';
// 导入 json 支持
import jsonResolver from 'micro-mod/lib/resolver/json';
// 注册模块类型解析器
mod.registerModuleResolver(jsonResolver);
```

### CDN

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>mod</title>
        <script src="https://cdn.jsdelivr.net/npm/micro-mod/dist/mod.min.js"></script>
        <!-- 添加 json 支持 -->
        <script src="https://cdn.jsdelivr.net/npm/micro-mod/dist/resolver-json.min.js"></script>
        <script src="app.js"></script>
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
```

## 使用

```js
// 注册 json 模块
mod.config({
    modules: {
        jsonData: {
            file: 'https://cdn.jsdelivr.net/npm/micro-mod/package.json',
            type: 'json'
        }
    }
});

// 引用模块
mod.import('jsonData').then(jsonData => {
    console.log(jsonData);
});
```

<iframe src="https://codesandbox.io/embed/mod-resolver-json-gssh7?fontsize=14&hidenavigation=1&theme=dark"
    style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
    title="mod resolver json"
    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>
