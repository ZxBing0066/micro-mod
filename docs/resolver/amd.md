# amd resolver

## 使用

### npm 包

```js
import mod from '@rapiop/mod';
// 导入 amd 支持
import amdResolver from '@rapiop/mod/lib/resolver/amd';
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
        <script src="https://cdn.jsdelivr.net/npm/@rapiop/mod@0.1.13/dist/mod.min.js"></script>
        <!-- 添加 amd 支持 -->
        <script src="https://cdn.jsdelivr.net/npm/@rapiop/mod@0.1.13/dist/resolver-amd.min.js"></script>
        <script src="app.js"></script>
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
```
