/**
 * 获取文件类型
 * @param path { string }
 * @returns {string}
 */
function getExtension(path: string = '') {
    var items = path.split('?')[0].split('.');
    return items[items.length - 1].toLowerCase();
}
/**
 * 将文件分类
 * @param files 待分类的文件列表
 */
export const classifyFiles = (files: string[]) => {
    const classifyFiles = {
        js: [] as string[],
        css: [] as string[],
        unknown: [] as string[]
    };
    const { js, css, unknown } = classifyFiles;
    files.forEach(file => {
        const ext = getExtension(file);
        switch (ext) {
            case 'js':
                js.push(file);
                break;
            case 'css':
                css.push(file);
                break;
            default:
                unknown.push(file);
                break;
        }
    });
    return classifyFiles;
};
