export interface AnyFunction {
    (...args: any[]): any;
}

export interface ModuleInfo {
    js?: string | string[];
    css?: string | string[];
    dep?: string | string[];
    type?: string | [string, any];
    module?: boolean;
}
export interface FinalModuleInfo {
    js: string[];
    css: string[];
    dep: string[];
    type?: string | [string, any];
    module?: boolean;
}
