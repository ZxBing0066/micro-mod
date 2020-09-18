mod.import('module-dep').then(dep => {
    mod.export('module', {
        name: 'module',
        dep: dep
    });
});
