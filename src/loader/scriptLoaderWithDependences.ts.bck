export interface DependenceShape {
    dependences: string[];
    files: string[];
}

export interface DependenceMap {
    [key: string]: DependenceShape;
}

export const scriptLoad = (
    files: string[],
    cacheFirst: boolean,
    onError?: (e: Error) => void,
    dependences?: string[],
    dependencesMap?: DependenceMap
) => {
    const load = (files: string[], dependences: string[], execOrder?: boolean): Promise<any> => {
        const dependenceQueue: Promise<any>[] = [];
        dependences &&
            dependences.forEach(dependence => {
                if (!dependence) return;
                let files: string[], dependences: string[];
                let dependenceInfo = dependencesMap[dependence];
                if (!dependenceInfo) {
                    dependenceInfo = {
                        files: [dependence],
                        dependences: []
                    };
                }
                files = dependenceInfo.files;
                dependences = dependenceInfo.dependences;
                dependenceQueue.push(load(files, dependences));
            });

        const fileQueue: Promise<any>[] = [];
        // load dependences job
        let dependenceJob = Promise.all(dependenceQueue);
        // if files is empty
        if (!files || !files.length) return dependenceJob;
        // if there is no dependences, don't cache first file
        if (!dependenceQueue.length) {
            // exec with file order
            if (execOrder) {
                let restFiles = files.slice(1);
                let preJob = loadScript(files[0]);
                restFiles.forEach(file => {
                    preJob = Promise.all([cacheFirst && cacheScript(file), preJob]).then(() => loadScript(file));
                });
                fileQueue.push(preJob);
            } else {
                files.forEach(file => {
                    fileQueue.push(loadScript(file));
                });
            }
        } else {
            if (execOrder) {
                let preJob = dependenceJob;
                files.forEach(file => {
                    preJob = Promise.all([cacheFirst && cacheScript(file), preJob]).then(() => loadScript(file));
                });
                fileQueue.push(preJob);
            } else {
                files.forEach(file =>
                    fileQueue.push(
                        Promise.all([cacheFirst && cacheScript(file), dependenceJob]).then(() => loadScript(file))
                    )
                );
            }
        }
        return Promise.all(fileQueue);
    };
    return load(files, dependences, true).catch(onError);
};
