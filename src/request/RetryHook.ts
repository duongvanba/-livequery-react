import { Request, RequestHook, RequestOptions } from "./Request";



export const RetryHook: RequestHook = {

    onResponse(options, response) {
        if (!response.ok && response.status >= 500 && options.retry > 0) {
            console.log(`Error response, remain ${options.retry} retry times`)
            options.retry--
            return Request(options)
        }
    },

    onNetworkError(options: RequestOptions) {

        if (options.retry > 0) {
            console.log(`Network error retry, remain ${options.retry} retry`)
            options.retry--
            return Request(options)
        }
    }
}