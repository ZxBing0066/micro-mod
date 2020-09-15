export const loadResources = async (
    files: string[],
    cacheFirst?: boolean,
    onError?: (e: Error) => void,
    dependences?: string[],
    dependenceMap?: DependenceMap
) => {
    if (!files || !files.length) return;
    const { js, css, unknown } = classifyFiles(files);

    await Promise.all([scriptLoad(js, cacheFirst, onError, dependences, dependenceMap), loadStyles(css)]);
    if (unknown.length) {
        console.error(`load file error with unknown file type`, unknown);
    }
};
