import { Request, RequestHook, RequestOptions } from "./Request";



export const RetryHook: RequestHook = {

    async onResponse(options, response) {
        if (options.method.toLowerCase() == 'get' && !response.ok && response.status >= 500 && options.retry > 0) {
            for (let i = 1; i <= options.retry; i++) {
                try {
                    const { cache, ...opts } = options
                    return await fetch(options.url, opts)
                } catch (e) { }
            }
        }
    },

    async onNetworkError(options: RequestOptions) {
        if (options.method.toLowerCase() != 'get') return
        for (let i = 1; i <= options.retry; i++) {
            try {
                const { cache, ...opts } = options
                return await fetch(options.url, opts)
            } catch (e) { }
        }

    }
}