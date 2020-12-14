import { DedupliceRequestHook } from "./DedupliceRequestHook"
import { FormatHook } from "./FormatHook"
import { RequestCacheHook } from "./RequestCacheHook"
import { RetryHook } from "./RetryHook"

export type CacheOption = { use?: boolean, update?: boolean }

export type RequestOptions = Omit<RequestInit, "cache"> & {
    prefix?: string
    uri: string
    url?: string
    form?: any,
    json?: any
    retry?: number
    cache?: CacheOption,
    query?: { [key: string]: number | string | boolean }
}

export class RequestHook {
    beforeRequest?(options: RequestOptions): Promise<any> | any | void { }
    onResponse?(options: RequestOptions, response: Response): Promise<any> | any | void { }
    onNetworkError?(options: RequestOptions): Promise<any> | any | void { }
}

export async function Request<T>(opts: RequestOptions & { hooks?: RequestHook[] }) {

    const options = {
        method: 'get',
        headers: {
            ...opts.headers || {}
        },
        ...opts
    }
    const hooks = [
        ...options.hooks || [],
        FormatHook,
        DedupliceRequestHook,
        RequestCacheHook,
        RetryHook,
    ]

    let response = null
    const used_hooks = []
    for (const hook of hooks) {
        if (hook.beforeRequest) response = await hook.beforeRequest(options)
        if (response) break
        used_hooks.unshift(hook)
    }

    if (!response) {
        try {
            const { cache, ...opts } = options
            response = await fetch(options.url, opts)
        } catch (e) {
            for (const hook of used_hooks) {
                if (hook.onNetworkError) response = await hook.onNetworkError(options)
                if (response) break
            }
            if (!response) throw e

        }
    }

    for (const hook of used_hooks) {
        if (hook.onResponse) response = await hook.onResponse(options, response.clone()) || response
    }

    return response as T
}