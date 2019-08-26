import { AxiosRequestConfig, AxiosInstance, AxiosResponse, AxiosError, Method } from 'axios';
interface ErrorHandler {
    (e: AxiosError, ...args: any): void;
}
export interface NetConfig {
    errorHandler?: ErrorHandler;
    beforeRequest?: (data: any) => any;
    afterResponse?: (res: AxiosResponse<any>) => void;
}
export interface NetAction {
    url: string;
    name: string;
    type: Method;
    config?: AxiosRequestConfig;
    errorHandler?: ErrorHandler;
    needCache?: boolean;
}
export interface NetActionObject {
    [key: string]: {
        state?: any;
        isStating?: boolean;
    } & NetAction;
}
declare class NetworkState {
    readonly NetActionObject: NetActionObject;
    readonly http: AxiosInstance;
    readonly netConfig: NetConfig;
    constructor(actions: NetAction[], netConfig?: NetConfig, axiosConfig?: AxiosRequestConfig);
    fetch<T>(name: string, params?: any): Promise<AxiosResponse<T>>;
    getCache<T>(name: string): AxiosResponse<T> | void;
    isStating(name: string): boolean;
}
export default NetworkState;
//# sourceMappingURL=index.d.ts.map