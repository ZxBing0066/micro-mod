# global resolver

`global resolver` 能让 `mod` 支持懒加载全局变量模块。

## 注册解析器

### npm 包

```js
import mod from 'micro-mod';
// 导入 global 支持
import globalResolver from 'micro-mod/lib/resolver/global';
// 注册模块类型解析器
mod.registerModuleResolver(globalResolver);
```

### CDN

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>mod</title>
        <script src="https://cdn.jsdelivr.net/npm/micro-mod/dist/mod.min.js"></script>
        <!-- 添加 global 支持 -->
        <script src="https://cdn.jsdelivr.net/npm/micro-mod/dist/resolver-global.min.js"></script>
        <script src="app.js"></script>
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
```

## 使用

```js
// 注册 global 模块
mod.config({
    modules: {
        jquery: {
            js: 'https://cdn.jsdelivr.net/npm/jquery/dist/jquery.min.js',
            // 第二个参数为模块的全局名称
            type: ['global', '$']
        }
    }
});

// 引用模块
mod.import('jquery').then($ => {
    console.log($, window.$);
});
```

`global` 会在 `import` 时加载文件，加载完成后根据传入的全局名称取出模块后返回。
