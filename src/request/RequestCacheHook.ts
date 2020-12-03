import { RequestHook, RequestOptions } from "./Request"



const Cache = new Map<string, Response>()



export const RequestCacheHook: RequestHook = {

    beforeRequest(options: RequestOptions) {
        if (options.method.toLowerCase() == 'get' && options.Vcache?.use) {
            const value = Cache.get(options.uri)
            if (value) return value
        }
    },

    onResponse(options: RequestOptions, response: Response) {
        if (options.method.toLowerCase() == 'get' && options.Vcache?.update) {
            Cache.set(options.uri, response)
        }
    }
}