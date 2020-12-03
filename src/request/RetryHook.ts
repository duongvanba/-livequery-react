import { Request, RequestHook, RequestOptions } from "./Request";

export const RetryHook: RequestHook = {

    onNetworkError(options: RequestOptions) {
        if (options.retry > 0) {
            options.retry--
            return Request(options)
        }
    }
}