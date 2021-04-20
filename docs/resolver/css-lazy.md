# css-lazy resolver

`css-lazy resolver` 能让 `mod` 支持懒加载 `css` 模块，模块返回值为 `{use, unuse}`，使用 `use` 可以生效 `css` 文件，使用 `unuse` 失效 `css` 文件。

## 注册解析器

### npm 包

```js
import mod from '@rapiop/mod';
// 导入 css-lazy 支持
import cssLazyResolver from '@rapiop/mod/lib/resolver/css-lazy';
// 注册模块类型解析器
mod.registerModuleResolver(cssLazyResolver);
```

### CDN

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>mod</title>
        <script src="https://cdn.jsdelivr.net/npm/@rapiop/mod@0.1.13/dist/mod.min.js"></script>
        <!-- 添加 css-lazy 支持 -->
        <script src="https://cdn.jsdelivr.net/npm/@rapiop/mod@0.1.13/dist/resolver-css-lazy.min.js"></script>
        <script src="app.js"></script>
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
```

## 使用

```js
// 注册 css-lazy 模块
mod.config({
    modules: {
        theme1: {
            css: 'theme1.css',
            type: 'css-lazy'
        },
        theme2: {
            css: 'theme2.css',
            type: 'css-lazy'
        }
    }
});

// 引用模块
mod.import(['theme1', 'theme2']).then(([theme1, theme2]) => {
    // 生效样式
    theme1.use().then(() => {
        // 样式生效
        console.log('theme1 used');
    });
});
```

`css-lazy` 在 `import` 时不会加载文件，在调用 `use` 时将 `css` 文件嵌入 `link` 标签，样式生效后 `use` 返回。