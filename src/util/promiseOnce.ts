import pendingFactory from './pendingFactory';
import { AnyFunction } from '../interface';

export default func => {
    const dataMap: {
        [key: string]: {
            // loading success error
            state?: 1 | 2 | 3;
            data?: Error | unknown;
        };
    } = {};
    const queueMap: {
        [key: string]: {
            ready: AnyFunction;
            error: AnyFunction;
        }[];
    } = {};

    return async (key: string, ...args: unknown[]) => {
        if (dataMap.hasOwnProperty(key)) {
            const { state, data } = dataMap[key];
            switch (state) {
                case 1: {
                    const [pending, ready, error] = pendingFactory();
                    if (!queueMap.hasOwnProperty(key)) {
                        queueMap[key] = [];
                    }
                    queueMap[key].push({
                        ready,
                        error
                    });
                    return await pending;
                }
                case 2: {
                    return data;
                }
                case 3: {
                    throw data;
                }
            }
        }
        try {
            dataMap[key] = {
                state: 1
            };
            const result = await func(key, ...args);
            dataMap[key] = {
                state: 2,
                data: result
            };
            if (queueMap.hasOwnProperty(key)) {
                queueMap[key].forEach(({ ready }) => {
                    ready(result);
                });
                delete queueMap[key];
            }
            return result;
        } catch (e) {
            dataMap[key] = {
                state: 3,
                data: e
            };
            if (queueMap.hasOwnProperty(key)) {
                queueMap[key].forEach(({ error }) => {
                    error(e);
                });
                delete queueMap[key];
            }
            throw e;
        }
    };
};
