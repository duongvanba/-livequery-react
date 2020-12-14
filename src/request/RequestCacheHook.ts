import { RequestHook, RequestOptions } from "./Request"



const Cache = new Map<string, Response>()



export const RequestCacheHook: RequestHook = {

    beforeRequest(options: RequestOptions) {
        if (options.method.toLowerCase() == 'get' && options.cache?.use) { 
            const value = Cache.get(options.url)
            if (value) return value
        }
    },

    onResponse(options: RequestOptions, response: Response) {
        if (options.method.toLowerCase() == 'get' && options.cache?.update) { 
            Cache.set(options.url, response)
        }
    }
}