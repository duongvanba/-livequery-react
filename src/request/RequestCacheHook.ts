import { get_request_id } from "./get_request_id"
import { RequestHook, RequestOptions } from "./Request"



const Cache = new Map<string, Response>()



export const RequestCacheHook: RequestHook = {

    beforeRequest(options: RequestOptions) {
        if (options.method.toLowerCase() == 'get' && options.Vcache?.use) {
            const id = get_request_id(options)
            const value = Cache.get(id)
            if (value) return value
        }
    },

    onResponse(options: RequestOptions, response: Response) {
        if (options.method.toLowerCase() == 'get' && options.Vcache?.update) {
            const id = get_request_id(options)
            Cache.set(id, response)
        }
    }
}