# 快速实现主题切换功能

现在几乎主流网站都会去适配暗色主题，借助 `mod` 的 `css-lazy resolver` 或 `style-lazy resolver`，可以快速的实现动态切换主题的功能。

`style-lazy` 和 `css-lazy` 的差异在于样式的加载和生效方式：

-   `style-lazy` 会将 `css` 作为文本在 `mod import` 时进行加载，然后在调用模块的 `use` 时将 `css` 嵌入 `style` 标签来生效样式。
-   `css-lazy` 则时在调用 `use` 时将 `css` 通过 `link` 标签来引用，故而 `use` 时才会加载，生效延时较长。

## css-lazy

### 代码

初始化

```js
mod.config({
    theme: {
        css: ['theme/header.css', 'theme/body.css'],
        type: 'css-lazy'
    },
    'dark-theme': {
        css: ['dark-theme/header.css', 'dark-theme/body.css'],
        type: 'css-lazy'
    }
});

const [theme, darkTheme] = await mod.import(['theme', 'dark-theme']);
await theme.use();

app.run();
```

切换主题

> 需要先生效新主题，再失效旧主题，否则会导致中间出现短暂的样式加载、生效间隔时间，导致页面样式消失。

```js
const switchTheme = async dark => {
    if (dark) {
        await darkTheme.use();
        await theme.unuse();
    } else {
        await theme.use();
        await darkTheme.unuse();
    }
};
```

### 演示 - bootstrap 主题切换

> 主题切换时会加载样式，有短暂等待时间，可使用 loading 优化体验

<iframe src="https://codesandbox.io/embed/mod-theme-switch-g83q6?fontsize=14&hidenavigation=1&theme=dark"
    style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
    title="mod theme switch"
    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

## style-lazy

### 代码

初始化

```js
mod.config({
    theme: {
        css: ['theme/header.css', 'theme/body.css'],
        type: 'style-lazy'
    },
    'dark-theme': {
        css: ['dark-theme/header.css', 'dark-theme/body.css'],
        type: 'style-lazy'
    }
});

const [theme, darkTheme] = await mod.import(['theme', 'dark-theme']);
await theme.use();

app.run();
```

切换主题

> 同样需要先生效新主题，再失效旧主题

```js
const switchTheme = async dark => {
    if (dark) {
        darkTheme.use();
        theme.unuse();
    } else {
        theme.use();
        darkTheme.unuse();
    }
};
```

### 演示 - bootstrap 主题切换

<iframe src="https://codesandbox.io/embed/mod-theme-switch-style-lazy-7vt2c?fontsize=14&hidenavigation=1&theme=dark"
    style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
    title="mod theme switch style-lazy"
    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>
