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
            if (PendingRequest.has(options.url)) {
                return await PendingRequest.get(options.url).promise
            }
            PendingRequest.set(options.url, new Deferred())
        }
    },

    onResponse: (options: RequestOptions, response: Response) => {
        if (options.method.toLowerCase() == 'get' && PendingRequest.has(options.url)) {
            PendingRequest.get(options.url).resolve(response.clone())
            PendingRequest.delete(options.url)
        }
    },

    onNetworkError(options: RequestOptions) {
        PendingRequest.get(options.url)?.reject({ message: 'Network error' })
        PendingRequest.delete(options.url)
    }
} 