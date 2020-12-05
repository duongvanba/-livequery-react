import { Request, RequestHook, RequestOptions } from "./Request";



export const RetryHook: RequestHook = {

    async onResponse(options, response) {
        if (!response.ok && response.status >= 500 && options.retry > 0) {
            for (let i = 1; i <= options.retry; i++) {
                try {
                    return await fetch(options.url, options)
                } catch (e) { }
            }
        }
    },

    async onNetworkError(options: RequestOptions) {

        for (let i = 1; i <= options.retry; i++) {
            try {
                return await fetch(options.url, options)
            } catch (e) { }
        }

    }
}