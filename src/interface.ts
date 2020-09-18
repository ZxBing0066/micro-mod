export interface AnyFunction {
    (...args: any[]): any;
}

export interface ModuleInfo {
    key?: string;
    js?: string | string[];
    css?: string | string[];
    dep?: string | string[];
    type?: string | [string, any];
}
export interface FinalModuleInfo {
    key?: string;
    js: string[];
    css: string[];
    dep: string[];
    type?: string | [string, any];
}

export type Module = string | string[] | ModuleInfo;

export interface Config {
    timeout?: number;
    baseUrl?: string;
    modules?: {
        [module: string]: Module;
    };
}