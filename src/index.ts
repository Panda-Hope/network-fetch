import axios, {
  AxiosRequestConfig,
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  Method,
} from 'axios';

interface ErrorHandler {
  (e: AxiosError, ...args: any): void
}

/*
 * NetworkState Class Global Configuration
 * */
export interface NetConfig {
  errorHandler?: ErrorHandler, // Global Error Handler, Use For Catch Each Error Which NetAction Not Handle
  beforeRequest?: (data: any) => any, // BeforeRequest Function Use To Deal Post Data Before Request Send
  afterResponse?: (res:AxiosResponse<any>) => void // AfterResponse Function Use To Deal With Global Response Data
}

/*
 * NetAction Uses Just Like A Axios Action,
 * Which Essentially Define A Axios Api Just Use A Object Likely Form, But Not Like A Axios Likely Api
 * */
export interface NetAction {
  url: string,
  name: string, // Action name, use for fetch api
  type: Method,
  config?: AxiosRequestConfig,
  errorHandler?: ErrorHandler,
  needCache?: boolean
}

/*
 * NetActionObject Is A Object Which Will Be Stuffed With NetAction And State( Which That Is Api Data ),
 * And NetAction's Name Will Be Used As Key
 * */
export interface NetActionObject {
  [key: string]: {
    state?: any,
    isStating?: boolean
  } & NetAction
}

class NetworkState {
  readonly NetActionObject: NetActionObject;

  readonly http: AxiosInstance;

  readonly netConfig: NetConfig;

  constructor(actions: NetAction[], netConfig?: NetConfig, axiosConfig?: AxiosRequestConfig) {
    this.NetActionObject = {};
    actions.forEach((action) => {
      this.NetActionObject[action.name] = action;
    });

    this.http = axios.create(axiosConfig);
    this.netConfig = netConfig || {};
  }

  async fetch<T>(name: string, params?: any): Promise<AxiosResponse<T>> {
    const action = this.NetActionObject[name];

    if (!action) throw new Error(`NetAction: '${name}' Not Exist`);

    /* Convert Params To Data When Not Is Get, For A Convenience。And Deal Data Before Request */
    const reqParams = this.netConfig.beforeRequest ? this.netConfig.beforeRequest(params) : params;
    const data = action.type === 'get' ? { params: reqParams } : { data: reqParams };

    /*
     *  NetworkState Error Handler, First It Will Be Captured By A NetAction ErrorHandler
     *  Then It Will Be Bubbling To Global ErrorHandler If NetAction Throw It Again
     *  */
    try {
      try {
        const res = await this.http({
          method: action.type,
          url: action.url,
          ...data,
          ...action.config,
        });

        if (action.needCache) {
          action.state = res;
          action.isStating = true;
        }

        if (this.netConfig.afterResponse) this.netConfig.afterResponse(res);
        return res;
      } catch (e) {
        if (typeof action.errorHandler === 'function') {
          action.errorHandler(e);
          return e;
        }
        throw e;
      }
    } catch (e) {
      if (this.netConfig.errorHandler) this.netConfig.errorHandler(e);
      return e;
    }
  }

  getCache<T>(name: string): AxiosResponse<T> | void {
    const action = this.NetActionObject[name];

    if (!action) throw new Error(`NetAction: '${name}' Not Exist`);
    return action.state;
  }

  /*
   * Check If State Data Has Been Cached
   * */
  isStating(name: string): boolean {
    const action = this.NetActionObject[name];

    if (!action) throw new Error(`NetAction: '${name}' Not Exist`);
    return !!action.isStating;
  }
}

export default NetworkState;
