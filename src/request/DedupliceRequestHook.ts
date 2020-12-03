import { RequestHook, RequestOptions } from "./Request"



export const PendingRequest = new Map<string, {
    process?: Promise<any>,
    done: Function,
    error: Function
}>()

export const DedupliceRequestHook: RequestHook = {

    beforeRequest: async (options: RequestOptions) => {
        if (options.method.toLowerCase() == 'get') {


            if (PendingRequest.has(options.uri)) {

                const { process, error } = PendingRequest.get(options.uri)
                const response = await process
                return response
            }


            const process = new Promise((done, error) => PendingRequest.set(options.uri, { done, error }))
            PendingRequest.get(options.uri).process = process
        }
    },

    onResponse: (options: RequestOptions, response: Response) => {
        if (options.method.toLowerCase() == 'get' && PendingRequest.has(options.uri)) {
            const { done } = PendingRequest.get(options.uri)
            done(response.clone())
            PendingRequest.delete(options.uri)
            return response.clone()
        }
    },


    onNetworkError(options: RequestOptions) {
        PendingRequest.delete(options.uri)
    }
} 