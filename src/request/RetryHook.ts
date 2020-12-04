import { Request, RequestHook, RequestOptions } from "./Request";



export const RetryHook: RequestHook = {

    onResponse(options, response) {
        if (!response.ok && response.status >= 500 && options.retry > 0) {
            options.retry--
            return Request(options)
        }
    },

    onNetworkError(options: RequestOptions) {

        if (options.retry > 0) {
            options.retry--
            return Request(options)
        }
    }
}