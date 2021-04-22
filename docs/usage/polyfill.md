# 通过 mod 按照浏览器环境加载 polyfill

按照当前浏览器环境，通过 `mod` 加载需要的 `polyfill`。

## 代码

```js
mod.config({
    promise: {
        js: '//cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js',
        type: 'immediate'
    },
    fetch: {
        js: '//cdn.jsdelivr.net/npm/js-polyfills@0.1.43/fetch.js',
        type: 'immediate'
    }
});

const polyfillList = [];
if (window.Promise) polyfillList.push('promise');
if (window.fetch) polyfillList.push('fetch');

// 加载需要的 polyfill 后运行 app
mod.import(polyfillList).then(() => {
    require('app');
});
```
