const head = document.head || document.getElementsByTagName('head')[0];

const loadedStyleMap: { [href: string]: boolean } = {};

export const load = (href: string) => {
    if (loadedStyleMap[href]) return;
    const el = document.createElement('link');
    el.type = 'text/css';
    el.rel = 'stylesheet';
    el.href = href;
    loadedStyleMap[href] = true;
    head.appendChild(el);
    return el;
};
