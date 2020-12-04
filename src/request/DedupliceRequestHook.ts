import { get_request_id } from "./get_request_id"
import { RequestHook, RequestOptions } from "./Request"


class Deferred<T = any>{
    reject: Function
    resolve: Function
    promise: Promise<T>

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject
            this.resolve = resolve
        })
    }
}

export const PendingRequest = new Map<string, Deferred>()


export const DedupliceRequestHook: RequestHook = {

    beforeRequest: async (options: RequestOptions) => {

        if (options.method.toLowerCase() == 'get') {
            const id = get_request_id(options)
            if (PendingRequest.has(id)) return await PendingRequest.get(id).promise
            PendingRequest.set(id, new Deferred())
        }
    },

    onResponse: (options: RequestOptions, response: Response) => {

        const id = get_request_id(options)

        if (options.method.toLowerCase() == 'get' && PendingRequest.has(id)) {
            PendingRequest.get(id).resolve(response.clone())
            PendingRequest.delete(id) 
        }
    },

    // Hàm này em
    onNetworkError(options: RequestOptions) {
        const id = get_request_id(options)
        PendingRequest.delete(id)
    }
} 