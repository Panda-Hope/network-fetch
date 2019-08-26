import axios from 'axios';
class NetworkState {
    constructor(actions, netConfig, axiosConfig) {
        this.NetActionObject = {};
        actions.forEach((action) => {
            this.NetActionObject[action.name] = action;
        });
        this.http = axios.create(axiosConfig);
        this.netConfig = netConfig || {};
    }
    async fetch(name, params) {
        const action = this.NetActionObject[name];
        if (!action)
            throw new Error(`NetAction: '${name}' Not Exist`);
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
                if (this.netConfig.afterResponse)
                    this.netConfig.afterResponse(res);
                return res;
            }
            catch (e) {
                if (typeof action.errorHandler === 'function') {
                    action.errorHandler(e);
                    return e;
                }
                throw e;
            }
        }
        catch (e) {
            if (this.netConfig.errorHandler)
                this.netConfig.errorHandler(e);
            return e;
        }
    }
    getCache(name) {
        const action = this.NetActionObject[name];
        if (!action)
            throw new Error(`NetAction: '${name}' Not Exist`);
        return action.state;
    }
    /*
     * Check If State Data Has Been Cached
     * */
    isStating(name) {
        const action = this.NetActionObject[name];
        if (!action)
            throw new Error(`NetAction: '${name}' Not Exist`);
        return !!action.isStating;
    }
}
export default NetworkState;
//# sourceMappingURL=index.js.map