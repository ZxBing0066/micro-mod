const head = document.head || document.getElementsByTagName('head')[0];

type ScriptElement = HTMLScriptElement & {
    onreadystatechange: (e: Event) => void;
    readyState: 'loaded' | 'complete';
};

const scriptStateMap: { [href: string]: number } = {};

function load(path, callback) {
    var el = document.createElement('script') as ScriptElement,
        loaded;

    function handler(event) {
        if ((el.readyState && !/^c|loade/.test(el.readyState)) || loaded) return;
        el.onload = el.onreadystatechange = null;
        loaded = true;
        scriptStateMap[path] = 2;
        callback(event);
    }
    el.onload = el.onerror = el.onreadystatechange = handler;
    el.async = true;

    el.src = path;
    head.insertBefore(el, head.lastChild);
}
export { load };
