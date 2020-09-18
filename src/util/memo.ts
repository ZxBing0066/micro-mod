function memo<R, T extends (...args: any[]) => R>(func: T): T {
    const cache = {};
    const memoFunc = (key, ...args) => {
        if (typeof key === 'string' && cache.hasOwnProperty(key)) {
            return cache[key];
        }
        const result = func(key, ...args);
        if (typeof key === 'string') {
            cache[key] = result;
        }
        return result;
    };
    return memoFunc as T;
}

export default memo;
