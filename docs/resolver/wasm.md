# wasm resolver

`wasm resolver` 能让 `mod` 支持加载 `wasm` 模块。

## 注册解析器

### npm 包

```js
import mod from 'micro-mod';
// 导入 wasm 支持
import wasmResolver from 'micro-mod/lib/resolver/wasm';
// 注册模块类型解析器
mod.registerModuleResolver(wasmResolver);
```

### CDN

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>mod</title>
        <script src="https://cdn.jsdelivr.net/npm/micro-mod@0.1.13/dist/mod.min.js"></script>
        <!-- 添加 wasm 支持 -->
        <script src="https://cdn.jsdelivr.net/npm/micro-mod@0.1.13/dist/resolver-wasm.min.js"></script>
        <script src="app.js"></script>
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
```

## 使用

```js
// 注册 wasm 模块
mod.config({
    modules: {
        wasm: {
            file: './memory.wasm',
            type: 'wasm'
        }
    }
});

// 引用模块
(async () => {
    const bytes = await mod.import('wasm');
    var memory = new WebAssembly.Memory({ initial: 10, maximum: 100 });
    const results = await WebAssembly.instantiate(bytes, { js: { mem: memory } });
    var i32 = new Uint32Array(memory.buffer);
    for (var i = 0; i < 10; i++) {
        i32[i] = i;
    }
    console.log(results);
    var sum = results.instance.exports.accumulate(3, 10);
    console.log(sum);
})();
```
