import { get_request_id } from "./get_request_id"
import { RequestHook, RequestOptions } from "./Request"



export const PendingRequest = new Map<string, {
    process?: Promise<any>,
    done: Function,
    error: Function
}>()



export const DedupliceRequestHook: RequestHook = {

    beforeRequest: async (options: RequestOptions) => {
        if (options.method.toLowerCase() == 'get') {

            const id = get_request_id(options)
            if (PendingRequest.has(id)) {

                const { process, error } = PendingRequest.get(id)
                const response = await process
                return response
            }


            const process = new Promise((done, error) => PendingRequest.set(id, { done, error }))
            PendingRequest.get(options.uri).process = process
        }
    },

    onResponse: (options: RequestOptions, response: Response) => {
        const id = get_request_id(options)
        if (options.method.toLowerCase() == 'get' && PendingRequest.has(id)) {
            const { done } = PendingRequest.get(id)
            done(response.clone())
            PendingRequest.delete(id)
            return response.clone()
        }
    },


    onNetworkError(options: RequestOptions) {
        const id = get_request_id(options)
        PendingRequest.delete(id)
    }
} 